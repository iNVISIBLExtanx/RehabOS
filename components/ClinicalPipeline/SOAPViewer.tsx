"use client";

import type { SoapNote } from "@/lib/schemas/soap.schema";

interface SOAPViewerProps {
  dictation: string;
  soap: SoapNote;
  onProceedToForm: (formType: "Form8" | "Form26") => void;
  isLoading: boolean;
}

const CONFIDENCE_STYLES = {
  high:   "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-red-100 text-red-700",
} as const;

const SOAP_SECTIONS = [
  { key: "subjective" as const, label: "S — Subjective", hint: "Client's own words, pain rating, HEP compliance" },
  { key: "objective"  as const, label: "O — Objective",  hint: "Measurable findings: ROM, MMT, grip, interventions" },
  { key: "assessment" as const, label: "A — Assessment", hint: "Clinical reasoning, progress toward goals" },
  { key: "plan"       as const, label: "P — Plan",       hint: "Next steps, frequency, referrals, HEP updates" },
];

export function SOAPViewer({ dictation, soap, onProceedToForm, isLoading }: SOAPViewerProps) {
  const formType = soap.clinical_flags.form_required;
  const canProceed = formType === "Form8" || formType === "Form26";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">SOAP Note — AI Draft</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONFIDENCE_STYLES[soap.confidence]}`}>
          {soap.confidence} confidence
        </span>
      </div>

      {/* Disclaimer — CLAUDE.md: "AI-generated draft — clinician must review before submission" */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
        ⚠️ AI-generated draft — clinician must review and edit before submission
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Raw dictation */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Raw Dictation</p>
          <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">{dictation}</p>
        </div>

        {/* Structured SOAP */}
        <div className="space-y-3">
          {SOAP_SECTIONS.map(({ key, label, hint }) => (
            <div key={key} className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs font-semibold text-green-700 mb-0.5">{label}</p>
              <p className="text-xs text-gray-400 mb-1.5">{hint}</p>
              {soap.soap[key] ? (
                <p className="text-sm text-gray-800 leading-relaxed">{soap.soap[key]}</p>
              ) : (
                <p className="text-xs text-gray-300 italic">Not documented in dictation</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Clinical flags */}
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Clinical Flags</p>
        <div className="flex flex-wrap gap-2">
          {soap.clinical_flags.pain_rating !== null && (
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5">
              Pain {soap.clinical_flags.pain_rating}/10
            </span>
          )}
          {soap.clinical_flags.visit_setting && (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded px-2 py-0.5">
              {soap.clinical_flags.visit_setting.replace("_", "-")}
            </span>
          )}
          {soap.clinical_flags.suggested_service_code && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">
              Code: {soap.clinical_flags.suggested_service_code}
            </span>
          )}
          {soap.clinical_flags.rtw_relevant && (
            <span className="text-xs bg-purple-50 text-purple-600 border border-purple-200 rounded px-2 py-0.5">
              RTW discussed
            </span>
          )}
          {soap.clinical_flags.form_required && soap.clinical_flags.form_required !== "none" && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5 font-semibold">
              {soap.clinical_flags.form_required} required
            </span>
          )}
        </div>
      </div>

      {/* Proceed to form */}
      <div className="flex gap-2">
        {canProceed ? (
          <>
            <button
              onClick={() => onProceedToForm(formType as "Form8" | "Form26")}
              disabled={isLoading}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 transition-colors"
            >
              {isLoading ? "Populating form…" : `Populate ${formType} Fields →`}
            </button>
            {formType === "Form8" && (
              <button
                onClick={() => onProceedToForm("Form26")}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 disabled:opacity-40"
              >
                Use Form 26 instead
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400">
            No WSIB form required for this visit based on dictation.
          </p>
        )}
      </div>
    </div>
  );
}
