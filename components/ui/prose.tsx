import DOMPurify from "isomorphic-dompurify";

import { cn } from "@/lib/utils";

export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
