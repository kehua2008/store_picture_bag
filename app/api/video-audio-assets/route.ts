import { NextResponse } from "next/server";
import { storeVideoAudioAsset } from "../../../src/domain/video/audioAssetStore";
import { getAuthContextFromRequest } from "../../../src/server/auth";

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const formData = await request.formData().catch(() => undefined);
  if (!formData) return NextResponse.json({ error: "invalid_multipart_request" }, { status: 400 });
  const file = formData.getAll("audio").find(isAudioFileLike);
  if (!file) return NextResponse.json({ error: "missing_video_audio" }, { status: 400 });

  try {
    const stored = await storeVideoAudioAsset({
      bytes: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type || "audio/mpeg",
      originalName: file.name,
      requestUrl: request.url
    });
    return NextResponse.json({ asset: stored }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: "video_audio_upload_failed",
      message: videoAudioErrorMessage(error)
    }, { status: 422 });
  }
}

function isAudioFileLike(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "type" in value && typeof value.type === "string" && value.type.startsWith("audio/");
}

function videoAudioErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "video_audio_too_large") return "音频超过 30MB，请上传更短的音频。";
  if (message === "unsupported_video_audio_type") return "仅支持 mp3、wav、m4a、aac 音频。";
  if (message === "invalid_video_audio_content") return "音频内容无效，请上传真实可播放的音频文件。";
  if (message === "empty_video_audio") return "音频文件为空。";
  return "音频上传失败。";
}
