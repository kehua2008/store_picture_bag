"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { platformLabels, type ApparelCategory, type CommercePlatform, type SceneVariant, type SizePreset } from "../../src/domain/apparel/options";
import type { ProductGroupingMode, ProductReferenceRole, OutfitSelectionMode } from "../../src/domain/jobs/generationJobService";

type JobStatus = "running" | "succeeded" | "partial_failed" | "failed" | "canceled";

type GenerationRecordJob = {
  id: string;
  customerId?: string;
  createdByActorId?: string;
  createdByActorName?: string;
  reservedCredits?: number;
  chargedCredits?: number;
  createdAt: string;
  updatedAt: string;
  options: {
    platform: CommercePlatform;
    category: ApparelCategory;
    productCategoryLabel?: string;
    sceneVariant: SceneVariant;
    size: SizePreset;
    count: number;
    imageTypeCounts?: Record<string, number>;
    specId: string;
    imageTypeId: string;
    imageTypeIds: string[];
    productGroupingMode?: ProductGroupingMode;
    productReferenceRoles?: ProductReferenceRole[];
    outfitSelectionMode?: OutfitSelectionMode;
    outfitItemCount?: number;
    targetWidth: number;
    targetHeight: number;
  };
  sourceImages: Array<{ id: string; filename: string; mimeType: string }>;
  status: JobStatus;
  progress: { completed: number; total: number };
  results: GenerationRecordImage[];
  failures?: GenerationRecordFailure[];
  error?: { code: string; message: string; retryable: boolean };
};

type GenerationRecordFailure = {
  order: number;
  expectedCount: number;
  sourceFilename: string;
  imageTypeId: string;
  imageTypeLabel: string;
  suiteLabel?: string;
  topSellerStyleLabel?: string;
  customStyleLabel?: string;
  error: { code: string; message: string; retryable: boolean };
};

type GenerationRecordImage = {
  id: string;
  base64: string;
  url?: string;
  mimeType: string;
  sourceFilename?: string;
  imageTypeId?: string;
  imageTypeLabel?: string;
  topSellerStyleLabel?: string;
  customStyleLabel?: string;
};

type CurrentUser = { id: string; phone: string; status: "active" | "suspended"; createdAt: string; updatedAt: string };
type CurrentActor = { actorId: string; actorName: string };
type CreditAccount = { customerId: string; balanceCredits: number; frozenCredits: number; updatedAt: string };
type WorkItem = { job: GenerationRecordJob; image: GenerationRecordImage; index: number };
type RecordTab = "images" | "videos";
type RecordScope = "mine" | "all";
type VideoRecordJob = {
  id: string;
  createdByActorId?: string;
  createdByActorName?: string;
  status: "running" | "submitted" | "succeeded" | "failed" | "canceled";
  reservedCredits?: number;
  chargedCredits?: number;
  createdAt: string;
  updatedAt: string;
  input: {
    aspectRatio?: string;
    outputResolution?: string;
    durationSeconds?: number;
    metadata?: {
      videoType?: string;
      platform?: string;
      referenceProcessingMode?: "none" | "single_frame" | "multi_frame" | "full_video";
      referenceSceneMode?: "product_only" | "handheld_product" | "model_wearing" | "talking_head" | "mixed";
      referenceMotionMode?: "static_display" | "slow_pan" | "hand_operation" | "walking_show" | "fast_cut";
      referenceTextMode?: "none" | "light_caption" | "dense_caption";
      referenceFrameCount?: number;
    };
  };
  progress: { completed: number; total: number };
  providerUsage?: {
    requestedResolution?: string;
    actualResolution?: string;
    requestedDurationSeconds?: number;
    actualDurationSeconds?: number;
    totalTokens?: number;
    actualCostCny?: number;
    costStatus?: string;
  };
  providerMismatch?: boolean;
  referenceProcessingMode?: "none" | "single_frame" | "multi_frame" | "full_video";
  referenceFrameCount?: number;
  result?: {
    url?: string;
    localUrl?: string;
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
    createdAt: string;
  };
  error?: { code: string; message: string; retryable: boolean };
};

function readInitialRecordTab(): RecordTab {
  if (typeof window === "undefined") return "images";
  return new URLSearchParams(window.location.search).get("tab") === "videos" ? "videos" : "images";
}

export default function GenerationRecordsPage() {
  const [user, setUser] = useState<CurrentUser>();
  const [actor, setActor] = useState<CurrentActor>();
  const [account, setAccount] = useState<CreditAccount>();
  const [jobs, setJobs] = useState<GenerationRecordJob[]>([]);
  const [videoJobs, setVideoJobs] = useState<VideoRecordJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [status, setStatus] = useState("正在同步生成记录...");
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingJobId, setCancelingJobId] = useState("");
  const [cancelingVideoJobId, setCancelingVideoJobId] = useState("");
  const [activeRecordTab, setActiveRecordTab] = useState<RecordTab>(readInitialRecordTab);
  const [recordScope, setRecordScope] = useState<RecordScope>("mine");

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  const works = useMemo<WorkItem[]>(
    () => jobs
      .filter((job) => !selectedJobId || job.id === selectedJobId)
      .flatMap((job) => job.results.map((image, index) => ({ job, image, index }))),
    [jobs, selectedJobId]
  );

  useEffect(() => {
    void loadCachedJobs();
  }, []);

  useEffect(() => {
    void refresh();
  }, [recordScope]);

  useEffect(() => {
    const syncTabFromUrl = () => setActiveRecordTab(readInitialRecordTab());
    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  function selectRecordTab(tab: RecordTab) {
    setActiveRecordTab(tab);
    if (typeof window === "undefined") return;
    const nextUrl = tab === "videos" ? "/generation-records?tab=videos" : "/generation-records?tab=images";
    window.history.replaceState(null, "", nextUrl);
  }

  async function refresh() {
    setIsLoading(true);
    const meResponse = await fetch("/api/auth/me").catch(() => undefined);
    if (!meResponse?.ok) {
      setUser(undefined);
      setActor(undefined);
      setAccount(undefined);
      setJobs([]);
      setVideoJobs([]);
      setStatus("请先登录后查看生成记录");
      setIsLoading(false);
      return;
    }

    const meBody = await meResponse.json().catch(() => ({}));
    setUser(meBody.user);
    setActor(meBody.actor);
    setAccount(meBody.account);

    const scopeQuery = `scope=${recordScope}`;
    const jobsResponse = await fetch(`/api/generation-jobs?${scopeQuery}`).catch(() => undefined);
    const videoJobsResponse = await fetch(`/api/video-jobs?${scopeQuery}`).catch(() => undefined);
    if (!jobsResponse?.ok) {
      if (!jobs.length) setJobs([]);
      setStatus("生成记录暂时无法加载");
      setIsLoading(false);
      return;
    }

    const jobsBody = await jobsResponse.json().catch(() => ({}));
    const incomingJobs = Array.isArray(jobsBody.jobs) ? jobsBody.jobs : [];
    const nextJobs = mergeJobs([], incomingJobs);
    setJobs(nextJobs);
    let nextVideoJobs = videoJobs;
    if (videoJobsResponse?.ok) {
      const videoJobsBody = await videoJobsResponse.json().catch(() => ({}));
      nextVideoJobs = Array.isArray(videoJobsBody.jobs) ? videoJobsBody.jobs : [];
      setVideoJobs(nextVideoJobs);
    }
    if (recordScope === "mine") void saveCachedJobs(nextJobs);
    setStatus(nextJobs.length || nextVideoJobs.length ? `已同步${recordScope === "mine" ? "我的" : "全部"}近 24 小时生成记录` : `${recordScope === "mine" ? "我的" : "全部"}近 24 小时暂无生成记录`);
    setIsLoading(false);
  }

  async function loadCachedJobs() {
    const cached = await readGenerationRecordsCache().catch(() => []);
    if (!cached.length) return;
    setJobs(cached);
    setStatus("已先展示本地缓存，正在后台同步最新记录");
    setIsLoading(false);
  }

  async function cancelJob(jobId: string) {
    setCancelingJobId(jobId);
    const response = await fetch(`/api/generation-jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" })
    }).catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      setStatus(`取消失败：${body?.error ?? "unknown_error"}`);
      setCancelingJobId("");
      return;
    }
    setJobs((current) => current.map((job) => job.id === jobId ? body.job : job));
    void saveCachedJobs(mergeJobs(jobs, [body.job]));
    setStatus("任务已取消，冻结积分已释放");
    setCancelingJobId("");
    await refresh();
  }

  async function cancelVideoJob(jobId: string) {
    setCancelingVideoJobId(jobId);
    const response = await fetch(`/api/video-jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" })
    }).catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      setStatus(`视频取消失败：${body?.error ?? "unknown_error"}`);
      setCancelingVideoJobId("");
      return;
    }
    setVideoJobs((current) => current.map((job) => job.id === jobId ? body.job : job));
    setStatus("视频任务已取消，冻结积分已释放");
    setCancelingVideoJobId("");
    await refresh();
  }

  function downloadWork(item: WorkItem) {
    void saveRecordUrlAsFile(imageSrc(item.image), buildDownloadName(item.job.options.platform, item.image, item.index));
  }

  function downloadVideo(job: VideoRecordJob) {
    const url = job.result?.localUrl ?? job.result?.url;
    if (url) void saveRecordUrlAsFile(url, buildVideoDownloadName(job));
  }

  function isOwnedByCurrentActor(item: { createdByActorId?: string }): boolean {
    return !item.createdByActorId || item.createdByActorId === actor?.actorId;
  }

  function actorLabel(item: { createdByActorName?: string }): string {
    return item.createdByActorName?.trim() || "未标记成员";
  }

  if (!user) {
    return (
      <main className="generationRecordsPage">
        <header className="recordsHeader">
          <Link className="recordsBrand" href="/">
            <img alt="" src="/brand-logo.svg" />
            <span>箱包AI创作平台</span>
          </Link>
          <Link className="recordsBack" href="/">返回首页登录</Link>
        </header>
        <section className="recordsLoginPrompt">
          <strong>请先登录</strong>
          <span>登录后可查看近 24 小时生成任务、作品图片和积分结算状态。</span>
          <Link href="/">返回首页登录</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="generationRecordsPage">
      <header className="recordsHeader">
        <Link className="recordsBrand" href="/">
          <img alt="" src="/brand-logo.svg" />
          <span>箱包AI创作平台</span>
        </Link>
        <nav>
          <Link href="/">工作台</Link>
          <Link href="/recharge">算力点充值</Link>
        </nav>
      </header>

      <section className="recordsHero">
        <div>
          <span>Generation Records</span>
          <h1>生成记录</h1>
          <p>图片和视频生成记录仅保留 24 小时，请及时下载。当前使用者：{actor?.actorName ?? "默认同事"}。</p>
        </div>
        <aside>
          <p><span>可用积分</span><strong>{formatNumber(account?.balanceCredits ?? 0)}</strong></p>
          <p><span>冻结积分</span><strong>{formatNumber(account?.frozenCredits ?? 0)}</strong></p>
          <p><span>任务</span><strong>{jobs.length + videoJobs.length}</strong></p>
        </aside>
      </section>

      <section className="recordsScopeBar" aria-label="任务范围">
        <div>
          <strong>{recordScope === "mine" ? "我的任务" : "全部任务"}</strong>
          <span>{recordScope === "mine" ? "只看当前使用者创建的任务" : "查看同一账号下所有成员任务，别人任务不可取消"}</span>
        </div>
        <div className="recordsScopeSwitch">
          <button className={recordScope === "mine" ? "active" : ""} type="button" onClick={() => setRecordScope("mine")}>我的任务</button>
          <button className={recordScope === "all" ? "active" : ""} type="button" onClick={() => setRecordScope("all")}>全部任务</button>
        </div>
      </section>

      <section className="recordsNotice">
        <strong>{status}</strong>
        <span>{isLoading ? "正在刷新..." : `${works.length} 张图片 · ${videoJobs.length} 个视频任务 · ${jobs.filter((job) => job.status === "running").length + videoJobs.filter((job) => job.status === "running" || job.status === "submitted").length} 个运行中任务`}</span>
      </section>

      <section className="recordsWorkspace">
        <div className="recordsWorksColumn">
          <header className="recordsSectionHeader">
            <div>
              <span>Works</span>
              <h2>{activeRecordTab === "images" ? selectedJob ? `${recordTitle(selectedJob)} 的作品` : "图片作品" : "视频作品"}</h2>
            </div>
            {activeRecordTab === "images" && selectedJob ? <button type="button" onClick={() => setSelectedJobId("")}>查看全部</button> : null}
          </header>
          <div className="recordsTabs" role="tablist" aria-label="作品类型">
            <button className={activeRecordTab === "images" ? "active" : ""} type="button" onClick={() => selectRecordTab("images")}>
              图片作品 <span>{works.length}</span>
            </button>
            <button className={activeRecordTab === "videos" ? "active" : ""} type="button" onClick={() => selectRecordTab("videos")}>
              视频作品 <span>{videoJobs.length}</span>
            </button>
          </div>
          {activeRecordTab === "images" ? (
            works.length ? (
              <div className="recordsWorkGrid" aria-label="生成作品图库">
                {works.map((item) => (
                  <article key={`${item.job.id}-${item.image.id}-${item.index}`}>
                    <img alt={item.image.imageTypeLabel ?? "生成作品"} src={imageSrc(item.image)} />
                    <div>
                      <strong>{item.image.imageTypeLabel ?? "生成作品"}</strong>
                      <span>{resultSubtitle(item)}</span>
                    </div>
                    <div className="downloadActionWithHint compact">
                      <button type="button" onClick={() => downloadWork(item)}>下载</button>
                      <em className="downloadRetentionHint">仅保存24小时</em>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="recordsEmpty">
                <strong>暂无可下载作品</strong>
                <span>{selectedJob ? "该任务还没有生成图片。" : "成功生成后的图片会展示在这里。"}</span>
              </div>
            )
          ) : videoJobs.length ? (
            <div className="recordsVideoList" aria-label="生成视频记录">
              {videoJobs.map((job) => (
                <article key={job.id}>
                  <div className="recordsVideoPreview">
                    {job.result?.localUrl || job.result?.url ? (
                      <video muted playsInline preload="metadata" src={job.result.localUrl ?? job.result.url} />
                    ) : (
                      <strong>{videoStatusText(job)}</strong>
                    )}
                  </div>
                  <div className="recordsVideoMeta">
                    <strong>{videoRecordTitle(job)}</strong>
                    <span>{formatDateTime(job.createdAt)} · {videoStatusText(job)} · {actorLabel(job)}</span>
                    <span>{videoReferenceSummary(job)} · {videoSpecSummary(job)}</span>
                    <span>预计 {job.reservedCredits ?? 0} · 实际 {job.chargedCredits ?? 0} · {videoCostSummary(job)}</span>
                  </div>
                  <div className="recordsVideoActions">
                    <div className="downloadActionWithHint compact">
                      <button disabled={!job.result?.localUrl && !job.result?.url} type="button" onClick={() => downloadVideo(job)}>下载</button>
                      {job.result?.localUrl || job.result?.url ? <em className="downloadRetentionHint">仅保存24小时</em> : null}
                    </div>
                    {(job.result?.localUrl || job.result?.url) && isOwnedByCurrentActor(job) ? (
                      <Link href={`/video-upscale?source=videoJob&jobId=${encodeURIComponent(job.id)}`}>高清输出</Link>
                    ) : null}
                    {job.status === "running" || job.status === "submitted" ? (
                      <button disabled={cancelingVideoJobId === job.id || !isOwnedByCurrentActor(job)} type="button" onClick={() => void cancelVideoJob(job.id)}>
                        {!isOwnedByCurrentActor(job) ? "他人任务" : cancelingVideoJobId === job.id ? "取消中" : "取消"}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="recordsEmpty">
              <strong>暂无视频记录</strong>
              <span>视频生成完成后会显示在这里。</span>
            </div>
          )}
        </div>

        <aside className="recordsTaskColumn" aria-label="任务记录">
          <header className="recordsSectionHeader compact">
            <div>
              <span>Jobs</span>
              <h2>任务记录</h2>
            </div>
          </header>
          <div className="recordsTaskList">
            {jobs.map((job) => (
              <article key={job.id} className={selectedJobId === job.id ? "active" : ""}>
                <button type="button" onClick={() => setSelectedJobId(job.id)}>
                  <span>
                    <strong>{recordTitle(job)}</strong>
                    <em>{job.id}</em>
                  </span>
                  <b className={job.status}>{statusText(job)}</b>
                </button>
                <div className="recordsProgress">
                  <i style={{ width: `${progressPercent(job)}%` }} />
                </div>
                <p>
                  <span>{formatDateTime(job.createdAt)}</span>
                  <span>{actorLabel(job)}</span>
                  <span>{job.progress.completed}/{job.progress.total}</span>
                  <span>预计 {job.reservedCredits ?? 0}</span>
                  <span>实际 {job.chargedCredits ?? 0}</span>
                </p>
                {job.status === "running" ? (
                  <button className="recordsCancelButton" disabled={cancelingJobId === job.id || !isOwnedByCurrentActor(job)} type="button" onClick={() => void cancelJob(job.id)}>
                    {!isOwnedByCurrentActor(job) ? "他人任务不可取消" : cancelingJobId === job.id ? "取消中" : "取消任务"}
                  </button>
                ) : null}
                {job.failures?.length ? (
                  <div className="recordsFailureList">
                    {job.failures.map((failure) => (
                      <span key={`${job.id}-${failure.order}`}>
                        {failureLabel(failure)} · {providerErrorMessage(failure.error)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
            {!jobs.length ? (
              <div className="recordsEmpty">
                <strong>暂无任务记录</strong>
                <span>从工作台创建任务后会出现在这里。</span>
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}

function recordTitle(job: GenerationRecordJob): string {
  return job.options.productCategoryLabel ?? platformLabels[job.options.platform] ?? "生成任务";
}

function statusText(job: GenerationRecordJob): string {
  if (job.status === "running") return "生成中";
  if (job.status === "succeeded") return "生成完成";
  if (job.status === "partial_failed" && job.error && isBusyQueueError(job.error)) return "排队中断";
  if (job.status === "partial_failed") return "部分失败";
  if (job.status === "canceled") return "已取消";
  if (job.error && isBusyQueueError(job.error)) return "生图正在排队";
  return "生成失败";
}

function videoRecordTitle(job: VideoRecordJob): string {
  return [job.input.metadata?.videoType, job.input.metadata?.platform].filter(Boolean).join(" · ") || "视频生成任务";
}

function videoStatusText(job: VideoRecordJob): string {
  if (job.status === "running") return "提交中";
  if (job.status === "submitted") return "生成中";
  if (job.status === "succeeded") return "生成完成";
  if (job.status === "canceled") return "已取消";
  return job.error?.message ?? "生成失败";
}

function videoReferenceSummary(job: VideoRecordJob): string {
  const metadata = job.input.metadata;
  const processingMode = job.referenceProcessingMode ?? metadata?.referenceProcessingMode;
  const frameCount = job.referenceFrameCount ?? metadata?.referenceFrameCount;
  const parts = [referenceProcessingText(processingMode)];
  if (metadata?.referenceSceneMode || metadata?.referenceMotionMode || metadata?.referenceTextMode) {
    parts.push(
      referenceSceneText(metadata.referenceSceneMode),
      referenceMotionText(metadata.referenceMotionMode),
      referenceTextDensityText(metadata.referenceTextMode)
    );
  } else if (processingMode && processingMode !== "none") {
    parts.push("跟随参考视频");
  }
  if (frameCount) parts.push(`${frameCount}帧`);
  return parts.filter(Boolean).join(" · ");
}

function videoSpecSummary(job: VideoRecordJob): string {
  const requestedResolution = job.providerUsage?.requestedResolution ?? job.input.outputResolution ?? "-";
  const actualResolution = job.providerUsage?.actualResolution;
  const requestedDuration = job.providerUsage?.requestedDurationSeconds ?? job.input.durationSeconds;
  const actualDuration = job.providerUsage?.actualDurationSeconds;
  return `请求 ${formatVideoResolution(requestedResolution)} / ${requestedDuration ?? "-"}秒${actualResolution || actualDuration ? ` · 实际 ${formatVideoResolution(actualResolution)} / ${actualDuration ?? "-"}秒` : ""}`;
}

function videoCostSummary(job: VideoRecordJob): string {
  const usage = job.providerUsage;
  if (!usage) return "等待供应商用量";
  if (usage.actualCostCny !== undefined) return `成本约 ¥${usage.actualCostCny}`;
  if (usage.totalTokens !== undefined) return `Tokens ${usage.totalTokens} · ${usage.costStatus === "missing_price" ? "缺少价格表" : "等待成本核算"}`;
  return usage.costStatus === "missing_price" ? "缺少价格表" : "等待成本核算";
}

function referenceProcessingText(mode?: "none" | "single_frame" | "multi_frame" | "full_video"): string {
  if (mode === "single_frame") return "单帧参考";
  if (mode === "multi_frame") return "多帧分镜参考";
  if (mode === "full_video") return "完整视频参考";
  return "无参考";
}

function referenceSceneText(mode?: "product_only" | "handheld_product" | "model_wearing" | "talking_head" | "mixed"): string {
  if (mode === "handheld_product") return "手持商品展示";
  if (mode === "model_wearing") return "持包展示";
  if (mode === "talking_head") return "口播讲解";
  if (mode === "mixed") return "混合展示";
  return "无人商品展示";
}

function referenceMotionText(mode?: "static_display" | "slow_pan" | "hand_operation" | "walking_show" | "fast_cut"): string {
  if (mode === "slow_pan") return "慢推慢移";
  if (mode === "hand_operation") return "手部操作";
  if (mode === "walking_show") return "走动展示";
  if (mode === "fast_cut") return "快切节奏";
  return "静物展示";
}

function referenceTextDensityText(mode?: "none" | "light_caption" | "dense_caption"): string {
  if (mode === "light_caption") return "少量字幕";
  if (mode === "dense_caption") return "密集字幕";
  return "少字/无字幕";
}

function formatVideoResolution(value?: string): string {
  if (!value) return "-";
  const normalized = value.toLowerCase();
  if (normalized === "2k" || normalized === "4k") return normalized.toUpperCase();
  return normalized.replace("p", "P");
}

function providerErrorMessage(error: { code: string; message: string; retryable: boolean }): string {
  if (isBusyQueueError(error)) {
    return "你太有眼光了，当前也有很多用户在生成同款高级效果，生图正在排队中。请稍等一会儿后重试。";
  }
  return error.message;
}

function isBusyQueueError(error: { code: string; retryable: boolean }): boolean {
  return error.code === "provider_timeout" || error.code === "provider_rate_limited";
}

function failureLabel(failure: GenerationRecordFailure): string {
  return [failure.imageTypeLabel, failure.topSellerStyleLabel ?? failure.customStyleLabel ?? failure.suiteLabel]
    .filter(Boolean)
    .join(" · ");
}

function progressPercent(job: GenerationRecordJob): number {
  if (!job.progress.total) return 0;
  return Math.min(100, Math.round((job.progress.completed / job.progress.total) * 100));
}

function resultSubtitle(item: WorkItem): string {
  const style = item.image.topSellerStyleLabel ?? item.image.customStyleLabel;
  return [style, item.image.sourceFilename ?? item.job.id, formatDateTime(item.job.createdAt)].filter(Boolean).join(" · ");
}

function imageSrc(image: GenerationRecordImage): string {
  if (image.base64) return `data:${image.mimeType};base64,${image.base64}`;
  return image.url ?? "";
}

function buildDownloadName(platform: CommercePlatform, image: GenerationRecordImage, index: number): string {
  const source = (image.sourceFilename ?? "generated").replace(/\.[^.]+$/, "");
  const type = image.imageTypeLabel ?? image.imageTypeId ?? "result";
  const extension = image.mimeType === "image/jpeg" ? "jpg" : image.mimeType === "image/webp" ? "webp" : "png";
  return `${platformLabels[platform]}-${type}-${source}-${index + 1}.${extension}`;
}

function sanitizeDownloadName(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 120) || "download";
}

function triggerBrowserDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizeDownloadName(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function blobFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("download_failed");
  return response.blob();
}

async function saveRecordUrlAsFile(url: string, filename: string) {
  const safeName = sanitizeDownloadName(filename);
  const picker = (window as typeof window & { showSaveFilePicker?: (options?: unknown) => Promise<any> }).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({ suggestedName: safeName });
      const blob = await blobFromUrl(url);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  triggerBrowserDownload(url, safeName);
}

function buildVideoDownloadName(job: VideoRecordJob): string {
  const title = videoRecordTitle(job).replace(/\s+/g, "-");
  const extension = job.result?.mimeType === "video/quicktime" ? "mov" : "mp4";
  return `${title || "视频生成结果"}-${job.id}.${extension}`;
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value);
}

function mergeJobs(current: GenerationRecordJob[], incoming: GenerationRecordJob[]): GenerationRecordJob[] {
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const byId = new Map<string, GenerationRecordJob>();
  current.forEach((job) => byId.set(job.id, job));
  incoming.forEach((job) => byId.set(job.id, job));
  return Array.from(byId.values())
    .filter((job) => {
      const created = new Date(job.createdAt).getTime();
      return !Number.isFinite(created) || created >= cutoff;
    })
    .sort((left, right) => new Date(right.updatedAt ?? right.createdAt).getTime() - new Date(left.updatedAt ?? left.createdAt).getTime());
}

async function readGenerationRecordsCache(): Promise<GenerationRecordJob[]> {
  const db = await openRecordsDb();
  return new Promise((resolve) => {
    const request = db.transaction("jobs", "readonly").objectStore("jobs").getAll();
    request.onsuccess = () => resolve(mergeJobs([], (request.result ?? []) as GenerationRecordJob[]));
    request.onerror = () => resolve([]);
  });
}

async function saveCachedJobs(jobs: GenerationRecordJob[]): Promise<void> {
  const db = await openRecordsDb();
  await new Promise<void>((resolve) => {
    const transaction = db.transaction("jobs", "readwrite");
    const store = transaction.objectStore("jobs");
    store.clear();
    mergeJobs([], jobs).forEach((job) => store.put(job));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
  });
}

function openRecordsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("deepai-generation-records", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("jobs")) db.createObjectStore("jobs", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
