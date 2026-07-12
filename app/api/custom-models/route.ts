import { NextResponse } from "next/server";
import { serializeCustomModel } from "../../../src/domain/models/customModelRepository";
import { customModelRepository } from "../../../src/server/services";
import { getAuthContextFromRequest } from "../../../src/server/auth";

export async function GET(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const models = await customModelRepository.all(auth.user.id);
  return NextResponse.json({ models: models.map(serializeCustomModel) });
}

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const formData = await request.formData().catch(() => undefined);
  if (!formData) {
    return NextResponse.json({ error: "invalid_multipart_request" }, { status: 400 });
  }

  const file = formData.get("modelImage");
  if (!isImageFileLike(file)) {
    return NextResponse.json({ error: "missing_model_image_upload" }, { status: 400 });
  }

  if ((await customModelRepository.all(auth.user.id)).length >= 5) {
    return NextResponse.json({ error: "custom_model_limit_reached", max: 5 }, { status: 400 });
  }

  const model = await customModelRepository.save({
    customerId: auth.user.id,
    createdByActorId: auth.actor.actorId,
    name: String(formData.get("name") || file.name || "自定义持包模特"),
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    file,
    modelGender: stringValue(formData.get("modelGender")),
    modelAgeRange: stringValue(formData.get("modelAgeRange")),
    modelSkinTone: stringValue(formData.get("modelSkinTone")),
    modelHairStyle: stringValue(formData.get("modelHairStyle")),
    modelProfile: stringValue(formData.get("modelProfile"))
  });

  return NextResponse.json({ model: serializeCustomModel(model) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const body = await request.json().catch(() => undefined) as { id?: unknown; name?: unknown } | undefined;
  const id = typeof body?.id === "string" ? body.id : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!id || !name) {
    return NextResponse.json({ error: "invalid_custom_model_update" }, { status: 400 });
  }

  const existing = await customModelRepository.findById(id);
  if (!existing || existing.customerId !== auth.user.id) {
    return NextResponse.json({ error: "custom_model_not_found" }, { status: 404 });
  }

  const model = await customModelRepository.rename(id, name.slice(0, 40));
  if (!model) {
    return NextResponse.json({ error: "custom_model_not_found" }, { status: 404 });
  }

  return NextResponse.json({ model: serializeCustomModel(model) });
}

export async function DELETE(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const body = await request.json().catch(() => undefined) as { id?: unknown } | undefined;
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ error: "invalid_custom_model_delete" }, { status: 400 });
  }

  const existing = await customModelRepository.findById(id);
  if (!existing || existing.customerId !== auth.user.id) {
    return NextResponse.json({ error: "custom_model_not_found" }, { status: 404 });
  }

  const deleted = await customModelRepository.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: "custom_model_not_found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, id });
}

function isImageFileLike(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "name" in value &&
    Number(value.size) > 0
  );
}

function stringValue(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
