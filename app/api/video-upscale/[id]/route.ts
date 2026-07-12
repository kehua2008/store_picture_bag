import { NextResponse } from "next/server";
import { serializeVideoUpscaleTask } from "../../../../src/domain/jobs/videoUpscaleService";
import { getAuthContextFromRequest } from "../../../../src/server/auth";
import { videoUpscaleService } from "../../../../src/server/services";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { id } = await context.params;
  await videoUpscaleService.runTask(id).catch(() => undefined);
  const task = videoUpscaleService.getTask(id);
  if (!task || task.customerId !== auth.user.id) {
    return NextResponse.json({ error: "video_upscale_task_not_found" }, { status: 404 });
  }
  if (task.createdByActorId && task.createdByActorId !== auth.actor.actorId) {
    return NextResponse.json({ error: "video_upscale_task_not_found" }, { status: 404 });
  }

  return NextResponse.json({ task: serializeVideoUpscaleTask(task) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "unsupported_video_upscale_action" }, { status: 400 });
  }

  const { id } = await context.params;
  const existing = videoUpscaleService.getTask(id);
  if (!existing || existing.customerId !== auth.user.id) {
    return NextResponse.json({ error: "video_upscale_task_not_found" }, { status: 404 });
  }
  if (existing.createdByActorId && existing.createdByActorId !== auth.actor.actorId) {
    return NextResponse.json({ error: "video_upscale_task_owned_by_another_actor" }, { status: 403 });
  }

  const task = await videoUpscaleService.cancelTask(id);
  if (!task) return NextResponse.json({ error: "video_upscale_task_not_found" }, { status: 404 });
  return NextResponse.json({ task: serializeVideoUpscaleTask(task) });
}
