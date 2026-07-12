import { NextResponse } from "next/server";
import { creditsForRule } from "../../../../src/domain/billing/creditPlans";
import { imageHashForBytes } from "../../../../src/domain/styleLibrary/styleLibrary";
import { getAuthContextFromRequest } from "../../../../src/server/auth";
import { rechargeOrderRepository, styleLibraryRepository } from "../../../../src/server/services";

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const formData = await request.formData().catch(() => undefined);
  if (!formData) return NextResponse.json({ error: "invalid_multipart_request" }, { status: 400 });

  const file = formData.getAll("image").find(isImageFileLike) ?? formData.getAll("images").find(isImageFileLike);
  if (!file) return NextResponse.json({ error: "missing_style_reference_image" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const imageHash = imageHashForBytes(bytes);
  const existing = await styleLibraryRepository.findAnalyzedSampleByHash(imageHash);
  if (existing?.stylePrompt) {
    return NextResponse.json({
      reused: true,
      chargedCredits: 0,
      sample: existing,
      stylePrompt: existing.stylePrompt,
      negativePrompt: existing.negativePrompt,
      analysis: existing.analysis,
      imageHash: existing.imageHash,
      model: existing.analyzerModel,
      usage: existing.analyzerUsage
    });
  }

  const analysisCostCredits = creditsForRule("style-reference-analysis");
  const account = await rechargeOrderRepository.account(auth.user.id);
  if (account.balanceCredits < analysisCostCredits) {
    return NextResponse.json({ error: "insufficient_credits", requiredCredits: analysisCostCredits, account }, { status: 402 });
  }

  const analysis = await styleLibraryRepository.analyzeReferenceImage({
    file,
    bytes,
    platform: value(formData.get("platform")),
    category: value(formData.get("category")),
    imageType: value(formData.get("imageType")),
    styleName: value(formData.get("styleName")) ?? "待归类风格"
  });

  const { ledgerEntry } = await rechargeOrderRepository.debitStyleAnalysisCredits({
    customerId: auth.user.id,
    credits: analysisCostCredits,
    actorId: auth.actor.actorId,
    actorName: auth.actor.actorName,
    reason: "参考风格解析成功，扣除积分"
  });

  const [sample] = await styleLibraryRepository.createSamples([
    {
      file,
      sourceType: "user_replicate",
      status: "pending_review",
      sourceNote: value(formData.get("sourceNote")) ?? "用户端参考风格解析入库",
      platform: value(formData.get("platform")),
      category: value(formData.get("category")),
      imageType: value(formData.get("imageType")),
      styleName: analysis.suggestion?.styleName ?? value(formData.get("styleName")) ?? "待归类风格",
      imageHash: analysis.imageHash,
      analysis: analysis.analysis,
      stylePrompt: analysis.stylePrompt,
      negativePrompt: analysis.negativePrompt,
      suggestion: analysis.suggestion,
      analyzer: analysis.analyzer,
      analyzerModel: analysis.analyzerModel,
      analyzerUsage: analysis.analyzerUsage,
      analysisVersion: analysis.analysisVersion,
      analysisCostCredits,
      customerId: auth.user.id,
      billingLedgerEntryId: ledgerEntry.id
    }
  ]);

  return NextResponse.json({
    reused: false,
    chargedCredits: analysisCostCredits,
    sample,
    stylePrompt: sample.stylePrompt,
    negativePrompt: sample.negativePrompt,
    analysis: sample.analysis,
    imageHash: sample.imageHash,
    model: sample.analyzerModel,
    usage: sample.analyzerUsage
  }, { status: 201 });
}

function isImageFileLike(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "type" in value && typeof value.type === "string" && value.type.startsWith("image/");
}

function value(input: FormDataEntryValue | null): string | undefined {
  return typeof input === "string" && input.trim() ? input.trim() : undefined;
}
