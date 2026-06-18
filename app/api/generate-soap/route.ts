import { NextRequest, NextResponse } from "next/server";
import { zodToJsonSchema } from "zod-to-json-schema";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { SoapNoteSchema, type SoapNote } from "@/lib/schemas/soap.schema";

// System prompt from docs/CLINICAL_DOMAIN.md §"Claude Prompt Templates"
const SYSTEM_PROMPT = `You are a clinical documentation assistant helping an Ontario occupational therapist \
structure their session notes for WSIB billing purposes.

Rules:
- Extract only information explicitly stated in the dictation. Never invent clinical findings.
- If a field has no corresponding information, return null.
- Use standard OT/PT abbreviations where appropriate (ROM, MMT, ADL, HEP, etc.).
- All output is a draft for clinician review — label it as such.
- Do not suggest diagnoses beyond what the clinician stated.
- Pain ratings must come from the client's stated score, not be inferred.`;

// Rate limiting — max 10 requests / min per IP (CLAUDE.md requirement)
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

  let dictation: string;
  try {
    const body = await req.json();
    dictation = body?.dictation;
    if (!dictation || typeof dictation !== "string" || dictation.trim().length < 20) {
      return NextResponse.json({ error: "dictation is required (min 20 characters)" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    // 30-second timeout as required by CLAUDE.md
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      temperature: 0,           // Extraction mode — never creative
      system: SYSTEM_PROMPT,
      tools: [{
        name: "structure_soap_note",
        description: "Extract and structure a SOAP note from clinical dictation",
        input_schema: zodToJsonSchema(SoapNoteSchema) as Anthropic.Messages.Tool["input_schema"],
      }],
      tool_choice: { type: "tool", name: "structure_soap_note" },
      messages: [{ role: "user", content: `Clinical dictation:\n\n${dictation.trim()}` }],
    });

    clearTimeout(timeout);

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "No structured output returned by model" }, { status: 502 });
    }

    // Zod validation — never pass raw unvalidated output to client (CLAUDE.md rule)
    const parsed: SoapNote = SoapNoteSchema.parse(toolUse.input);
    return NextResponse.json(parsed);

  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Claude API timeout (30s) — please retry" }, { status: 504 });
    }
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Model output failed validation", detail: err.message }, { status: 502 });
    }
    console.error("[generate-soap]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
