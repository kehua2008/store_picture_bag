import { NextResponse } from "next/server";
import { getAuthContextFromRequest } from "../../../src/server/auth";
import { storeUpscaleVideoAsset } from "../../../src/domain/video/upscaleAssetStore";

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const form = await request.formData().catch(() => undefined);
  const file = form?.get("video");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_video_file", message: "请上传需要高清输出的视频。" }, { status: 400 });
  }

  try {
    const stored = await storeUpscaleVideoAsset({
      bytes: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type || "video/mp4",
      originalName: file.name,
      requestUrl: request.url
    });
    return NextResponse.json({ asset: stored });
  } catch (error) {
    const code = error instanceof Error ? error.message : "video_upscale_asset_failed";
    return NextResponse.json(
      {
        error: code,
        message: messageForUploadError(code)
      },
      { status: code === "upscale_video_too_large" ? 413 : 422 }
    );
  }
}

function messageForUploadError(code: string): string {
  if (code === "unsupported_upscale_video_type") return "暂时只支持 mp4、mov、webm 视频。";
  if (code === "upscale_video_too_large" || code === "reference_video_too_large") return "视频文件过大，请压缩后再上传。";
  if (code === "invalid_reference_video_content") return "上传内容不是有效视频文件，请重新选择视频。";
  if (code === "empty_reference_video") return "视频文件为空，请重新选择。";
  return "视频上传失败，请稍后重试。";
}
