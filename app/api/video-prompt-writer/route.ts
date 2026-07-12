import { NextResponse } from "next/server";
import { creditsForRule } from "../../../src/domain/billing/creditPlans";
import { videoPromptWriterSchema } from "../../../src/server/schemas";
import { getAuthContextFromRequest } from "../../../src/server/auth";
import { createVideoPromptWriter, recordVideoPromptWriterUsage, VideoPromptWriterError } from "../../../src/domain/video/videoPromptWriter";
import { rechargeOrderRepository } from "../../../src/server/services";

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const json = await request.json().catch(() => undefined);
  const parsed = videoPromptWriterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({
      error: "invalid_video_prompt_writer_request",
      issues: parsed.error.issues
    }, { status: 400 });
  }

  const chargeRuleId = parsed.data.mode === "revise" ? "video-prompt-revise" : "video-prompt-writer";
  const credits = creditsForRule(chargeRuleId);
  if (credits > 0) {
    const account = await rechargeOrderRepository.account(auth.user.id);
    if (account.balanceCredits < credits) {
      return NextResponse.json({ error: "insufficient_credits", requiredCredits: credits, account }, { status: 402 });
    }
  }

  try {
    const result = await createVideoPromptWriter().write(parsed.data);
    let usageRecordId: string | undefined;
    try {
      usageRecordId = recordVideoPromptWriterUsage({
        customerId: auth.user.id,
        mode: parsed.data.mode,
        imageCount: parsed.data.productImages.length,
        result
      }).id;
    } catch {
      usageRecordId = undefined;
    }
    if (credits > 0) {
      await rechargeOrderRepository.debitUsageCredits({
        customerId: auth.user.id,
        credits,
        actorId: auth.actor.actorId,
        actorName: auth.actor.actorName,
        reason: parsed.data.mode === "revise" ? "AI 视频提示词改写成功，扣除积分" : "AI 视频提示词代写成功，扣除积分"
      });
    }
    return NextResponse.json({ ...result, usageRecordId });
  } catch (error) {
    if (error instanceof VideoPromptWriterError) {
      return NextResponse.json({
        error: error.code,
        message: error.message
      }, { status: error.status });
    }
    return NextResponse.json({
      error: "video_prompt_writer_failed",
      message: "AI提示词代写失败，请稍后重试。"
    }, { status: 500 });
  }
}
