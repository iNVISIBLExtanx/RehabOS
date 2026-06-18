"use client";

import { useState } from "react";
import { DictationInput } from "./DictationInput";
import { SOAPViewer } from "./SOAPViewer";
import { WSIBFormViewer } from "./WSIBFormViewer";
import { BillingSuggestions } from "./BillingSuggestions";
import type { SoapNote } from "@/lib/schemas/soap.schema";
import type { WsibForm8 } from "@/lib/schemas/wsib-form8.schema";
import type { WsibForm26 } from "@/lib/schemas/wsib-form26.schema";
import type { BillingCodes } from "@/lib/schemas/billing-codes.schema";

type PipelineStep = "dictation" | "soap" | "form" | "billing";

type FormResult =
  | { form_type: "Form8"; form8: WsibForm8 }
  | { form_type: "Form26"; form26: WsibForm26 };

interface PipelineState {
  step: PipelineStep;
  dictation: string;
  soap: SoapNote | null;
  formResult: FormResult | null;
  billing: BillingCodes | null;
  error: string | null;
  isLoading: boolean;
}

const STEP_LABELS: Record<PipelineStep, string> = {
  dictation: "1. Dictation",
  soap:      "2. SOAP Note",
  form:      "3. WSIB Form",
  billing:   "4. Billing Codes",
};

export function PipelineContainer() {
  const [state, setState] = useState<PipelineState>({
    step: "dictation",
    dictation: "",
    soap: null,
    formResult: null,
    billing: null,
    error: null,
    isLoading: false,
  });

  function setError(error: string) {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }

  async function handleDictationSubmit(dictation: string) {
    setState((prev) => ({ ...prev, isLoading: true, error: null, dictation }));
    try {
      const res = await fetch("/api/generate-soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dictation }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const soap: SoapNote = await res.json();
      setState((prev) => ({ ...prev, soap, step: "soap", isLoading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate SOAP");
    }
  }

  async function handleProceedToForm(formType: "Form8" | "Form26") {
    if (!state.soap) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const soapText = [
      state.soap.soap.subjective && `S: ${state.soap.soap.subjective}`,
      state.soap.soap.objective  && `O: ${state.soap.soap.objective}`,
      state.soap.soap.assessment && `A: ${state.soap.soap.assessment}`,
      state.soap.soap.plan       && `P: ${state.soap.soap.plan}`,
    ].filter(Boolean).join("\n\n");
    try {
      const res = await fetch("/api/generate-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soap: soapText, form_type: formType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const formResult: FormResult = await res.json();
      setState((prev) => ({ ...prev, formResult, step: "form", isLoading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to populate form");
    }
  }

  async function handleProceedToBilling() {
    if (!state.soap) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const soapText = [
      state.soap.soap.subjective && `S: ${state.soap.soap.subjective}`,
      state.soap.soap.objective  && `O: ${state.soap.soap.objective}`,
      state.soap.soap.assessment && `A: ${state.soap.soap.assessment}`,
      state.soap.soap.plan       && `P: ${state.soap.soap.plan}`,
    ].filter(Boolean).join("\n\n");
    try {
      const res = await fetch("/api/suggest-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soap: soapText }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const billing: BillingCodes = await res.json();
      setState((prev) => ({ ...prev, billing, step: "billing", isLoading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suggest billing codes");
    }
  }

  function reset() {
    setState({
      step: "dictation", dictation: "", soap: null,
      formResult: null, billing: null, error: null, isLoading: false,
    });
  }

  const steps = Object.keys(STEP_LABELS) as PipelineStep[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step progress bar */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const isDone    = steps.indexOf(state.step) > i;
          const isActive  = state.step === s;
          return (
            <div key={s} className="flex items-center flex-1">
              <div className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                isActive ? "bg-green-600 text-white" :
                isDone   ? "bg-green-100 text-green-700" :
                           "bg-gray-100 text-gray-400",
              ].join(" ")}>
                {isDone && <span>✓</span>}
                {STEP_LABELS[s]}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">
          <span>⚠️ {state.error}</span>
          <button onClick={() => setState((p) => ({ ...p, error: null }))} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Active step */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {state.step === "dictation" && (
          <DictationInput onSubmit={handleDictationSubmit} isLoading={state.isLoading} />
        )}
        {state.step === "soap" && state.soap && (
          <SOAPViewer
            dictation={state.dictation}
            soap={state.soap}
            onProceedToForm={handleProceedToForm}
            isLoading={state.isLoading}
          />
        )}
        {state.step === "form" && state.formResult && (
          <WSIBFormViewer
            formData={state.formResult}
            onProceedToBilling={handleProceedToBilling}
            isLoading={state.isLoading}
          />
        )}
        {state.step === "billing" && state.billing && (
          <BillingSuggestions billing={state.billing} onReset={reset} />
        )}
      </div>
    </div>
  );
}
