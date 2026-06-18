"use client";

import type { BillingCodes } from "@/lib/schemas/billing-codes.schema";

interface BillingSuggestionsProps {
  billing: BillingCodes;
  onReset: () => void;
}

const CONFIDENCE_STYLES = {
  high:   "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low:    "bg-red-100 text-red-700 border-red-200",
} as const;

export function BillingSuggestions({ billing, onReset }: BillingSuggestionsProps) {
  const hasViolations = Object.values(billing.rule_violations).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Billing Code Suggestions</h3>
        <span className="text-xs text-gray-400">
          Per WSIB fee schedule — verify current rates at wsib.ca
        </span>
      </div>

      {/* Rule violations — surfaced prominently from CLINICAL_DOMAIN.md rules */}
      {hasViolations && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
          <p className="text-xs font-semibold text-red-700">⚠️ Billing Rule Warnings</p>
          {billing.rule_violations.faf_same_day_as_form8 && (
            <p className="text-xs text-red-600">RULE 1: FAF cannot be billed on the same day as Form 8 (8M or 8ME)</p>
          )}
          {billing.rule_violations.acupuncture_with_clinic_visit && (
            <p className="text-xs text-red-600">RULE 5: Bill 5130 (acupuncture) OR 5100 — not both in the same session</p>
          )}
          {billing.rule_violations.wrong_form26_code && (
            <p className="text-xs text-red-600">RULE 3: Form 26 must use code 26M — never 26 or 26E</p>
          )}
          {billing.rule_violations.in_home_coded_as_clinic && (
            <p className="text-xs text-red-600">RULE 2: In-home visit should use 5101 ($159.14), not 5100 ($79.58)</p>
          )}
        </div>
      )}

      {/* Suggested codes */}
      <div className="space-y-2">
        {billing.suggestions.map((s) => (
          <div
            key={s.service_code}
            className={`rounded-lg border p-3 ${s.is_primary ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {s.is_primary && (
                  <span className="text-xs bg-green-600 text-white rounded px-1.5 py-0.5 font-bold">PRIMARY</span>
                )}
                <span className="text-sm font-bold text-gray-800">{s.service_code}</span>
                <span className="text-xs text-gray-500">{s.description}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-gray-700">
                  ${s.fee_cad.toFixed(2)}
                </span>
                <span className={`text-xs border rounded px-1.5 py-0.5 font-medium ${CONFIDENCE_STYLES[s.confidence]}`}>
                  {s.confidence}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">{s.rationale}</p>
            {s.rule_warning && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> {s.rule_warning}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Estimated total (excl. HST where applicable)</span>
        <span className="text-sm font-bold text-gray-800">
          ${billing.suggestions.reduce((sum, s) => sum + s.fee_cad, 0).toFixed(2)}
        </span>
      </div>

      {billing.billing_notes && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          {billing.billing_notes}
        </div>
      )}

      {/* Final disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        AI-generated suggestions — clinician must review. Verify all codes and fees before submitting to WSIB.
      </p>

      <button
        onClick={onReset}
        className="w-full py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        ← Start new dictation
      </button>
    </div>
  );
}
