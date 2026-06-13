import type { RichTextContent } from "@/lib/sections/schemas/rich-text";

export function RichTextSection({ content }: { content: RichTextContent }) {
  const paragraphs = content.body.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      {content.heading && (
        <h2 className="text-3xl font-bold tracking-tight">{content.heading}</h2>
      )}
      <div className="mt-4 flex flex-col gap-4 text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
