import type { CSSProperties } from "react";

import { ContactForm } from "@/components/contact/contact-form";
import type { ContactContent } from "@/lib/sections/schemas/contact";

export function ContactSection({
  content,
  id,
  sectionPadding,
}: {
  content: ContactContent;
  id?: string;
  sectionPadding?: CSSProperties;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="mx-auto max-w-3xl px-4 py-16 text-center"
      style={sectionPadding}
    >
      <h2 id={id ? `${id}-heading` : undefined} className="text-3xl tracking-tight">{content.heading}</h2>
      {content.body && (
        <p className="mt-4 text-muted-foreground">{content.body}</p>
      )}
      {id && <ContactForm sectionId={id} fields={content.fields} />}
    </section>
  );
}
