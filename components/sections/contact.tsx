import { ContactForm } from "@/components/contact/contact-form";
import type { ContactContent } from "@/lib/sections/schemas/contact";

export function ContactSection({ content }: { content: ContactContent }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h2 className="text-3xl font-bold tracking-tight">{content.heading}</h2>
      {content.body && (
        <p className="mt-4 text-muted-foreground">{content.body}</p>
      )}
      <ContactForm />
    </section>
  );
}
