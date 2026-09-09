import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({ content, className, small }: { content: string; className?: string; small?: boolean }) {
  return (
    <div className={cn("prose-ma", small && "prose-ma-sm", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
