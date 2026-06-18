import { NextRequest, NextResponse } from "next/server";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { WsibForm8Schema, type WsibForm8 } from "@/lib/schemas/wsib-form8.schema";
import { WsibForm26Schema, type WsibForm26 } from "@/lib/schemas/wsib-form26.schema";

// Combined schema — Claude fills whichever form type applies
const FormOutputSchema = z.discriminatedUnion("form_type", [
  z.object({ form_type: z.literal("Form8"),  form8:  WsibForm8Schema }),
  z.object({ form_type: z.literal("Form26"), form26: WsibForm26Schema }),
]);

type FormOutput =
  | { form_type: "Form8";  form8:  WsibForm8  }
  | { form_type: "Form26"; form26: WsibForm26 };

const SYSTEM_PROMPT = `You are extracting structured WSIB form fields from a clinical SOAP note.

Rules:
- Extract only what is explicitly stated. If a field is missing, return null.
- Never invent diagnoses, measurements, or clinical findings.
- For Form 8: service_code must be "8M" or "8ME" — no other value is valid.
- For Form 26: service_code must always be "26M" — this is preprinted on the real form.
- Pain ratings come only from the Subjective section.
- RTW (return to work) fields come from the Plan or Assessment section.
- This output is an AI-generated draft — the clinician must review before submission.`;

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
  let formType: "Form8" | "Form26";
  try {
    const body = await req.json();
    soap = body?.soap;
    formType = body?.form_type;
    if (!soap || typeof soap !== "string") {
      return NextResponse.json({ error: "soap (string) is required" }, { status: 400 });
    }
    if (formType !== "Form8" && formType !== "Form26") {
      return NextResponse.json({ error: "form_type must be 'Form8' or 'Form26'" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const schema = formType === "Form8" ? WsibForm8Schema : WsibForm26Schema;
  const toolName = formType === "Form8" ? "extract_form8_fields" : "extract_form26_fields";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      temperature: 0,
      system: SYSTEM_PROMPT,
      tools: [{
        name: toolName,
        description: `Extract WSIB ${formType} fields from the SOAP note`,
        input_schema: zodToJsonSchema(schema) as Anthropic.Messages.Tool["input_schema"],
      }],
      tool_choice: { type: "tool", name: toolName },
      messages: [{
        role: "user",
        content: `SOAP note for ${formType} extraction:\n\n${soap.trim()}`,
      }],
    });

    clearTimeout(timeout);

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "No structured output returned by model" }, { status: 502 });
    }

    // Zod validate — never pass raw output to client
    const parsed = schema.parse(toolUse.input);
    const result: FormOutput =
      formType === "Form8"
        ? { form_type: "Form8",  form8:  parsed as WsibForm8  }
        : { form_type: "Form26", form26: parsed as WsibForm26 };

    return NextResponse.json(result);

  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Claude API timeout (30s) — please retry" }, { status: 504 });
    }
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Model output failed validation", detail: err.message }, { status: 502 });
    }
    console.error("[generate-forms]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
