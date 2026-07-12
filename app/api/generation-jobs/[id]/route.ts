import { NextResponse } from "next/server";
import { serializeGenerationJob } from "../../../../src/domain/jobs/generationJobService";
import { getAuthContextFromRequest } from "../../../../src/server/auth";
import { generationJobService } from "../../../../src/server/services";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { id } = await context.params;
  const job = generationJobService.getJob(id);

  if (!job || job.customerId !== auth.user.id) {
    return NextResponse.json({ error: "generation_job_not_found" }, { status: 404 });
  }

  return NextResponse.json({ job: serializeGenerationJob(job) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  if (body.action !== "cancel") {
    return NextResponse.json({ error: "unsupported_generation_job_action" }, { status: 400 });
  }

  const existing = generationJobService.getJob(id);
  if (!existing || existing.customerId !== auth.user.id) {
    return NextResponse.json({ error: "generation_job_not_found" }, { status: 404 });
  }
  if (existing.createdByActorId && existing.createdByActorId !== auth.actor.actorId) {
    return NextResponse.json({ error: "generation_job_owned_by_another_actor" }, { status: 403 });
  }

  const job = await generationJobService.cancelJob(id);
  if (!job) {
    return NextResponse.json({ error: "generation_job_not_found" }, { status: 404 });
  }

  return NextResponse.json({ job: serializeGenerationJob(job) });
}
