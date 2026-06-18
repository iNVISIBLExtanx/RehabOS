// Client-safe WSIB fee schedule reference data (no secrets).
// Fees reflect 2.0% CPI increase effective Jan 1, 2026.

export interface ServiceCode {
  code: string;
  description: string;
  fee: number;
  discipline: string;
  notes?: string;
}

export const SERVICE_CODES: ServiceCode[] = [
  { code: "5100", description: "OT clinic visit",          fee: 79.58,  discipline: "OT" },
  { code: "5101", description: "OT home/community visit",  fee: 159.14, discipline: "OT" },
  { code: "5130", description: "Acupuncture",              fee: 52.31,  discipline: "OT", notes: "Cannot bill with 5100 in same session" },
  { code: "8M",   description: "Form 8 (paper)",           fee: 40.00,  discipline: "OT/PT", notes: "Only code on first visit. FAF not same day." },
  { code: "8ME",  description: "Form 8 (electronic)",      fee: 45.00,  discipline: "OT/PT", notes: "Only code on first visit. FAF not same day." },
  { code: "26M",  description: "Form 26 (paper)",          fee: 35.00,  discipline: "OT/PT", notes: "Always preprinted code 26M — never 26 or 26E" },
  { code: "26ME", description: "Form 26 (electronic)",     fee: 40.00,  discipline: "OT/PT" },
  { code: "FAF",  description: "Functional Abilities Form", fee: 45.00,  discipline: "OT/PT", notes: "NOT billed same day as Form 8" },
  { code: "P101", description: "PT initial assessment",    fee: 74.25,  discipline: "PT" },
  { code: "P201", description: "PT follow-up treatment",   fee: 62.40,  discipline: "PT" },
  { code: "S100", description: "SLP assessment",           fee: 89.10,  discipline: "SLP" },
  { code: "S200", description: "SLP treatment session",    fee: 74.25,  discipline: "SLP" },
];

export const SERVICE_CODE_MAP: Record<string, ServiceCode> = Object.fromEntries(
  SERVICE_CODES.map((sc) => [sc.code, sc])
);
