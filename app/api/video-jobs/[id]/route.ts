import { NextResponse } from "next/server";
import { serializeVideoJob } from "../../../../src/domain/jobs/videoJobService";
import { getAuthContextFromRequest } from "../../../../src/server/auth";
import { videoJobService } from "../../../../src/server/services";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { id } = await context.params;
  const existing = videoJobService.getJob(id);
  if (!existing || existing.customerId !== auth.user.id) {
    return NextResponse.json({ error: "video_job_not_found" }, { status: 404 });
  }

  const job = await videoJobService.runJob(id) ?? existing;
  return NextResponse.json({ job: serializeVideoJob(job) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "unsupported_video_job_action" }, { status: 400 });
  }

  const { id } = await context.params;
  const existing = videoJobService.getJob(id);
  if (!existing || existing.customerId !== auth.user.id) {
    return NextResponse.json({ error: "video_job_not_found" }, { status: 404 });
  }
  if (existing.createdByActorId && existing.createdByActorId !== auth.actor.actorId) {
    return NextResponse.json({ error: "video_job_owned_by_another_actor" }, { status: 403 });
  }

  const job = await videoJobService.cancelJob(id);
  if (!job) return NextResponse.json({ error: "video_job_not_found" }, { status: 404 });
  return NextResponse.json({ job: serializeVideoJob(job) });
}
