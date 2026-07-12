import { generationJobService, videoJobService, videoUpscaleService } from "./services";

export function userOwnsGeneratedImage(customerId: string, filename: string): boolean {
  return generationJobService.listJobsForCustomer(customerId).some((job) =>
    job.results.some((result) => assetUrlMatchesFilename(result.url, filename))
  );
}

export function userOwnsGeneratedVideo(customerId: string, filename: string): boolean {
  const ownsVideoJobResult = videoJobService.listJobsForCustomer(customerId).some((job) =>
    assetUrlMatchesFilename(job.result?.localUrl, filename) ||
    assetUrlMatchesFilename(job.result?.url, filename) ||
    job.upscaleTasks?.some((task) =>
      assetUrlMatchesFilename(task.result?.localUrl, filename) ||
      assetUrlMatchesFilename(task.result?.url, filename)
    )
  );
  if (ownsVideoJobResult) return true;

  return videoUpscaleService.listTasksForCustomer(customerId).some((task) =>
    assetUrlMatchesFilename(task.result?.localUrl, filename) ||
    assetUrlMatchesFilename(task.result?.url, filename)
  );
}

function assetUrlMatchesFilename(url: string | undefined, filename: string): boolean {
  if (!url) return false;
  const pathname = pathnameForAssetUrl(url);
  if (!pathname) return false;
  return decodeURIComponent(pathname.split("/").pop() ?? "") === filename;
}

function pathnameForAssetUrl(url: string): string | undefined {
  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).pathname;
    } catch {
      return undefined;
    }
  }
  return url.split("?")[0];
}
