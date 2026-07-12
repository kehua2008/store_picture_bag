import { NextResponse } from "next/server";
import { estimateVideoJobCredits, serializeVideoJob } from "../../../src/domain/jobs/videoJobService";
import { createVideoJobSchema } from "../../../src/server/schemas";
import { getAuthContextFromRequest } from "../../../src/server/auth";
import { rechargeOrderRepository, videoJobService } from "../../../src/server/services";
import { isPublicHttpVideoUrl, resolveReferenceAsset } from "../../../src/domain/video/referenceResolver";

export async function GET(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const scope = new URL(request.url).searchParams.get("scope") === "all" ? "all" : "mine";
  const jobs = videoJobService
    .listJobsForCustomer(auth.user.id)
    .filter((job) => scope === "all" || !job.createdByActorId || job.createdByActorId === auth.actor.actorId)
    .map((job) => serializeVideoJob(job));

  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const json = await request.json().catch(() => undefined);
  const parsed = createVideoJobSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_video_job_request",
        issues: parsed.error.issues
      },
      { status: 400 }
    );
  }

  const referenceStrength = parsed.data.referenceStrength ?? parsed.data.metadata?.referenceStrength ?? "medium";
  const referenceResult = resolveReferenceAsset({
    sourceType: parsed.data.metadata?.referenceSourceType,
    referenceLink: parsed.data.metadata?.referenceLink,
    referenceStrength,
    resolvedReferenceVideoUrl: parsed.data.metadata?.resolvedReferenceVideoUrl,
    frameCount: parsed.data.metadata?.referenceFrameCount
  });
  if (referenceResult.assetStatus === "failed") {
    return NextResponse.json(
      {
        error: "reference_asset_unavailable",
        message: referenceResult.parseError ?? "参考视频暂时无法处理。",
        reference: referenceResult
      },
      { status: 422 }
    );
  }
  if (referenceResult.processingMode === "full_video" && !isPublicHttpVideoUrl(referenceResult.resolvedReferenceVideoUrl)) {
    return NextResponse.json(
      {
        error: "reference_video_public_url_required",
        message: "参考视频公网地址不可访问，请检查 APP_PUBLIC_BASE_URL 配置。",
        reference: referenceResult
      },
      { status: 422 }
    );
  }
  const referenceAudioLink = parsed.data.metadata?.referenceAudioLink?.trim();
  if (referenceAudioLink && !isPublicHttpVideoUrl(referenceAudioLink)) {
    return NextResponse.json(
      {
        error: "reference_audio_public_url_required",
        message: "音频链接需要是公网可访问地址，请检查音乐或配音链接。"
      },
      { status: 422 }
    );
  }

  const videoInput = {
    ...parsed.data,
    referenceStrength,
    durationSeconds: parsed.data.durationSeconds ?? parseDurationSeconds(parsed.data.metadata?.duration),
    metadata: {
      ...parsed.data.metadata,
      referenceStrength,
      referenceSourceType: referenceResult.sourceType,
      referenceProcessingMode: referenceResult.processingMode,
      referenceAssetStatus: referenceResult.assetStatus,
      resolvedReferenceVideoUrl: referenceResult.resolvedReferenceVideoUrl,
      referenceFrameCount: referenceResult.frameCount,
      referenceParseError: referenceResult.parseError
    }
  };
  const pricingPlan = await rechargeOrderRepository.pricingPlanForCustomer(auth.user.id);
  const reservedCredits = estimateVideoJobCredits({ ...videoInput, pricingPlan });
  const account = await rechargeOrderRepository.account(auth.user.id);
  if (account.balanceCredits < reservedCredits) {
    return NextResponse.json({ error: "insufficient_credits", requiredCredits: reservedCredits, account }, { status: 402 });
  }

  const job = videoJobService.createJob({
    customerId: auth.user.id,
    createdByActorId: auth.actor.actorId,
    createdByActorName: auth.actor.actorName,
    videoInput,
    reservedCredits,
    requestUrl: request.url
  });
  try {
    await rechargeOrderRepository.reserveGenerationCredits({
      customerId: auth.user.id,
      generationJobId: job.id,
      credits: reservedCredits,
      actorId: auth.actor.actorId,
      actorName: auth.actor.actorName,
      reason: "创建视频任务冻结预计积分"
    });
  } catch (error) {
    await videoJobService.cancelJob(job.id).catch(() => undefined);
    if (isInsufficientCreditsError(error)) {
      const account = await rechargeOrderRepository.account(auth.user.id);
      return NextResponse.json({ error: "insufficient_credits", requiredCredits: reservedCredits, account }, { status: 402 });
    }
    return NextResponse.json({ error: "credit_reservation_failed" }, { status: 500 });
  }

  void videoJobService.runJob(job.id).catch(() => {
    void videoJobService.cancelJob(job.id).catch(() => undefined);
  });

  return NextResponse.json({ job: serializeVideoJob(job) }, { status: 202 });
}

function isInsufficientCreditsError(error: unknown): boolean {
  return error instanceof Error && error.message === "insufficient_credits";
}

function parseDurationSeconds(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.match(/\d+/);
  if (!match) return undefined;
  return Number(match[0]);
}
