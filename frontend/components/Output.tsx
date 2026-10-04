import { FileText, LoaderCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Output({ loading, text }: { loading: boolean; text: string }) {
  if (!text) return <div className="emptyOutput">{loading ? <LoaderCircle size={32} className="spin" /> : <div className="documentArt" aria-hidden="true"><FileText size={44} strokeWidth={1} /><span /><span /><span /></div>}<h3>{loading ? "Putting your draft together" : "A fresh page. A new possibility."}</h3><p>{loading ? "Preparing your content..." : "No draft yet"}</p></div>;
  return <article className="output"><ReactMarkdown components={{ a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a> }}>{text}</ReactMarkdown></article>;
}
