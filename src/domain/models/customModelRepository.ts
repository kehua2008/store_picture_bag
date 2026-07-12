import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { persistentDataDir, persistentUploadSubdir } from "../../server/storagePaths";

export interface CustomModelAsset {
  id: string;
  customerId?: string;
  createdByActorId?: string;
  name: string;
  filename: string;
  mimeType: string;
  createdAt: string;
  file: Blob;
  modelGender?: string;
  modelAgeRange?: string;
  modelSkinTone?: string;
  modelHairStyle?: string;
  modelProfile?: string;
}

export interface SerializableCustomModelAsset extends Omit<CustomModelAsset, "file"> {
  imageUrl: string;
}

type StoredCustomModelAsset = Omit<CustomModelAsset, "file"> & { storedFilename: string };

interface CustomModelData {
  models: StoredCustomModelAsset[];
}

export class InMemoryCustomModelRepository {
  private readonly models = new Map<string, CustomModelAsset>();

  save(input: Omit<CustomModelAsset, "id" | "createdAt">): CustomModelAsset {
    const model: CustomModelAsset = {
      ...input,
      id: `model-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    this.models.set(model.id, model);
    return model;
  }

  findById(id: string): CustomModelAsset | undefined {
    return this.models.get(id);
  }

  rename(id: string, name: string): CustomModelAsset | undefined {
    const model = this.models.get(id);
    if (!model) return undefined;
    const next = { ...model, name };
    this.models.set(id, next);
    return next;
  }

  delete(id: string): boolean {
    return this.models.delete(id);
  }

  all(customerId?: string): CustomModelAsset[] {
    return Array.from(this.models.values())
      .filter((model) => !customerId || model.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export class FileCustomModelRepository {
  private readonly dataFile: string;
  private readonly uploadDir: string;

  constructor(options: { dataDir?: string; uploadDir?: string } = {}) {
    this.dataFile = path.join(options.dataDir ?? persistentDataDir(), "custom-models.json");
    this.uploadDir = options.uploadDir ?? persistentUploadSubdir("custom-models");
  }

  async save(input: Omit<CustomModelAsset, "id" | "createdAt">): Promise<CustomModelAsset> {
    const data = await this.readData();
    const id = `model-${crypto.randomUUID()}`;
    const filename = safeFilename(input.filename || `${id}.jpg`);
    const storedFilename = `${id}-${filename}`;
    await mkdir(this.uploadDir, { recursive: true });
    await writeFile(path.join(this.uploadDir, storedFilename), await fileToBuffer(input.file));

    const { file: _file, ...metadata } = input;
    const stored: StoredCustomModelAsset = {
      ...metadata,
      id,
      filename,
      storedFilename,
      createdAt: new Date().toISOString()
    };
    data.models = [stored, ...data.models];
    await this.writeData(data);
    return this.toAsset(stored);
  }

  async findById(id: string): Promise<CustomModelAsset | undefined> {
    const data = await this.readData();
    const model = data.models.find((item) => item.id === id);
    return model ? this.toAsset(model) : undefined;
  }

  async rename(id: string, name: string): Promise<CustomModelAsset | undefined> {
    const data = await this.readData();
    const target = data.models.find((item) => item.id === id);
    if (!target) return undefined;
    const updated = { ...target, name };
    data.models = data.models.map((item) => item.id === id ? updated : item);
    await this.writeData(data);
    return this.toAsset(updated);
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.readData();
    const target = data.models.find((item) => item.id === id);
    if (!target) return false;
    data.models = data.models.filter((item) => item.id !== id);
    await this.writeData(data);
    await unlink(path.join(this.uploadDir, target.storedFilename)).catch(() => undefined);
    return true;
  }

  async all(customerId?: string): Promise<CustomModelAsset[]> {
    const data = await this.readData();
    const models = await Promise.all(data.models.map((item) => this.toAsset(item).catch(() => undefined)));
    return models
      .filter((item): item is CustomModelAsset => Boolean(item))
      .filter((model) => !customerId || model.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private async readData(): Promise<CustomModelData> {
    try {
      const raw = await readFile(this.dataFile, "utf8");
      const parsed = JSON.parse(raw) as Partial<CustomModelData>;
      return {
        models: Array.isArray(parsed.models) ? parsed.models.filter(isStoredModel) : []
      };
    } catch {
      return { models: [] };
    }
  }

  private async writeData(data: CustomModelData): Promise<void> {
    await mkdir(path.dirname(this.dataFile), { recursive: true });
    await writeFile(this.dataFile, JSON.stringify(data, null, 2));
  }

  private async toAsset(model: StoredCustomModelAsset): Promise<CustomModelAsset> {
    const bytes = await readFile(path.join(this.uploadDir, model.storedFilename));
    const { storedFilename: _storedFilename, ...asset } = model;
    return {
      ...asset,
      file: new Blob([bytes], { type: model.mimeType })
    };
  }
}

export function serializeCustomModel(model: CustomModelAsset): SerializableCustomModelAsset {
  const { file: _file, ...serializable } = model;
  return {
    ...serializable,
    imageUrl: `/api/custom-models/${model.id}/image`
  };
}

function safeFilename(filename: string): string {
  return filename.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").slice(0, 120) || "custom-model.jpg";
}

function isStoredModel(value: unknown): value is StoredCustomModelAsset {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "filename" in value &&
    "storedFilename" in value &&
    "mimeType" in value &&
    "createdAt" in value
  );
}

async function fileToBuffer(file: Blob): Promise<Buffer> {
  if (typeof file.arrayBuffer === "function") {
    return Buffer.from(await file.arrayBuffer());
  }
  if ("text" in file && typeof file.text === "function") {
    return Buffer.from(await file.text());
  }
  return Buffer.from(String(file));
}
