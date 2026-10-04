"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, BookOpen, Copy, Download, FileText, Globe, LoaderCircle, MessageSquare, PenLine, Square, Trash2 } from "lucide-react";
import Output from "@/components/Output";
import { apiPath, postJSON, readStream } from "@/lib/api";

type Mode = "brochure" | "summarize" | "ask";
type Draft = { text: string; source: string; status: string };
const MODES = [
  { id: "brochure" as const, label: "Brochure", icon: BookOpen, title: "Company brochure", action: "Create brochure" },
  { id: "summarize" as const, label: "Summary", icon: FileText, title: "Website summary", action: "Create summary" },
  { id: "ask" as const, label: "Ask AI", icon: MessageSquare, title: "Technical answer", action: "Get answer" },
];
const emptyDraft = (): Draft => ({ text: "", source: "", status: "Awaiting source" });

export default function Home() {
  const [mode, setMode] = useState<Mode>("brochure");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [question, setQuestion] = useState("");
  const [maxWords, setMaxWords] = useState(120);
  const [drafts, setDrafts] = useState<Record<Mode, Draft>>({ brochure: emptyDraft(), summarize: emptyDraft(), ask: emptyDraft() });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [health, setHealth] = useState("Connecting");
  const controller = useRef<AbortController | null>(null);
  const selected = MODES.find((item) => item.id === mode)!;
  const draft = drafts[mode];
  const words = draft.text.trim() ? draft.text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const active = new AbortController();
    async function check() {
      try {
        const response = await fetch(apiPath("/api/health"), { signal: AbortSignal.any([active.signal, AbortSignal.timeout(8000)]), cache: "no-store" });
        const data = response.ok ? await response.json() : null;
        if (!active.signal.aborted) setHealth(data?.status === "ok" ? "Service available" : "Service unavailable");
      } catch { if (!active.signal.aborted) setHealth("Service unavailable"); }
    }
    void check(); const timer = setInterval(check, 60000);
    return () => { active.abort(); clearInterval(timer); controller.current?.abort(); };
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(timer); }, [notice]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (controller.current) return;
    if (mode === "ask" ? !question.trim() : !url.trim() || (mode === "brochure" && !company.trim())) { setError("Please complete the required fields."); return; }
    if (mode === "ask" && (question.trim().length < 3 || question.trim().length > 2000)) { setError("Your question must be between 3 and 2,000 characters."); return; }
    if (mode !== "ask") {
      try { if (!["http:", "https:"].includes(new URL(url.trim()).protocol)) throw new Error(); }
      catch { setError("Enter a valid website address starting with https:// or http://."); return; }
    }
    const active = new AbortController(); controller.current = active;
    const timeout = setTimeout(() => active.abort("timeout"), 180000);
    setLoading(true); setError(""); setNotice("");
    setDrafts((prev) => ({ ...prev, [mode]: { text: "", source: mode === "ask" ? question.trim() : url.trim(), status: "Generating draft" } }));
    const update = (text: string) => setDrafts((prev) => ({ ...prev, [mode]: { ...prev[mode], text } }));
    try {
      const body = mode === "brochure" ? { company_name: company.trim(), url: url.trim() } : mode === "summarize" ? { url: url.trim(), max_words: maxWords } : { question: question.trim() };
      const response = await postJSON(`/api/${mode}`, body, active.signal);
      if (mode === "summarize") {
        const data = await response.json();
        if (typeof data.summary !== "string" || !data.summary.trim()) throw new Error("No summary was returned. Please try again.");
        update(data.summary);
      } else {
        let received = false;
        await readStream(response, (text) => { received = Boolean(text.trim()); update(text); });
        if (!received) throw new Error("No content was returned. Please try again.");
      }
      setDrafts((prev) => ({ ...prev, [mode]: { ...prev[mode], status: "Draft ready" } }));
    } catch (cause) {
      const stopped = active.signal.aborted && active.signal.reason !== "timeout";
      setDrafts((prev) => ({ ...prev, [mode]: { ...prev[mode], status: stopped ? "Generation stopped" : "Incomplete draft" } }));
      if (!stopped) setError(active.signal.reason === "timeout" ? "This request took too long. Please try again." : cause instanceof TypeError ? "Unable to reach the service. Check your connection and try again." : cause instanceof Error ? cause.message : "Unable to generate content.");
    } finally { clearTimeout(timeout); controller.current = null; setLoading(false); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(draft.text); setNotice("Copied to clipboard."); }
    catch { setNotice("Copy unavailable. Select the text to copy it."); }
  }
  function download() {
    const objectUrl = URL.createObjectURL(new Blob([draft.text], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = objectUrl; link.download = `${mode}-draft.md`; link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); setNotice("Draft downloaded.");
  }

  return <div className="app">
    <a className="skipLink" href="#workspace">Skip to workspace</a>
    <header className="topbar"><a href="/" className="brand" aria-label="AI Sales Brochure Generator home"><Image src="/logo.svg" width={40} height={40} alt="" priority className="brandLogo" /><span className="brandName">AI Sales<span className="brandSubtitle">Brochure Generator</span></span></a><span className={`serviceStatus ${health === "Service available" ? "online" : ""}`} role="status"><span className="statusDot" />{health}</span></header>
    <main className="shell" id="workspace">
      <div className="pageHeading"><div><p className="eyebrow">WORKSPACE / CREATE</p><h1>AI Sales Brochure Generator</h1><p className="subtitle">Your next sales conversation starts with a great first draft.</p></div><span className="workspaceTag"><PenLine size={15} /> Draft studio</span></div>
      <div className="modeBar" aria-label="Content type">{MODES.map(({ id, label, icon: Icon }) => <button key={id} type="button" disabled={loading} aria-pressed={mode === id} className={`modeButton ${mode === id ? "selected" : ""}`} onClick={() => { setMode(id); setError(""); setNotice(""); }}><Icon size={17} />{label}</button>)}</div>
      <div className="workspace">
        <section className="controls" aria-labelledby="input-heading"><div className="sectionHeading"><span className="step">01</span><h2 id="input-heading">{mode === "ask" ? "Your question" : "Source details"}</h2></div>
          <form onSubmit={onSubmit}><fieldset disabled={loading}>
            {mode === "brochure" && <label htmlFor="company">Company name <span className="required">*</span><input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Technologies" maxLength={120} required autoComplete="organization" /></label>}
            {mode !== "ask" ? <label htmlFor="website">Website URL <span className="required">*</span><div className="inputWithIcon"><Globe size={17} /><input id="website" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://company.com" required autoComplete="url" /></div></label> : <label htmlFor="question">Question <span className="required">*</span><textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What would you like to understand?" required maxLength={10000} rows={7} /></label>}
            {mode === "summarize" && <label htmlFor="length"><span className="labelRow">Maximum length<output htmlFor="length">{maxWords} words</output></span><input id="length" type="range" min={40} max={500} step={20} value={maxWords} onChange={(e) => setMaxWords(Number(e.target.value))} /><span className="rangeLabels"><span>Brief</span><span>Detailed</span></span></label>}
          </fieldset>{error && <div className="error" role="alert"><strong>Unable to complete request</strong><p>{error}</p></div>}
          <button className="primary" disabled={loading} type="submit">{loading ? <LoaderCircle size={17} className="spin" /> : <PenLine size={17} />}{loading ? "Generating..." : error ? "Try again" : selected.action}{!loading && <ArrowRight size={17} className="buttonArrow" />}</button>
          {loading && <button type="button" className="stopButton" onClick={() => controller.current?.abort()}><Square size={13} /> Stop generation</button>}</form>
          <div className="sourceNote"><span className="noteLine" /><span>{mode === "ask" ? "AI-generated answer" : "Public website source"}</span><span className="noteLine" /></div>
        </section>
        <section className="result" aria-labelledby="result-heading" aria-busy={loading}>
          <div className="resultHeader"><div className="sectionHeading"><span className="step">02</span><h2 id="result-heading">{selected.title}</h2></div><div className="outputActions"><button className="iconButton" type="button" title="Copy draft" aria-label="Copy draft" disabled={!draft.text || loading} onClick={copy}><Copy size={17} /></button><button className="iconButton" type="button" title="Download Markdown" aria-label="Download Markdown" disabled={!draft.text || loading} onClick={download}><Download size={17} /></button><button className="iconButton" type="button" title="Clear draft" aria-label="Clear draft" disabled={!draft.text || loading} onClick={() => setDrafts((prev) => ({ ...prev, [mode]: emptyDraft() }))}><Trash2 size={17} /></button></div></div>
          {draft.source && <div className="sourceStrip"><Globe size={14} /><span title={draft.source}>{draft.source}</span></div>}
          <Output loading={loading} text={draft.text} />
          <div className="resultFooter"><span role="status">{loading && <LoaderCircle size={13} className="spin" />}{draft.status}</span><span>{words} words</span></div>
        </section>
      </div><footer className="pageFooter"><span>AI Sales Brochure Generator</span><span>AI-generated content. Review before sharing.</span></footer>
    </main><div className={`toast ${notice ? "visible" : ""}`} role="status">{notice}</div>
  </div>;
}
