"use client";

import { useState, useRef, useEffect } from "react";
import { syntheticDictations } from "@/data/synthetic-dictations";

interface DictationInputProps {
  onSubmit: (dictation: string) => void;
  isLoading: boolean;
}

export function DictationInput({ onSubmit, isLoading }: DictationInputProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Minimal interface — Web Speech API types vary across browsers/TS versions
  interface SpeechRecognitionLike {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((e: { results: { length: number; [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }
  type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  function loadSample(id: string) {
    const sample = syntheticDictations.find((d) => d.id === id);
    if (sample) setText(sample.dictation);
  }

  function toggleMic() {
    if (!speechSupported) return;
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-CA";
    rec.onresult = (e) => {
      const results = e.results;
      const parts: string[] = [];
      for (let i = 0; i < results.length; i++) parts.push(results[i][0].transcript);
      setText((prev) => (prev ? prev + " " + parts.join(" ") : parts.join(" ")));
    };
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }

  function handleSubmit() {
    if (text.trim().length >= 20) onSubmit(text.trim());
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          Clinical Dictation
        </label>
        <select
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white"
          defaultValue=""
          onChange={(e) => loadSample(e.target.value)}
        >
          <option value="" disabled>Load sample dictation…</option>
          {syntheticDictations.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      <textarea
        className="w-full h-44 rounded-lg border border-gray-200 p-3 text-sm text-gray-800 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Paste or dictate a clinical session note… (min 20 characters)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
      />

      <div className="flex items-center gap-2">
        {speechSupported && (
          <button
            onClick={toggleMic}
            disabled={isLoading}
            title={isListening ? "Stop recording" : "Start voice dictation"}
            className={[
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
              isListening
                ? "bg-red-50 border-red-300 text-red-700 animate-pulse"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
            ].join(" ")}
          >
            <span>{isListening ? "⏹" : "🎙"}</span>
            {isListening ? "Stop" : "Dictate"}
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || text.trim().length < 20}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating SOAP…" : "Generate SOAP Note →"}
        </button>

        {text && (
          <button
            onClick={() => setText("")}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 border border-gray-200"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {text.length} characters
        {text.length > 0 && text.length < 20 && (
          <span className="text-amber-500"> — minimum 20 required</span>
        )}
      </p>
    </div>
  );
}
