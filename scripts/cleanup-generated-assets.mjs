#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "fs";
import path from "path";

const args = new Set(process.argv.slice(2));
const deleteMode = args.has("--delete");
const hoursArg = process.argv.find((arg) => arg.startsWith("--hours="));
const daysArg = process.argv.find((arg) => arg.startsWith("--days="));
const retentionHours = Math.max(1, Number(hoursArg?.split("=")[1] ?? (daysArg ? Number(daysArg.split("=")[1]) * 24 : 24)));
const projectRoot = process.cwd();
const dataDir = process.env.BAGS_STORE_DATA_DIR || path.join(projectRoot, ".data-bags");
const now = Date.now();
const cutoff = now - retentionHours * 60 * 60 * 1000;

const referenced = collectReferencedGeneratedAssets(dataDir);
const generatedFiles = [
  ...listFiles(path.join(dataDir, "generated-images"), dataDir),
  ...listFiles(path.join(dataDir, "generated-videos"), dataDir)
];
const candidates = generatedFiles
  .filter((file) => file.mtimeMs < cutoff)
  .filter((file) => !referenced.has(file.relativePath));
const backups = listBackupFiles(dataDir);
const totalBytes = candidates.reduce((sum, file) => sum + file.sizeBytes, 0);

console.log(`[cleanup] dataDir=${dataDir}`);
console.log(`[cleanup] mode=${deleteMode ? "delete" : "dry-run"} retentionHours=${retentionHours}`);
console.log(`[cleanup] referenced=${referenced.size} generatedFiles=${generatedFiles.length}`);
console.log(`[cleanup] candidates=${candidates.length} reclaimable=${formatBytes(totalBytes)}`);

for (const file of candidates.slice(0, 50)) {
  console.log(`[candidate] ${file.relativePath} ${formatBytes(file.sizeBytes)} ${new Date(file.mtimeMs).toISOString()}`);
}
if (candidates.length > 50) console.log(`[cleanup] ... ${candidates.length - 50} more candidate(s) omitted`);

if (backups.length) {
  console.log("[cleanup] backup files are listed only, not deleted:");
  for (const file of backups) {
    console.log(`[backup] ${file.relativePath} ${formatBytes(file.sizeBytes)} ${new Date(file.mtimeMs).toISOString()}`);
  }
}

if (deleteMode) {
  for (const file of candidates) {
    rmSync(file.path, { force: true });
  }
  console.log(`[cleanup] deleted=${candidates.length} reclaimed=${formatBytes(totalBytes)}`);
} else {
  console.log("[cleanup] no files deleted. Re-run with --delete only after confirming this list.");
}

function collectReferencedGeneratedAssets(baseDir) {
  const output = new Set();
  for (const filename of ["generation-jobs.json", "video-jobs.json"]) {
    const filePath = path.join(baseDir, filename);
    if (!existsSync(filePath)) continue;
    collectGeneratedAssetStrings(readJson(filePath), output);
  }
  return output;
}

function collectGeneratedAssetStrings(value, output) {
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
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectGeneratedAssetStrings(item, output));
  }
}

function listBackupFiles(baseDir) {
  if (!existsSync(baseDir)) return [];
  return readdirSync(baseDir)
    .filter((filename) => /^generation-jobs\.json\.bak-|^video-jobs\.json\.bak-/.test(filename))
    .map((filename) => fileInfo(path.join(baseDir, filename), baseDir))
    .sort((a, b) => b.sizeBytes - a.sizeBytes);
}

function listFiles(directory, baseDir) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath, baseDir);
    if (!entry.isFile()) return [];
    return [fileInfo(entryPath, baseDir)];
  });
}

function fileInfo(filePath, baseDir) {
  const stats = statSync(filePath);
  return {
    path: filePath,
    relativePath: path.relative(baseDir, filePath),
    sizeBytes: stats.size,
    mtimeMs: stats.mtimeMs
  };
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return undefined;
  }
}

function safeFilename(value) {
  const filename = path.basename(value);
  if (!filename || filename === "." || filename === "..") return undefined;
  return filename;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
