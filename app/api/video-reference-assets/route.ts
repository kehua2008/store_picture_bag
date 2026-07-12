import { NextResponse } from "next/server";
import { storeReferenceVideo } from "../../../src/domain/video/referenceAssetStore";
import { getAuthContextFromRequest } from "../../../src/server/auth";

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const formData = await request.formData().catch(() => undefined);
  if (!formData) return NextResponse.json({ error: "invalid_multipart_request" }, { status: 400 });
  const file = formData.getAll("video").find(isVideoFileLike);
  if (!file) return NextResponse.json({ error: "missing_reference_video" }, { status: 400 });

  try {
    const stored = await storeReferenceVideo({
      bytes: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type || "video/mp4",
      originalName: file.name,
      requestUrl: request.url
    });
    return NextResponse.json({ asset: stored }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: "reference_video_upload_failed",
      message: referenceAssetErrorMessage(error)
    }, { status: 422 });
  }
}

function isVideoFileLike(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "type" in value && typeof value.type === "string" && value.type.startsWith("video/");
}

function referenceAssetErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "reference_video_too_large") return "参考视频超过 120MB，请上传更短的视频。";
  if (message === "reference_video_too_small") return "参考视频文件过小，无法作为有效视频参考。";
  if (message === "unsupported_reference_video_type") return "仅支持 mp4、mov、webm 参考视频。";
  if (message === "invalid_reference_video_content") return "参考视频内容无效，请上传真实可播放的 mp4、mov 或 webm 文件。";
  if (message === "empty_reference_video") return "参考视频文件为空。";
  return "参考视频上传失败。";
}
