"use client";

import { useState } from "react";
import type { WsibForm8 } from "@/lib/schemas/wsib-form8.schema";
import type { WsibForm26 } from "@/lib/schemas/wsib-form26.schema";

type FormData =
  | { form_type: "Form8"; form8: WsibForm8 }
  | { form_type: "Form26"; form26: WsibForm26 };

interface WSIBFormViewerProps {
  formData: FormData;
  onProceedToBilling: () => void;
  isLoading: boolean;
}

type ReviewStep = "edit" | "review" | "confirmed";

// Helper — editable text field
function Field({
  label, value, onChange, hint,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-0.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input
        type="text"
        className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Functional abilities grid — shared between Form 8 and Form 26
const FA_ABILITIES = [
  "bend_twist", "climb", "kneel", "lift",
  "operate_motor_vehicle", "push_pull", "sit", "stand",
  "use_upper_extremities", "walk",
] as const;

type AbilityKey = typeof FA_ABILITIES[number];

function FunctionalAbilitiesGrid({
  abilities,
  options,
  onChange,
}: {
  abilities: Record<AbilityKey, string | null>;
  options: string[];
  onChange: (key: AbilityKey, val: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Functional Abilities
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {FA_ABILITIES.map((key) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600 capitalize">{key.replace(/_/g, " ")}</span>
            <select
              className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700"
              value={abilities[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
            >
              <option value="">—</option>
              {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WSIBFormViewer({ formData, onProceedToBilling, isLoading }: WSIBFormViewerProps) {
  const [step, setStep] = useState<ReviewStep>("edit");

  // Local editable copies — CLAUDE.md: "Render all fields as editable inputs"
  const [form8, setForm8] = useState<WsibForm8>(
    formData.form_type === "Form8" ? formData.form8 : {} as WsibForm8
  );
  const [form26, setForm26] = useState<WsibForm26>(
    formData.form_type === "Form26" ? formData.form26 : {} as WsibForm26
  );

  const isForm8 = formData.form_type === "Form8";

  function updateForm8<K extends keyof WsibForm8>(key: K, val: WsibForm8[K]) {
    setForm8((prev) => ({ ...prev, [key]: val }));
  }

  function updateForm26<K extends keyof WsibForm26>(key: K, val: WsibForm26[K]) {
    setForm26((prev) => ({ ...prev, [key]: val }));
  }

  function updateFaForm8(key: AbilityKey, val: string) {
    setForm8((prev) => ({
      ...prev,
      functional_abilities: { ...(prev.functional_abilities ?? {}), [key]: val || null } as WsibForm8["functional_abilities"],
    }));
  }

  function updateFaForm26(key: AbilityKey, val: string) {
    setForm26((prev) => ({
      ...prev,
      functional_abilities: { ...(prev.functional_abilities ?? {}), [key]: val || null } as WsibForm26["functional_abilities"],
    }));
  }

  if (step === "review") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800 mb-1">Review & Confirm</p>
          <p className="text-xs text-amber-700">
            You are about to confirm this {isForm8 ? "Form 8" : "Form 26"} draft.
            This does <strong>not</strong> submit to WSIB — a clinician must sign before submission.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-1 font-mono">
          {isForm8 ? (
            <>
              <p><strong>Worker:</strong> {form8.worker_first_name} {form8.worker_last_name}</p>
              <p><strong>Diagnosis:</strong> {form8.diagnosis}</p>
              <p><strong>RTW Status:</strong> {form8.rtw_status}</p>
              <p><strong>Service Code:</strong> {form8.service_code}</p>
              <p><strong>WSIB Provider:</strong> {form8.wsib_provider_id}</p>
            </>
          ) : (
            <>
              <p><strong>Worker:</strong> {form26.worker_first_name} {form26.worker_last_name}</p>
              <p><strong>Claim #:</strong> {form26.claim_number}</p>
              <p><strong>RTW Status:</strong> {form26.rtw_status}</p>
              <p><strong>Prognosis:</strong> {form26.prognosis}</p>
              <p><strong>Service Code:</strong> {form26.service_code}</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStep("edit")}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:border-gray-300"
          >
            ← Back to edit
          </button>
          <button
            onClick={() => { setStep("confirmed"); onProceedToBilling(); }}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            {isLoading ? "Analysing billing…" : "Confirm draft & get billing codes →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {isForm8 ? "Form 8 — First Report (0008A)" : "Form 26 — Progress Report (0896A)"}
        </h3>
        <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
          AI draft — editable
        </span>
      </div>

      {/* Mandatory disclaimer — CLAUDE.md */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
        ⚠️ AI-generated draft — clinician must review before submission. Fields are pre-populated and fully editable.
      </div>

      {isForm8 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"      value={form8.worker_first_name} onChange={(v) => updateForm8("worker_first_name", v)} />
            <Field label="Last name"       value={form8.worker_last_name}  onChange={(v) => updateForm8("worker_last_name", v)} />
            <Field label="Date of birth"   value={form8.worker_dob}        onChange={(v) => updateForm8("worker_dob", v)} />
            <Field label="Date of incident" value={form8.date_of_incident} onChange={(v) => updateForm8("date_of_incident", v)} />
            <Field label="Employer"        value={form8.employer_name}     onChange={(v) => updateForm8("employer_name", v)} />
            <Field label="Occupation"      value={form8.worker_occupation} onChange={(v) => updateForm8("worker_occupation", v)} />
          </div>
          <Field
            label="How injury occurred"
            value={form8.how_injury_occurred}
            onChange={(v) => updateForm8("how_injury_occurred", v)}
          />
          <Field label="Diagnosis" value={form8.diagnosis} onChange={(v) => updateForm8("diagnosis", v)} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pain at rest (0–10)"     value={form8.pain_at_rest?.toString()}     onChange={(v) => updateForm8("pain_at_rest", v ? Number(v) : null)} />
            <Field label="Pain with activity"       value={form8.pain_with_activity?.toString()} onChange={(v) => updateForm8("pain_with_activity", v ? Number(v) : null)} />
            <Field label="Treatment duration"       value={form8.treatment_duration}           onChange={(v) => updateForm8("treatment_duration", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">RTW Status</label>
              <select
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm bg-white"
                value={form8.rtw_status ?? ""}
                onChange={(e) => updateForm8("rtw_status", e.target.value as WsibForm8["rtw_status"])}
              >
                <option value="">—</option>
                <option value="regular_duties">Regular duties</option>
                <option value="modified_duties">Modified duties</option>
                <option value="unable_to_work">Unable to work</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Service Code
                <span className="ml-1 text-gray-400">(8M = paper, 8ME = electronic)</span>
              </label>
              <select
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm bg-white"
                value={form8.service_code ?? ""}
                onChange={(e) => updateForm8("service_code", e.target.value as "8M" | "8ME")}
              >
                <option value="">—</option>
                <option value="8ME">8ME — Electronic ($45.00)</option>
                <option value="8M">8M — Paper ($40.00)</option>
              </select>
            </div>
          </div>
          {form8.functional_abilities !== null && (
            <FunctionalAbilitiesGrid
              abilities={(form8.functional_abilities ?? {}) as Record<AbilityKey, string | null>}
              options={["able", "some", "not_able"]}
              onChange={updateFaForm8}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"      value={form26.worker_first_name} onChange={(v) => updateForm26("worker_first_name", v)} />
            <Field label="Last name"       value={form26.worker_last_name}  onChange={(v) => updateForm26("worker_last_name", v)} />
            <Field label="Claim number"    value={form26.claim_number}      onChange={(v) => updateForm26("claim_number", v)} />
            <Field label="Date of incident" value={form26.date_of_incident} onChange={(v) => updateForm26("date_of_incident", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Change since last visit</label>
              <select
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm bg-white"
                value={form26.change_since_last ?? ""}
                onChange={(e) => updateForm26("change_since_last", e.target.value as WsibForm26["change_since_last"])}
              >
                <option value="">—</option>
                <option value="recovered">Recovered</option>
                <option value="improving">Improving</option>
                <option value="unchanged">Unchanged</option>
                <option value="worsening">Worsening</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">RTW Status</label>
              <select
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm bg-white"
                value={form26.rtw_status ?? ""}
                onChange={(e) => updateForm26("rtw_status", e.target.value as WsibForm26["rtw_status"])}
              >
                <option value="">—</option>
                <option value="regular_duties">Regular duties</option>
                <option value="modified_duties">Modified duties</option>
                <option value="unable_to_work">Unable to work</option>
              </select>
            </div>
          </div>
          <Field label="Current diagnosis" value={form26.current_diagnosis} onChange={(v) => updateForm26("current_diagnosis", v)} />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prognosis</label>
            <select
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm bg-white"
              value={form26.prognosis ?? ""}
              onChange={(e) => updateForm26("prognosis", e.target.value as WsibForm26["prognosis"])}
            >
              <option value="">—</option>
              <option value="partially recovered & improving">Partially recovered & improving</option>
              <option value="full recovery not yet known">Full recovery not yet known</option>
              <option value="fully recovered">Fully recovered</option>
              <option value="partial recovery expected">Partial recovery expected</option>
              <option value="full recovery not expected">Full recovery not expected</option>
            </select>
          </div>
          <Field label="Current treatment plan" value={form26.current_treatment_plan} onChange={(v) => updateForm26("current_treatment_plan", v)} />
          {/* Preprinted note from real Form 26 — CLINICAL_DOMAIN.md */}
          <p className="text-xs text-gray-400 italic border-l-2 border-amber-300 pl-2">
            Note: "Pain should not be the only medical restriction" — preprinted on Form 26 (0896A)
          </p>
          {form26.functional_abilities !== null && (
            <FunctionalAbilitiesGrid
              abilities={(form26.functional_abilities ?? {}) as Record<AbilityKey, string | null>}
              options={["full", "some", "not_able"]}
              onChange={updateFaForm26}
            />
          )}
          {/* Service code locked to 26M — RULE 3 */}
          <div className="rounded bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-500">
            Service code: <strong>26M</strong> — preprinted on Form 26 (0896A), cannot be changed
          </div>
        </div>
      )}

      {/* Review & Confirm button — CLAUDE.md requirement */}
      <button
        onClick={() => setStep("review")}
        className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
      >
        Review & Confirm →
      </button>
    </div>
  );
}
