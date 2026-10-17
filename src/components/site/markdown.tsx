import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders admin-authored markdown. Raw HTML is ignored, so content can't inject scripts. */
export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div
      className={`prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:text-brand-950 prose-a:text-brand-700 prose-strong:text-brand-950 prose-li:marker:text-brand-500 ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
