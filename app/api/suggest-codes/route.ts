import { NextRequest, NextResponse } from "next/server";
import { zodToJsonSchema } from "zod-to-json-schema";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { BillingCodesSchema, type BillingCodes } from "@/lib/schemas/billing-codes.schema";

// Billing rules from docs/CLINICAL_DOMAIN.md §"Billing Code Rules"
const SYSTEM_PROMPT = `You are a WSIB billing expert helping Ontario OT/PT clinicians select the correct service codes.

WSIB billing rules — you must follow these strictly:

RULE 1: Form 8 (8M or 8ME) is the ONLY code on a first visit.
        A FAF ($45) is NOT paid on the same day as Form 8. Flag this as a rule_violation.

RULE 2: Home/community visits (5101 = $159.14) bill significantly higher than clinic visits (5100 = $79.58).
        Always check the visit setting and flag if in-home visit is coded as clinic.

RULE 3: Form 26 uses preprinted code 26M — never suggest code 26 or 26E as a substitute.
        Flag as rule_violation if the wrong code would be used.

RULE 4: WSIB applied 2.0% CPI fee increase effective Jan 1, 2026.
        Label all fees as "per WSIB fee schedule — verify current rates."

RULE 5: A session that includes acupuncture (5130 = $52.31) bills 5130, NOT both 5100 and 5130.
        Flag as rule_violation if both are suggested.

Always return:
- is_primary: true for the main visit service code (e.g. 5101), false for form codes (8ME, 26M, FAF)
- rule_warning: null unless a rule is at risk of being violated
- confidence: "high" if visit setting and form type are clear, "low" if ambiguous`;

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded — max 10 requests/min" }, { status: 429 });
  }

  let soap: string;
  let formData: Record<string, unknown> | undefined;
  try {
    const body = await req.json();
    soap = body?.soap;
    formData = body?.form_data;
    if (!soap || typeof soap !== "string") {
      return NextResponse.json({ error: "soap (string) is required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const context = [
    `SOAP note:\n${soap.trim()}`,
    formData
      ? `\nForm data (pre-populated):\n${JSON.stringify(formData, null, 2)}`
      : "",
  ].join("");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0.3,          // Slight creativity for rationale text — still grounded
      system: SYSTEM_PROMPT,
      tools: [{
        name: "suggest_billing_codes",
        description: "Suggest WSIB billing service codes for this clinical visit",
        input_schema: zodToJsonSchema(BillingCodesSchema) as Anthropic.Messages.Tool["input_schema"],
      }],
      tool_choice: { type: "tool", name: "suggest_billing_codes" },
      messages: [{ role: "user", content: context }],
    });

    clearTimeout(timeout);

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "No structured output returned by model" }, { status: 502 });
    }

    // Zod validate — never pass raw output to client
    const parsed: BillingCodes = BillingCodesSchema.parse(toolUse.input);
    return NextResponse.json(parsed);

  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Claude API timeout (30s) — please retry" }, { status: 504 });
    }
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Model output failed validation", detail: err.message }, { status: 502 });
    }
    console.error("[suggest-codes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
