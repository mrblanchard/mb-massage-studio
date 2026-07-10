import sanitizeHtml from "sanitize-html";

import { cn } from "@/lib/utils";

export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt", "width", "height"],
          },
        }),
      }}
    />
  );
}
