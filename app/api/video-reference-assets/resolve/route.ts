import { NextResponse } from "next/server";
import { resolveShortVideoReference } from "../../../../src/domain/video/shortVideoResolver";
import { getAuthContextFromRequest } from "../../../../src/server/auth";

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const body = await request.json().catch(() => undefined) as { url?: unknown } | undefined;
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) return NextResponse.json({ error: "missing_reference_link" }, { status: 400 });

  const result = await resolveShortVideoReference({ url, requestUrl: request.url });
  if (!result.stored) {
    return NextResponse.json({
      error: "reference_link_resolve_failed",
      message: result.error ?? "链接解析失败，请上传本地视频。",
      reference: result
    }, { status: 422 });
  }

  return NextResponse.json({
    reference: {
      platform: result.platform,
      sourceUrl: result.sourceUrl,
      finalPageUrl: result.finalPageUrl,
      title: result.title,
      candidateVideoUrl: result.candidateVideoUrl,
      asset: result.stored
    }
  });
}
