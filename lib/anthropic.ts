import Anthropic from "@anthropic-ai/sdk";

// Server-side only — never import this in client components or "use client" files.
// Only import from /app/api/**/route.ts files.
if (typeof window !== "undefined") {
  throw new Error("lib/anthropic.ts must only be used server-side.");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
