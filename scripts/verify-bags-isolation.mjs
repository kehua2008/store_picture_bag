#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import path from "path";

const root = process.cwd();
const checks = [];

function pass(message) {
  checks.push({ ok: true, message });
}

function fail(message) {
  checks.push({ ok: false, message });
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

const storagePaths = read("src/server/storagePaths.ts");
if (storagePaths.includes("process.env.STORE_DATA_DIR") || storagePaths.includes("process.env.STORE_UPLOAD_DIR")) {
  fail("storagePaths.ts still reads generic STORE_* variables. Bags must only read BAGS_* storage variables.");
} else {
  pass("storagePaths.ts only uses bags-specific storage variables.");
}

const healthScript = read("scripts/server-health-check.mjs");
if (healthScript.includes("store-picture-maker") || healthScript.includes('".data"')) {
  fail("server-health-check.mjs still has clothing-site defaults.");
} else {
  pass("server-health-check.mjs defaults to bags PM2/data names.");
}

const cleanupScript = read("scripts/cleanup-generated-assets.mjs");
if (cleanupScript.includes("process.env.STORE_DATA_DIR") || cleanupScript.includes('".data"')) {
  fail("cleanup-generated-assets.mjs still uses generic/clothing data defaults.");
} else {
  pass("cleanup-generated-assets.mjs defaults to bags data directory.");
}

const packageJson = JSON.parse(read("package.json"));
if (packageJson.scripts?.["start:bags"]?.includes("--port 7777")) {
  pass("package.json has start:bags on port 7777.");
} else {
  fail("package.json is missing start:bags on port 7777.");
}

const productionExample = read(".env.bags.production.example");
for (const required of [
  "APP_PUBLIC_BASE_URL=",
  "BAGS_STORE_DATA_DIR=",
  "BAGS_STORE_UPLOAD_DIR=",
  "YUNWU_API_KEY=",
  "ARK_VIDEO_API_KEY=",
  "VIDEO_UPSCALE_API_KEY="
]) {
  if (productionExample.includes(required)) {
    pass(`production env template includes ${required}`);
  } else {
    fail(`production env template missing ${required}`);
  }
}

for (const item of checks) {
  console.log(`${item.ok ? "[ok]" : "[fail]"} ${item.message}`);
}

const failed = checks.filter((item) => !item.ok);
if (failed.length) process.exit(1);
