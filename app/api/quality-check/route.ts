import { NextResponse } from "next/server";
import { runQualityChecks } from "../../../src/domain/quality/checks";
import { qualityCheckSchema } from "../../../src/server/schemas";

export async function POST(request: Request) {
  const json = await request.json().catch(() => undefined);
  const parsed = qualityCheckSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_quality_check_request",
        issues: parsed.error.issues
      },
      { status: 400 }
    );
  }

  const report = runQualityChecks(parsed.data);
  return NextResponse.json({ report });
}
