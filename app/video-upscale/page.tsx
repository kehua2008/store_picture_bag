"use client";

import Link from "next/link";
import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";

type TargetResolution = "720p" | "1080p" | "2k" | "4k";
type UpscaleStatus = "running" | "submitted" | "succeeded" | "failed" | "canceled";

type VideoJobView = {
  id: string;
  status: string;
  result?: { url?: string; localUrl?: string; filename?: string };
  actualResolution?: string;
  requestedResolution?: string;
  actualDurationSeconds?: number;
  requestedDurationSeconds?: number;
  input?: { outputResolution?: string; durationSeconds?: number };
};

type UpscaleTask = {
  id: string;
  status: UpscaleStatus;
  sourceType: "videoJob" | "upload";
  sourceVideoJobId?: string;
  sourcePreviewUrl?: string;
  sourceVideoUrl: string;
  sourceResolution?: string;
  targetResolution: TargetResolution;
  durationSeconds?: number;
  reservedCredits: number;
  chargedCredits?: number;
  createdAt: string;
  updatedAt: string;
  result?: { url?: string; localUrl?: string; filename?: string };
  usage?: { actualCostCny?: number; costStatus?: string; totalTokens?: number };
  error?: { code: string; message: string };
};

type SourceState = {
  sourceType: "videoJob" | "upload";
  sourceVideoJobId?: string;
  sourceAssetId?: string;
  previewUrl: string;
  publicUrl?: string;
  sourceResolution?: string;
  durationSeconds?: number;
  label: string;
};

type Capabilities = {
  providerConfigured: boolean;
  pricingConfigured: boolean;
  allowMissingPrice: boolean;
};

const targetOptions: Array<{ id: TargetResolution; label: string; desc: string }> = [
  { id: "720p", label: "720P", desc: "轻量提清晰度" },
  { id: "1080p", label: "1080P", desc: "常用高清成片" },
  { id: "2k", label: "2K", desc: "更适合二次剪辑" },
  { id: "4k", label: "4K", desc: "最高规格输出" }
];

export default function VideoUpscalePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<SourceState>();
  const [targetResolution, setTargetResolution] = useState<TargetResolution>("1080p");
  const [capabilities, setCapabilities] = useState<Capabilities>({ providerConfigured: false, pricingConfigured: false, allowMissingPrice: false });
  const [recentTasks, setRecentTasks] = useState<UpscaleTask[]>([]);
  const [currentTask, setCurrentTask] = useState<UpscaleTask>();
  const [status, setStatus] = useState("正在准备高清输出工作台...");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const createLockRef = useRef(false);
  const [returnHref, setReturnHref] = useState("/?workspace=video");

  const upscaleInProgress = Boolean(
    (currentTask && ["running", "submitted"].includes(currentTask.status)) ||
    recentTasks.some((task) => ["running", "submitted"].includes(task.status))
  );
  const canCreate = Boolean(
    source &&
    !creating &&
    !uploading &&
    !upscaleInProgress &&
    capabilities.providerConfigured &&
    (capabilities.pricingConfigured || capabilities.allowMissingPrice) &&
    (!source.durationSeconds || source.durationSeconds <= 15)
  );
  const activeTask = currentTask ?? recentTasks[0];
  const resultUrl = activeTask?.result?.localUrl ?? activeTask?.result?.url;

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!currentTask || !["running", "submitted"].includes(currentTask.status)) return undefined;
    const timer = window.setInterval(() => void refreshTask(currentTask.id), 5000);
    return () => window.clearInterval(timer);
  }, [currentTask?.id, currentTask?.status]);

  useEffect(() => {
    if (!upscaleInProgress) {
      createLockRef.current = false;
    }
  }, [upscaleInProgress]);

  async function bootstrap() {
    const params = new URLSearchParams(window.location.search);
    const target = normalizeTargetResolution(params.get("target"));
    const returnMode = normalizeVideoMode(params.get("returnMode"));
    setReturnHref(`/?workspace=video${returnMode ? `&videoMode=${returnMode}` : ""}`);
    if (target) setTargetResolution(target);
    await refreshTasks();
    if (params.get("source") === "videoJob" && params.get("jobId")) {
      await loadVideoJobSource(params.get("jobId")!);
    } else {
      setStatus("可以上传本地视频，或从生成页/记录页进入高清输出。");
    }
  }

  async function refreshTasks() {
    const response = await fetch("/api/video-upscale").catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    if (response?.status === 401) {
      setStatus("请先登录后使用高清输出。");
      return;
    }
    if (body.capabilities) setCapabilities(body.capabilities);
    if (Array.isArray(body.tasks)) setRecentTasks(body.tasks);
  }

  async function loadVideoJobSource(jobId: string) {
    setStatus("正在读取视频生成记录...");
    const response = await fetch(`/api/video-jobs/${encodeURIComponent(jobId)}`).catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    if (!response?.ok || !body.job) {
      setStatus("没有找到这条视频记录，请从生成记录重新进入。");
      return;
    }
    const job = body.job as VideoJobView;
    const previewUrl = job.result?.localUrl ?? job.result?.url;
    if (!previewUrl) {
      setStatus("这条视频还没有生成结果，暂不能高清输出。");
      return;
    }
    setSource({
      sourceType: "videoJob",
      sourceVideoJobId: job.id,
      previewUrl,
      sourceResolution: job.actualResolution ?? job.requestedResolution ?? job.input?.outputResolution,
      durationSeconds: job.actualDurationSeconds ?? job.requestedDurationSeconds ?? job.input?.durationSeconds,
      label: "已生成视频"
    });
    setStatus("已带入生成视频，可以选择目标清晰度。");
  }

  async function uploadSourceVideo(file: File) {
    setUploading(true);
    setCurrentTask(undefined);
    const localPreviewUrl = URL.createObjectURL(file);
    const metadata = await probeVideoMetadata(localPreviewUrl).catch(() => undefined);
    if (!metadata) {
      URL.revokeObjectURL(localPreviewUrl);
      setUploading(false);
      setStatus("无法识别这个视频，请换一个 mp4、mov 或 webm 文件。");
      return;
    }
    if (metadata.durationSeconds > 15) {
      setSource({
        sourceType: "upload",
        previewUrl: localPreviewUrl,
        sourceResolution: inferResolution(metadata.height),
        durationSeconds: metadata.durationSeconds,
        label: "本地上传视频"
      });
      setUploading(false);
      setStatus("当前视频超过 15 秒，请先裁剪到 15 秒以内再提交高清输出。");
      return;
    }

    const form = new FormData();
    form.append("video", file);
    const response = await fetch("/api/video-upscale-assets", { method: "POST", body: form }).catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    setUploading(false);
    if (!response?.ok || !body.asset) {
      setStatus(body.message ?? "视频上传失败，请稍后重试。");
      return;
    }
    setSource({
      sourceType: "upload",
      sourceAssetId: body.asset.id,
      previewUrl: body.asset.localUrl,
      publicUrl: body.asset.publicUrl,
      sourceResolution: inferResolution(metadata.height),
      durationSeconds: metadata.durationSeconds,
      label: "本地上传视频"
    });
    setStatus("视频已上传，可以选择目标清晰度。");
  }

  function clearSourceVideo() {
    if (source?.sourceType === "upload" && source.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(source.previewUrl);
    }
    setSource(undefined);
    setCurrentTask(undefined);
    setStatus("可以拖拽视频到来源区域，也可以点击选择本地视频。");
  }

  function handleSourceDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("video/"));
    if (file) void uploadSourceVideo(file);
  }

  async function createUpscaleTask() {
    if (!source || !canCreate || createLockRef.current) return;
    createLockRef.current = true;
    let taskAccepted = false;
    setCreating(true);
    setStatus("正在创建高清输出任务...");
    const response = await fetch("/api/video-upscale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceType: source.sourceType,
        sourceVideoJobId: source.sourceVideoJobId,
        sourceAssetId: source.sourceAssetId,
        sourceVideoUrl: source.publicUrl,
        sourcePreviewUrl: source.previewUrl,
        sourceResolution: source.sourceResolution,
        targetResolution,
        durationSeconds: source.durationSeconds
      })
    }).catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    setCreating(false);
    if (!response?.ok || !body.task) {
      setStatus(body.message ?? readableUpscaleError(body.error));
      if (body.capabilities) setCapabilities(body.capabilities);
      createLockRef.current = false;
      return;
    }
    taskAccepted = body.task.status === "running" || body.task.status === "submitted";
    setCurrentTask(body.task);
    setStatus("正在为你生成高清视频，请稍候。");
    await refreshTasks();
    if (!taskAccepted) createLockRef.current = false;
  }

  async function refreshTask(taskId: string) {
    const response = await fetch(`/api/video-upscale/${encodeURIComponent(taskId)}`).catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    if (response?.ok && body.task) {
      setCurrentTask(body.task);
      if (body.task.status === "succeeded") setStatus("高清视频已生成，可以下载。");
      if (body.task.status === "failed") setStatus(body.task.error?.message ?? "高清输出失败，冻结积分已释放。");
      await refreshTasks();
    }
  }

  const createButtonText = useMemo(() => {
    if (!capabilities.providerConfigured) return "高清输出服务待接入";
    if (!capabilities.pricingConfigured && !capabilities.allowMissingPrice) return "等待配置高清价格";
    if (upscaleInProgress) return "生成中...";
    if (creating) return "正在创建任务...";
    return `生成 ${targetResolutionLabel(targetResolution)}`;
  }, [capabilities, creating, targetResolution, upscaleInProgress]);

  return (
    <main className="videoUpscalePage">
      <header className="stationHeader videoUpscaleSiteHeader">
        <Link className="logoMark" href="/" aria-label="返回首页">
          <img alt="" src="/brand-logo.svg" />
        </Link>
        <h1>
          箱包AI创作平台
          <span className="brandDivider">·</span>
          <span className="brandQualifier">专为箱包而生</span>
        </h1>
        <div className="headerSlogan" aria-label="网站广告语">
          <strong>一个视频，一句话，生成你想要的视频！</strong>
        </div>
        <Link className="accountButton videoUpscaleAccountLink" href="/account">我的</Link>
        <nav>
          <Link href="/?workspace=image">图像生成</Link>
          <Link className="active" href="/?workspace=video">视频生成</Link>
        </nav>
      </header>

      <section className="videoUpscaleHero">
        <div>
          <span>HD Output</span>
          <h1>视频高清转换器</h1>
          <p>刚生成的视频、历史视频、本地视频都可以在这里统一做高清输出。</p>
        </div>
        <nav className="videoUpscaleUtilityNav">
          <Link className="videoUpscaleBackLink" href={returnHref}>返回上一个页面</Link>
          <Link href="/generation-records?tab=videos">视频记录</Link>
        </nav>
        <input
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm"
          hidden
          ref={fileInputRef}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadSourceVideo(file);
            event.currentTarget.value = "";
          }}
        />
      </section>

      <section className="videoUpscaleWorkbench">
        <div className="videoUpscalePreviewPanel">
          <div className="videoUpscalePanelHeader">
            <span>来源视频</span>
            <strong>{source?.label ?? "等待选择视频"}</strong>
          </div>
          {source ? (
            <div className="videoUpscalePreview">
              <video controls playsInline src={source.previewUrl} />
              <button className="videoUpscaleRemoveSource" type="button" onClick={clearSourceVideo}>删除该视频素材</button>
            </div>
          ) : (
            <button
              className="videoUpscaleEmpty"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleSourceDrop}
            >
              <strong>拖拽视频到这里</strong>
              <i aria-hidden="true">+</i>
              <span>也可以点击选择本地视频；从生成结果选择清晰度进入时会自动带入刚生成的视频。</span>
            </button>
          )}
          <div className="videoUpscaleSourceMeta">
            <p><span>源清晰度</span><strong>{source?.sourceResolution?.toUpperCase() ?? "-"}</strong></p>
            <p><span>时长</span><strong>{source?.durationSeconds ? `${Math.round(source.durationSeconds)}秒` : "-"}</strong></p>
            <p><span>来源</span><strong>{source?.sourceType === "videoJob" ? "生成记录" : source?.sourceType === "upload" ? "本地上传" : "-"}</strong></p>
          </div>
        </div>

        <aside className="videoUpscaleControlPanel">
          <div className="videoUpscalePanelHeader">
            <span>高清输出选择</span>
            <strong>选择后创建独立高清任务</strong>
          </div>
          <div className="videoUpscaleTargetGrid">
            {targetOptions.map((item) => (
              <button className={targetResolution === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setTargetResolution(item.id)}>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </button>
            ))}
          </div>
          <div className={capabilities.providerConfigured ? "videoUpscaleNotice" : "videoUpscaleNotice warning"}>
            <strong>{capabilities.providerConfigured ? "服务状态正常" : "高清输出服务待接入"}</strong>
            <span>
              {capabilities.providerConfigured
                ? capabilities.pricingConfigured || capabilities.allowMissingPrice
                  ? "会创建真实超分任务，并单独记录积分和成本。"
                  : "供应商已配置，但高清价格表还未配置。"
                : "目前不会创建假任务，也不会扣费。"}
            </span>
          </div>
          <button className="videoUpscaleCreateButton" disabled={!canCreate} type="button" onClick={() => void createUpscaleTask()}>
            {createButtonText}
          </button>
          <p className="videoUpscaleStatus">{uploading ? "正在上传视频..." : status}</p>
        </aside>
      </section>

      <section className="videoUpscaleResultPanel">
        <div className="videoUpscalePanelHeader">
          <span>高清输出结果</span>
          <strong>{activeTask ? upscaleStatusText(activeTask.status) : "还没有高清任务"}</strong>
        </div>
        {resultUrl ? (
          <div className="videoUpscaleResultGrid">
            <video controls playsInline src={resultUrl} />
            <div>
              <strong>{targetResolutionLabel(activeTask!.targetResolution)} 高清视频</strong>
              <span>积分 {activeTask?.chargedCredits ?? activeTask?.reservedCredits ?? 0} · {costText(activeTask)}</span>
              <div className="downloadActionWithHint">
                <button type="button" onClick={() => void saveUrlAsFile(resultUrl, buildUpscaleDownloadName(activeTask))}>下载高清视频</button>
                <em className="downloadRetentionHint">请及时下载，系统仅保存24小时</em>
              </div>
            </div>
          </div>
        ) : (
          <div className="videoUpscaleResultEmpty">
            <strong>{activeTask ? upscaleStatusText(activeTask.status) : "等待创建高清输出任务"}</strong>
            <span>{activeTask?.error?.message ?? "结果生成后会出现在这里。"}</span>
          </div>
        )}
      </section>

      <section className="videoUpscaleHistory">
        <div className="videoUpscalePanelHeader">
          <span>最近高清任务</span>
          <strong>{recentTasks.length} 个</strong>
        </div>
        {recentTasks.length ? recentTasks.slice(0, 6).map((task) => (
          <article key={task.id}>
            <div>
              <strong>{targetResolutionLabel(task.targetResolution)}</strong>
              <span>{formatDateTime(task.createdAt)} · {upscaleStatusText(task.status)}</span>
            </div>
            <span>{task.sourceType === "videoJob" ? "生成记录" : "本地上传"} · {task.durationSeconds ? `${Math.round(task.durationSeconds)}秒` : "时长未知"}</span>
            {task.result?.localUrl || task.result?.url ? (
              <div className="downloadActionWithHint compact">
                <button type="button" onClick={() => void saveUrlAsFile(task.result!.localUrl ?? task.result!.url!, buildUpscaleDownloadName(task))}>下载</button>
                <em className="downloadRetentionHint">仅保存24小时</em>
              </div>
            ) : null}
          </article>
        )) : (
          <div className="videoUpscaleResultEmpty">
            <strong>暂无高清输出记录</strong>
            <span>创建任务后会在这里显示。</span>
          </div>
        )}
      </section>
    </main>
  );
}

function normalizeTargetResolution(value: string | null): TargetResolution | undefined {
  if (value === "720p" || value === "1080p" || value === "2k" || value === "4k") return value;
  return undefined;
}

function normalizeVideoMode(value: string | null): "reference" | "custom" | undefined {
  if (value === "reference" || value === "custom") return value;
  return undefined;
}

function targetResolutionLabel(value: TargetResolution): string {
  if (value === "2k") return "2K";
  if (value === "4k") return "4K";
  return value.toUpperCase();
}

function inferResolution(height: number): string {
  if (height >= 2160) return "4k";
  if (height >= 1440) return "2k";
  if (height >= 1080) return "1080p";
  if (height >= 720) return "720p";
  return "480p";
}

function probeVideoMetadata(url: string): Promise<{ durationSeconds: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        durationSeconds: Math.ceil(video.duration || 0),
        width: video.videoWidth,
        height: video.videoHeight
      });
    };
    video.onerror = () => reject(new Error("video_metadata_failed"));
    video.src = url;
  });
}

function upscaleStatusText(status: UpscaleStatus): string {
  const labels: Record<UpscaleStatus, string> = {
    running: "正在创建",
    submitted: "高清视频生成中",
    succeeded: "已完成",
    failed: "失败",
    canceled: "已取消"
  };
  return labels[status] ?? status;
}

function readableUpscaleError(error: string | undefined): string {
  if (error === "video_upscale_provider_unconfigured") return "高清输出服务待接入。";
  if (error === "video_upscale_pricing_required") return "高清输出价格表未配置，暂不能创建真实任务。";
  if (error === "insufficient_credits") return "积分不足，请先充值。";
  return "高清输出任务创建失败，请稍后重试。";
}

function costText(task: UpscaleTask | undefined): string {
  if (!task?.usage) return "等待成本记录";
  if (task.usage.actualCostCny !== undefined) return `成本约 ¥${task.usage.actualCostCny}`;
  return task.usage.costStatus === "missing_price" ? "价格表待补" : "成本待回传";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

async function saveUrlAsFile(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function buildUpscaleDownloadName(task: UpscaleTask | undefined): string {
  return `${task?.id ?? "video-upscale"}-${task?.targetResolution ?? "hd"}.mp4`;
}
