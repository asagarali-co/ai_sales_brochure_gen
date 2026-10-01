"use client";

import { useState } from "react";
import Output from "@/components/Output";
import { postJSON, readStream } from "@/lib/api";

type Mode = "summarize" | "brochure" | "ask";

const TABS: { id: Mode; label: string }[] = [
  { id: "summarize", label: "Summarize a page" },
  { id: "brochure", label: "Company brochure" },
  { id: "ask", label: "Ask a technical question" },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("summarize");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setOutput("");
    setError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOutput("");
    try {
      if (mode === "summarize") {
        const res = await postJSON("/api/summarize", { url });
        setOutput((await res.json()).summary);
      } else if (mode === "brochure") {
        const res = await postJSON("/api/brochure", { company_name: company, url });
        await readStream(res, setOutput);
      } else {
        const res = await postJSON("/api/ask", { question });
        await readStream(res, setOutput);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Page Reader</h1>
      <p className="lede">Read a site, draft a brochure for a company, or get a technical question explained.</p>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" className="tab" aria-selected={mode === t.id} onClick={() => switchMode(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit}>
        {mode === "brochure" && (
          <label>
            Company name
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Hugging Face" required />
          </label>
        )}
        {mode !== "ask" ? (
          <label>
            Website URL
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://huggingface.co" required />
          </label>
        ) : (
          <label>
            Question
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Explain what yield from does" required />
          </label>
        )}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Working…" : mode === "summarize" ? "Summarize" : mode === "brochure" ? "Create brochure" : "Explain"}
        </button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      <Output text={output} />
    </main>
  );
}