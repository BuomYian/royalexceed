import { NextResponse, type NextRequest } from "next/server";
import { submitGeneralLead } from "@/lib/actions/leads";
import { generalLeadSchema } from "@/lib/validations/lead";

/**
 * REST endpoint for external clients (a future mobile app, a Zapier/CRM
 * webhook, etc.) per spec §9 — internal site forms use the Server Action
 * (`submitGeneralLead`) directly and don't hit this route. Same validation,
 * rate-limiting, honeypot, and Turnstile checks either way.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generalLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const result = await submitGeneralLead(parsed.data);
  if (!result.success) {
    return NextResponse.json(result, { status: 429 });
  }
  return NextResponse.json(result, { status: 201 });
}
