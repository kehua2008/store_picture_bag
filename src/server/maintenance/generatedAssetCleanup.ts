import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "fs";
import path from "path";

export const generatedAssetRetentionMs = 24 * 60 * 60 * 1000;

export interface CleanupCandidate {
  path: string;
  relativePath: string;
  sizeBytes: number;
  mtimeMs: number;
  reason: "orphan_expired_generated_asset";
}

export interface BackupFileInfo {
  path: string;
  relativePath: string;
  sizeBytes: number;
  mtimeMs: number;
}

export interface GeneratedAssetCleanupPlan {
  referencedRelativePaths: string[];
  candidates: CleanupCandidate[];
  backups: BackupFileInfo[];
  totalCandidateBytes: number;
}

export function planGeneratedAssetCleanup(input: {
  dataDir: string;
  now?: number;
  retentionMs?: number;
}): GeneratedAssetCleanupPlan {
  const now = input.now ?? Date.now();
  const retentionMs = input.retentionMs ?? generatedAssetRetentionMs;
  const cutoff = now - retentionMs;
  const referenced = collectReferencedGeneratedAssets(input.dataDir);
  const generatedFiles = [
    ...listFiles(path.join(input.dataDir, "generated-images"), input.dataDir),
    ...listFiles(path.join(input.dataDir, "generated-videos"), input.dataDir)
  ];
  const candidates = generatedFiles
    .filter((file) => file.mtimeMs < cutoff)
    .filter((file) => !referenced.has(file.relativePath))
    .map((file) => ({
      ...file,
      reason: "orphan_expired_generated_asset" as const
    }));

  return {
    referencedRelativePaths: Array.from(referenced).sort(),
    candidates,
    backups: listBackupFiles(input.dataDir),
    totalCandidateBytes: candidates.reduce((sum, item) => sum + item.sizeBytes, 0)
  };
}

export function deleteGeneratedAssetCleanupCandidates(candidates: CleanupCandidate[]): { deleted: number; bytes: number } {
  let deleted = 0;
  let bytes = 0;
  for (const candidate of candidates) {
    try {
      rmSync(candidate.path, { force: true });
      deleted += 1;
      bytes += candidate.sizeBytes;
    } catch {
      // Cleanup is best-effort; a later pass can retry files that remain.
    }
  }
  return { deleted, bytes };
}

function collectReferencedGeneratedAssets(dataDir: string): Set<string> {
  const referenced = new Set<string>();
  for (const filename of ["generation-jobs.json", "video-jobs.json"]) {
    const filePath = path.join(dataDir, filename);
    if (!existsSync(filePath)) continue;
    const parsed = readJson(filePath);
    collectGeneratedAssetStrings(parsed, referenced);
  }
  return referenced;
}

function collectGeneratedAssetStrings(value: unknown, output: Set<string>): void {
  if (typeof value === "string") {
    for (const prefix of ["/generated-images/", "/generated-videos/"]) {
      const index = value.indexOf(prefix);
      if (index >= 0) {
        const rawName = value.slice(index + prefix.length).split(/[?#]/)[0];
        const filename = safeFilename(decodeURIComponent(rawName));
        if (filename) output.add(`${prefix.slice(1)}${filename}`);
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectGeneratedAssetStrings(item, output));
    return;
  }

  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach((item) => collectGeneratedAssetStrings(item, output));
  }
}

function listBackupFiles(dataDir: string): BackupFileInfo[] {
  if (!existsSync(dataDir)) return [];
  return readdirSync(dataDir)
    .filter((filename) => /^generation-jobs\.json\.bak-|^video-jobs\.json\.bak-/.test(filename))
    .map((filename) => fileInfo(path.join(dataDir, filename), dataDir))
    .sort((a, b) => b.sizeBytes - a.sizeBytes);
}

function listFiles(directory: string, baseDir: string): BackupFileInfo[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath, baseDir);
    if (!entry.isFile()) return [];
    return [fileInfo(entryPath, baseDir)];
  });
}

function fileInfo(filePath: string, baseDir: string): BackupFileInfo {
  const stats = statSync(filePath);
  return {
    path: filePath,
    relativePath: path.relative(baseDir, filePath),
    sizeBytes: stats.size,
    mtimeMs: stats.mtimeMs
  };
}

function readJson(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return undefined;
  }
}

function safeFilename(value: string): string | undefined {
  const filename = path.basename(value);
  if (!filename || filename === "." || filename === "..") return undefined;
  return filename;
}
