"use client";
 
import { useState, useCallback, useRef } from "react";
import { PricingBanner } from "./PricingBanner";
 
const TONES = ["Natural", "Professional", "Conversational", "Simple", "Creative"];
 
const EXAMPLE_TEXT = `Artificial intelligence has revolutionized the way we interact with technology. Machine learning algorithms can now process vast amounts of data and generate insights that were previously impossible to obtain. Natural language processing enables computers to understand and respond to human language with remarkable accuracy. The potential applications of these technologies span across healthcare, finance, education, and entertainment industries.`;
 
function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
 
function countChars(text: string): number {
  return text.length;
}
 
function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
 
function useDailyLimit(maxPerDay: number) {
  const [count, setCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const key = getTodayKey();
    const stored = localStorage.getItem(`humanize_${key}`);
    return stored ? parseInt(stored, 10) : 0;
  });
 
  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      localStorage.setItem(`humanize_${getTodayKey()}`, String(next));
      return next;
    });
  }, []);
 
  const limitReached = count >= maxPerDay;
  const remaining = Math.max(0, maxPerDay - count);
 
  return { count, remaining, limitReached, increment };
}
 
export function TextHumanizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState("Natural");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const daily = useDailyLimit(5);
 
  const handleHumanize = useCallback(async () => {
    if (!input.trim() || daily.limitReached) return;
    setLoading(true);
    setError(null);
    setOutput("");
 
    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, tone }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        setError(data.error || "Failed to generate. Try again.");
        return;
      }
 
      setOutput(data.humanized);
      daily.increment();
      setShowComparison(true);
 
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [input, tone, daily]);
 
  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);
 
  const handleExample = useCallback(() => {
    setInput(EXAMPLE_TEXT);
    setOutput("");
    setError(null);
  }, []);
 
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="text-center mb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paste AI-generated text below and make it sound human
        </p>
      </div>
 
      {/* Tone Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {TONES.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tone === t
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
 
      {/* Input Area */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Input Text
          </label>
          <button
            onClick={handleExample}
            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
          >
            Try Example
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
            setError(null);
          }}
          placeholder="Paste your AI-generated text here…"
          rows={8}
          className="w-full resize-y rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {countWords(input)} words / {countChars(input)} chars
            {!daily.limitReached && (
              <span className="ml-2 text-indigo-500 dark:text-indigo-400 font-medium">
                ({daily.remaining} free left today)
              </span>
            )}
          </span>
          {daily.limitReached ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Daily limit reached (5/5)
              </span>
              <a
                href="#pricing"
                className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
              >
                Upgrade below for unlimited →
              </a>
            </div>
          ) : (
            <button
              onClick={handleHumanize}
              disabled={loading || !input.trim()}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                loading || !input.trim()
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin-slow w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Humanizing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Humanize
                </>
              )}
            </button>
          )}
        </div>
      </div>
 
      {/* Error */}
      {error && (
        <div className="animate-slide-up rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
 
      {/* Output Area */}
      {output && (
        <div ref={outputRef} className="animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Humanized Text
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  showComparison
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {showComparison ? "Hide Compare" : "Compare"}
              </button>
              <button
                onClick={handleCopy}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  copied
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
 
          {/* Comparison View */}
          {showComparison ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card !p-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">
                  Original
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {input}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {countWords(input)} words / {countChars(input)} chars
                </p>
              </div>
              <div className="glass-card !p-4 ring-2 ring-indigo-500/30">
                <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                  Humanized
                </p>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {output}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {countWords(output)} words / {countChars(output)} chars
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card ring-2 ring-indigo-500/30">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {output}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                {countWords(output)} words / {countChars(output)} chars
              </p>
            </div>
          )}
        </div>
      )}
 
      {/* API note */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        Powered by free AI – no key needed
      </p>
 
      {/* Pricing */}
      <div id="pricing">
        <PricingBanner humanizeCount={daily.remaining} />
      </div>
    </div>
  );
}