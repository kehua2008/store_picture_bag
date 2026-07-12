import path from "path";

export function persistentDataDir(): string {
  return process.env.BAGS_STORE_DATA_DIR?.trim() || path.join(process.cwd(), ".data-bags");
}

export function persistentUploadDir(): string {
  return process.env.BAGS_STORE_UPLOAD_DIR?.trim() || path.join(process.cwd(), "public");
}

export function persistentUploadSubdir(name: string): string {
  return path.join(persistentUploadDir(), name);
}
