import { mkdtemp, readFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { describe, expect, it } from "vitest";
import { FileCustomModelRepository } from "../../src/domain/models/customModelRepository";

describe("FileCustomModelRepository", () => {
  it("persists custom model metadata and image bytes across repository instances", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "custom-model-repo-"));
    const dataDir = path.join(workspace, "data");
    const uploadDir = path.join(workspace, "uploads");
    const first = new FileCustomModelRepository({ dataDir, uploadDir });

    const saved = await first.save({
      name: "专属模特",
      filename: "model.jpg",
      mimeType: "image/jpeg",
      file: {
        type: "image/jpeg",
        arrayBuffer: async () => new TextEncoder().encode("model-bytes").buffer
      } as Blob,
      modelGender: "female",
      modelAgeRange: "young_adult"
    });

    const second = new FileCustomModelRepository({ dataDir, uploadDir });
    const loaded = await second.findById(saved.id);
    const all = await second.all();

    expect(loaded).toEqual(expect.objectContaining({
      id: saved.id,
      name: "专属模特",
      filename: "model.jpg",
      mimeType: "image/jpeg",
      modelGender: "female",
      modelAgeRange: "young_adult"
    }));
    const storedBytes = await readFile(path.join(uploadDir, `${saved.id}-model.jpg`), "utf8");
    expect(storedBytes).toBe("model-bytes");
    expect(all.map((item) => item.id)).toEqual([saved.id]);
  });
});
