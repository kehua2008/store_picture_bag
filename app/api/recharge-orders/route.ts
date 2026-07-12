import { NextResponse } from "next/server";
import { rechargeOrderRepository } from "../../../src/server/services";
import { normalizeCreditPlanId, normalizeRechargePaymentMethod } from "../../../src/domain/billing/rechargeOrders";
import { getAuthContextFromRequest, isAdminUser, requireAdminAuth } from "../../../src/server/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId")?.trim() || undefined;
  const status = url.searchParams.get("status")?.trim();
  const paymentMethod = url.searchParams.get("paymentMethod")?.trim();
  const from = parseDate(url.searchParams.get("from"));
  const to = parseDate(url.searchParams.get("to"));
  const auth = await getAuthContextFromRequest(request);
  if (!customerId) {
    if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    if (!isAdminUser(auth.user)) return NextResponse.json({ error: "admin_required" }, { status: 403 });
  } else if (!auth) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  } else if (auth.user.id !== customerId && !isAdminUser(auth.user)) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const data = await rechargeOrderRepository.all(customerId);
  const orders = data.orders.filter((order) => {
    const createdAt = new Date(order.createdAt).getTime();
    if (status && order.status !== status) return false;
    if (paymentMethod && order.paymentMethod !== paymentMethod) return false;
    if (from && createdAt < from.getTime()) return false;
    if (to && createdAt > to.getTime()) return false;
    return true;
  });
  return NextResponse.json({ ...data, orders });
}

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const formData = await request.formData().catch(() => undefined);
  if (!formData) {
    return NextResponse.json({ error: "invalid_multipart_request" }, { status: 400 });
  }

  const planId = normalizeCreditPlanId(formData.get("planId"));
  if (!planId) return NextResponse.json({ error: "unknown_credit_plan" }, { status: 400 });

  const proof = formData.get("proof");
  if (!isImageFileLike(proof)) {
    return NextResponse.json({ error: "missing_payment_proof" }, { status: 400 });
  }

  const result = await rechargeOrderRepository.create({
    customerId: auth.user.id,
    planId,
    paymentMethod: normalizeRechargePaymentMethod(formData.get("paymentMethod")),
    proof
  });

  return NextResponse.json(result, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminAuth(request);
  if (!admin.auth) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_recharge_review" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  const status = payload.status === "approved" || payload.status === "rejected" ? payload.status : undefined;
  if (!id) return NextResponse.json({ error: "missing_recharge_order_id" }, { status: 400 });
  if (!status) return NextResponse.json({ error: "invalid_recharge_order_status" }, { status: 400 });

  const result = await rechargeOrderRepository.review({
    id,
    status,
    rejectReason: typeof payload.rejectReason === "string" ? payload.rejectReason : undefined
  });
  if (!result) return NextResponse.json({ error: "recharge_order_not_found" }, { status: 404 });
  return NextResponse.json(result);
}

function isImageFileLike(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "type" in value && typeof value.type === "string" && value.type.startsWith("image/");
}

function value(input: FormDataEntryValue | null): string | undefined {
  return typeof input === "string" && input.trim() ? input.trim() : undefined;
}

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
