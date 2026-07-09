import { Prose } from "@/components/ui/prose";
import { cn } from "@/lib/utils";
import type { RichTextContent } from "@/lib/sections/schemas/rich-text";

export function RichTextSection({ content, id }: { content: RichTextContent; id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={id && content.heading ? `${id}-heading` : undefined}
      className="mx-auto max-w-3xl px-4 py-16"
    >
      {content.heading && (
        <h2 id={id ? `${id}-heading` : undefined} className="text-3xl tracking-tight">{content.heading}</h2>
      )}
      <Prose html={content.body} className={cn("text-muted-foreground", content.heading && "mt-4")} />
    </section>
  );
}
