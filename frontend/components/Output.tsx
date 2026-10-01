import ReactMarkdown from "react-markdown";

export default function Output({ text }: { text: string }) {
  if (!text) return null;
  return (
    <section className="output" aria-live="polite">
      <ReactMarkdown>{text}</ReactMarkdown>
    </section>
  );
}