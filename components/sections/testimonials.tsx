import type { CSSProperties } from "react";

import type { TestimonialsContent } from "@/lib/sections/schemas/testimonials";

export function TestimonialsSection({
  content,
  id,
  sectionPadding,
}: {
  content: TestimonialsContent;
  id?: string;
  sectionPadding?: CSSProperties;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="mx-auto max-w-5xl px-4 py-16"
      style={sectionPadding}
    >
      <h2 id={id ? `${id}-heading` : undefined} className="text-center text-3xl tracking-tight">
        {content.heading}
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {content.items.map((item, index) => (
          <figure key={index} className="rounded-lg border p-6">
            <blockquote className="text-muted-foreground">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm font-medium">
              {item.author}
              {item.role && (
                <span className="text-muted-foreground"> &mdash; {item.role}</span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
