import { FileGenerationJobRepository, GenerationJobService } from "../domain/jobs/generationJobService";
import { FileVideoJobRepository, VideoJobService } from "../domain/jobs/videoJobService";
import { FileVideoUpscaleTaskRepository, VideoUpscaleService } from "../domain/jobs/videoUpscaleService";
import { FileRechargeOrderRepository } from "../domain/billing/rechargeOrders";
import { FileFeedbackReportRepository } from "../domain/feedback/feedbackReports";
import { FileUserRepository } from "../domain/auth/users";
import { FileCustomModelRepository } from "../domain/models/customModelRepository";
import { ArkVideoProvider } from "../domain/provider/arkVideoProvider";
import { YunwuImageProvider } from "../domain/provider/yunwuImageProvider";
import { HttpVideoUpscaleProvider } from "../domain/provider/videoUpscaleProvider";
import { analyzeStyleSample, FileStyleLibraryRepository, inferStyleName } from "../domain/styleLibrary/styleLibrary";
import { createStyleVisionAnalyzer } from "../domain/styleLibrary/styleVisionAnalyzer";
import { deleteGeneratedAssetCleanupCandidates, generatedAssetRetentionMs, planGeneratedAssetCleanup } from "./maintenance/generatedAssetCleanup";
import { persistentDataDir } from "./storagePaths";

const repository = new FileGenerationJobRepository();
const videoRepository = new FileVideoJobRepository();
const videoUpscaleRepository = new FileVideoUpscaleTaskRepository();
const styleVisionAnalyzer = createStyleVisionAnalyzer({
  analyze: analyzeStyleSample,
  inferStyleName
});
export const customModelRepository = new FileCustomModelRepository();
export const styleLibraryRepository = new FileStyleLibraryRepository({ analyzer: styleVisionAnalyzer });
export const userRepository = new FileUserRepository();
export const rechargeOrderRepository = new FileRechargeOrderRepository();
export const feedbackReportRepository = new FileFeedbackReportRepository();

export const generationJobService = new GenerationJobService(repository, new YunwuImageProvider(), {
  async onSucceeded(job) {
    if (!job.customerId || !job.reservedCredits) return;
    const chargedCredits = Math.min(job.chargedCredits ?? job.reservedCredits, job.reservedCredits);
    const releaseCredits = Math.max(0, job.reservedCredits - chargedCredits);
    if (chargedCredits > 0) {
      await rechargeOrderRepository.debitReservedGenerationCredits({
        customerId: job.customerId,
        generationJobId: job.id,
        credits: chargedCredits,
        actorId: job.createdByActorId,
        actorName: job.createdByActorName,
        reason: job.status === "partial_failed" ? "生图任务部分成功，扣除成功图片积分" : "生图任务成功，扣除冻结积分"
      });
    }
    if (releaseCredits > 0) {
      await rechargeOrderRepository.releaseReservedGenerationCredits({
        customerId: job.customerId,
        generationJobId: job.id,
        credits: releaseCredits,
        actorId: job.createdByActorId,
        actorName: job.createdByActorName,
        reason: "生图任务未完成部分，释放剩余冻结积分"
      });
    }
  },
  async onFailed(job) {
    if (!job.customerId || !job.reservedCredits) return;
    await rechargeOrderRepository.releaseReservedGenerationCredits({
      customerId: job.customerId,
      generationJobId: job.id,
      credits: job.reservedCredits,
      actorId: job.createdByActorId,
      actorName: job.createdByActorName,
      reason: "生图任务失败，释放冻结积分"
    });
  },
  async onCanceled(job) {
    if (!job.customerId || !job.reservedCredits) return;
    await rechargeOrderRepository.releaseReservedGenerationCredits({
      customerId: job.customerId,
      generationJobId: job.id,
      credits: job.reservedCredits,
      actorId: job.createdByActorId,
      actorName: job.createdByActorName,
      reason: "生图任务取消，释放冻结积分"
    });
  }
});
export const videoProvider = createVideoProvider();
export const videoJobService = new VideoJobService(videoRepository, videoProvider, {
  async onSubmitted(job) {
    if (!job.customerId || !job.reservedCredits) return;
    await rechargeOrderRepository.debitReservedGenerationCredits({
      customerId: job.customerId,
      generationJobId: job.id,
      credits: job.reservedCredits,
      actorId: job.createdByActorId,
      actorName: job.createdByActorName,
      reason: "视频任务已提交供应商，扣除冻结积分"
    });
  },
  async onFailed(job) {
    if (!job.customerId || !job.reservedCredits) return;
    await rechargeOrderRepository.releaseReservedGenerationCredits({
      customerId: job.customerId,
      generationJobId: job.id,
      credits: job.reservedCredits,
      actorId: job.createdByActorId,
      actorName: job.createdByActorName,
      reason: "视频任务创建失败，释放冻结积分"
    });
  },
  async onCanceled(job) {
    if (!job.customerId || !job.reservedCredits) return;
    await rechargeOrderRepository.releaseReservedGenerationCredits({
      customerId: job.customerId,
      generationJobId: job.id,
      credits: job.reservedCredits,
      actorId: job.createdByActorId,
      actorName: job.createdByActorName,
      reason: "视频任务取消，释放冻结积分"
    });
  }
});
export const videoUpscaleProvider = new HttpVideoUpscaleProvider();
export const videoUpscaleService = new VideoUpscaleService(videoUpscaleRepository, videoUpscaleProvider, {
  async onSubmitted(task) {
    if (!task.customerId || !task.reservedCredits) return;
    await rechargeOrderRepository.debitReservedGenerationCredits({
      customerId: task.customerId,
      generationJobId: task.id,
      credits: task.reservedCredits,
      actorId: task.createdByActorId,
      actorName: task.createdByActorName,
      reason: "视频高清输出任务已提交供应商，扣除冻结积分"
    });
  },
  async onFailed(task) {
    if (!task.customerId || !task.reservedCredits) return;
    await rechargeOrderRepository.releaseReservedGenerationCredits({
      customerId: task.customerId,
      generationJobId: task.id,
      credits: task.reservedCredits,
      actorId: task.createdByActorId,
      actorName: task.createdByActorName,
      reason: "视频高清输出任务失败，释放冻结积分"
    });
  },
  async onCanceled(task) {
    if (!task.customerId || !task.reservedCredits) return;
    await rechargeOrderRepository.releaseReservedGenerationCredits({
      customerId: task.customerId,
      generationJobId: task.id,
      credits: task.reservedCredits,
      actorId: task.createdByActorId,
      actorName: task.createdByActorName,
      reason: "视频高清输出任务取消，释放冻结积分"
    });
  }
});
function cleanupExpiredUserWorks(): void {
  generationJobService.cleanupExpiredJobs();
  videoJobService.cleanupExpiredJobs();
  videoUpscaleService.cleanupExpiredTasks();
  const plan = planGeneratedAssetCleanup({
    dataDir: persistentDataDir(),
    retentionMs: generatedAssetRetentionMs
  });
  if (!plan.candidates.length) return;
  const deleted = deleteGeneratedAssetCleanupCandidates(plan.candidates);
  console.info("[generated-asset-cleanup]", {
    deleted: deleted.deleted,
    bytes: deleted.bytes
  });
}

const generationJobCleanupIntervalMs = 60 * 60 * 1000;
const globalWithGenerationCleanup = globalThis as typeof globalThis & { __generationJobCleanupTimer?: ReturnType<typeof setInterval> };
const isNextProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
if (!isNextProductionBuild) {
  cleanupExpiredUserWorks();
  if (!globalWithGenerationCleanup.__generationJobCleanupTimer) {
    globalWithGenerationCleanup.__generationJobCleanupTimer = setInterval(() => {
      cleanupExpiredUserWorks();
    }, generationJobCleanupIntervalMs);
    if ("unref" in globalWithGenerationCleanup.__generationJobCleanupTimer) {
      globalWithGenerationCleanup.__generationJobCleanupTimer.unref();
    }
  }
}
if (!isNextProductionBuild) {
  void videoJobService.runDueJobs().catch(() => undefined);
  void videoUpscaleService.runDueTasks().catch(() => undefined);
}
const videoJobRetryIntervalMs = 10 * 1000;
const globalWithVideoRetry = globalThis as typeof globalThis & { __videoJobRetryTimer?: ReturnType<typeof setInterval> };
if (!isNextProductionBuild && !globalWithVideoRetry.__videoJobRetryTimer) {
  globalWithVideoRetry.__videoJobRetryTimer = setInterval(() => {
    void videoJobService.runDueJobs().catch(() => undefined);
    void videoUpscaleService.runDueTasks().catch(() => undefined);
  }, videoJobRetryIntervalMs);
  if ("unref" in globalWithVideoRetry.__videoJobRetryTimer) {
    globalWithVideoRetry.__videoJobRetryTimer.unref();
  }
}

function createVideoProvider() {
  return new ArkVideoProvider();
}
