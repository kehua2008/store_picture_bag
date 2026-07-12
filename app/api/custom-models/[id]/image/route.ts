import { NextResponse } from "next/server";
import { customModelRepository } from "../../../../../src/server/services";
import { getAuthContextFromRequest } from "../../../../../src/server/auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { id } = await context.params;
  const model = await customModelRepository.findById(id);

  if (!model || model.customerId !== auth.user.id) {
    return NextResponse.json({ error: "custom_model_not_found" }, { status: 404 });
  }

  return new Response(model.file, {
    headers: {
      "Content-Type": model.mimeType,
      "Cache-Control": "no-store"
    }
  });
}
