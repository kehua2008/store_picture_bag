import type { VipshopCategory } from "../vipshop/types";

export type ResearchSourceType = "vipshop_crawler" | "manual_import";

export interface ResearchSample {
  id: string;
  category: VipshopCategory;
  sourceType: ResearchSourceType;
  sourceUrl?: string;
  imageUrl?: string;
  localAssetId?: string;
  title?: string;
  createdAt: string;
  tags?: ResearchAnalysisTags;
}

export interface ResearchAnalysisTags {
  composition: string[];
  background: string[];
  lighting: string[];
  pose: string[];
  subjectOccupancy: number;
  detailFocus: string[];
  forbiddenElementObservations: string[];
}

export interface ResearchSource {
  name: string;
  collect(category: VipshopCategory, limit: number): Promise<ResearchSample[]>;
}

export class ManualResearchSampleRepository {
  private readonly samples = new Map<string, ResearchSample>();

  importSample(input: Omit<ResearchSample, "id" | "createdAt" | "sourceType">): ResearchSample {
    const sample: ResearchSample = {
      ...input,
      id: `sample-${crypto.randomUUID()}`,
      sourceType: "manual_import",
      createdAt: new Date().toISOString()
    };
    this.samples.set(sample.id, sample);
    return sample;
  }

  saveTags(id: string, tags: ResearchAnalysisTags): ResearchSample | undefined {
    const sample = this.samples.get(id);
    if (!sample) return undefined;
    const updated = { ...sample, tags };
    this.samples.set(id, updated);
    return updated;
  }

  all(): ResearchSample[] {
    return Array.from(this.samples.values());
  }
}

export class VipshopCrawlerSource implements ResearchSource {
  readonly name = "vipshop_crawler";

  async collect(_category: VipshopCategory, _limit: number): Promise<ResearchSample[]> {
    // Intentionally a compliant stub: no anti-bot bypass, credentials, or scraping behavior is embedded.
    return [];
  }
}
