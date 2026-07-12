import { NextResponse } from "next/server";
import {
  allowMissingVideoUpscalePrice,
  estimateVideoUpscaleCredits,
  hasVideoUpscalePricingConfigured,
  serializeVideoUpscaleTask
} from "../../../src/domain/jobs/videoUpscaleService";
import { createVideoUpscaleTaskSchema } from "../../../src/server/schemas";
import { getAuthContextFromRequest } from "../../../src/server/auth";
import { rechargeOrderRepository, videoJobService, videoUpscaleService } from "../../../src/server/services";
import { isPublicHttpVideoUrl } from "../../../src/domain/video/referenceResolver";

export async function GET(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  await videoUpscaleService.runDueTasks().catch(() => undefined);
  const scope = new URL(request.url).searchParams.get("scope") === "all" ? "all" : "mine";
  const tasks = videoUpscaleService
    .listTasksForCustomer(auth.user.id)
    .filter((task) => scope === "all" || !task.createdByActorId || task.createdByActorId === auth.actor.actorId)
    .map((task) => serializeVideoUpscaleTask(task));
  return NextResponse.json({
    tasks,
    capabilities: upscaleCapabilities()
  });
}

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const json = await request.json().catch(() => undefined);
  const parsed = createVideoUpscaleTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_video_upscale_request", issues: parsed.error.issues }, { status: 400 });
  }

  if (!videoUpscaleService.isProviderConfigured()) {
    return NextResponse.json(
      {
        error: "video_upscale_provider_unconfigured",
        message: "高清输出服务待接入，当前没有配置真实超分供应商。",
        capabilities: upscaleCapabilities()
      },
      { status: 503 }
    );
  }

  const source = resolveUpscaleSource(parsed.data, auth.user.id, auth.actor.actorId, request.url);
  if (!source.ok) {
    return NextResponse.json({ error: source.error, message: source.message }, { status: source.status });
  }

  const reservedCredits = estimateVideoUpscaleCredits({
    sourceResolution: source.value.sourceResolution,
    targetResolution: parsed.data.targetResolution,
    durationSeconds: source.value.durationSeconds
  });
  if (!reservedCredits && !allowMissingVideoUpscalePrice()) {
    return NextResponse.json(
      {
        error: "video_upscale_pricing_required",
        message: "高清输出价格表未配置，暂不能创建真实超分任务。",
        capabilities: upscaleCapabilities()
      },
      { status: 503 }
    );
  }

  const credits = reservedCredits ?? 0;
  if (credits > 0) {
    const account = await rechargeOrderRepository.account(auth.user.id);
    if (account.balanceCredits < credits) {
      return NextResponse.json({ error: "insufficient_credits", requiredCredits: credits, account }, { status: 402 });
    }
  }

  const task = videoUpscaleService.createTask({
    customerId: auth.user.id,
    createdByActorId: auth.actor.actorId,
    createdByActorName: auth.actor.actorName,
    sourceType: parsed.data.sourceType,
    sourceVideoJobId: source.value.sourceVideoJobId,
    sourceAssetId: parsed.data.sourceAssetId,
    sourceVideoUrl: source.value.sourceVideoUrl,
    sourcePreviewUrl: source.value.sourcePreviewUrl,
    sourceResolution: source.value.sourceResolution,
    targetResolution: parsed.data.targetResolution,
    durationSeconds: source.value.durationSeconds,
    reservedCredits: credits
  });

  if (credits > 0) {
    try {
      await rechargeOrderRepository.reserveGenerationCredits({
        customerId: auth.user.id,
        generationJobId: task.id,
        credits,
        actorId: auth.actor.actorId,
        actorName: auth.actor.actorName,
        reason: "创建视频高清输出任务冻结预计积分"
      });
    } catch (error) {
      await videoUpscaleService.cancelTask(task.id).catch(() => undefined);
      if (isInsufficientCreditsError(error)) {
        const account = await rechargeOrderRepository.account(auth.user.id);
        return NextResponse.json({ error: "insufficient_credits", requiredCredits: credits, account }, { status: 402 });
      }
      return NextResponse.json({ error: "credit_reservation_failed" }, { status: 500 });
    }
  }

  void videoUpscaleService.runTask(task.id).catch(() => {
    void videoUpscaleService.cancelTask(task.id).catch(() => undefined);
  });
  return NextResponse.json({ task: serializeVideoUpscaleTask(task) }, { status: 202 });
}

function isInsufficientCreditsError(error: unknown): boolean {
  return error instanceof Error && error.message === "insufficient_credits";
}

type ParsedUpscaleInput = ReturnType<typeof createVideoUpscaleTaskSchema.parse>;

type ResolvedSource =
  | {
      ok: true;
      value: {
        sourceVideoUrl: string;
        sourcePreviewUrl?: string;
        sourceVideoJobId?: string;
        sourceResolution?: string;
        durationSeconds?: number;
      };
    }
  | { ok: false; error: string; message: string; status: number };

function resolveUpscaleSource(input: ParsedUpscaleInput, customerId: string, actorId: string, requestUrl: string): ResolvedSource {
  if (input.sourceType === "videoJob") {
    if (!input.sourceVideoJobId) {
      return { ok: false, error: "missing_source_video_job", message: "缺少视频任务来源。", status: 400 };
    }
    const job = videoJobService.getJob(input.sourceVideoJobId);
    if (!job || job.customerId !== customerId) {
      return { ok: false, error: "source_video_job_not_found", message: "未找到可高清输出的视频记录。", status: 404 };
    }
    if (job.createdByActorId && job.createdByActorId !== actorId) {
      return { ok: false, error: "source_video_job_owned_by_another_actor", message: "只能对当前使用者创建的视频做高清输出。", status: 403 };
    }
    const sourceVideoUrl = publicVideoUrl(job.result?.localUrl, job.result?.url, requestUrl);
    if (!sourceVideoUrl) {
      return { ok: false, error: "source_video_unavailable", message: "这个视频还没有可用于高清输出的结果。", status: 422 };
    }
    return {
      ok: true,
      value: {
        sourceVideoJobId: job.id,
        sourceVideoUrl,
        sourcePreviewUrl: job.result?.localUrl ?? job.result?.url,
        sourceResolution: job.actualResolution ?? job.requestedResolution ?? job.input.outputResolution,
        durationSeconds: job.actualDurationSeconds ?? job.requestedDurationSeconds ?? job.input.durationSeconds
      }
    };
  }

  const sourceVideoUrl = input.sourceVideoUrl?.trim();
  if (!sourceVideoUrl || !isPublicHttpVideoUrl(sourceVideoUrl)) {
    return { ok: false, error: "source_video_public_url_required", message: "上传视频需要先生成公网可访问地址。", status: 422 };
  }
  return {
    ok: true,
    value: {
      sourceVideoUrl,
      sourcePreviewUrl: input.sourcePreviewUrl,
      sourceResolution: input.sourceResolution,
      durationSeconds: input.durationSeconds
    }
  };
}

function publicVideoUrl(localUrl: string | undefined, originalUrl: string | undefined, requestUrl: string): string | undefined {
  if (originalUrl && isPublicHttpVideoUrl(originalUrl)) return originalUrl;
  if (!localUrl) return undefined;
  if (/^https?:\/\//i.test(localUrl)) return isPublicHttpVideoUrl(localUrl) ? localUrl : undefined;
  const configured = process.env.APP_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return `${configured}${localUrl}`;
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}${localUrl}`;
}

function upscaleCapabilities() {
  return {
    providerConfigured: videoUpscaleService.isProviderConfigured(),
    pricingConfigured: hasVideoUpscalePricingConfigured(),
    allowMissingPrice: allowMissingVideoUpscalePrice()
  };
}
