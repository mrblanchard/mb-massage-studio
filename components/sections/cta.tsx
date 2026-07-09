import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CtaContent } from "@/lib/sections/schemas/cta";

export function CtaSection({ content, id }: { content: CtaContent; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-heading` : undefined} className="border-y bg-muted/40">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 id={id ? `${id}-heading` : undefined} className="text-3xl tracking-tight">{content.heading}</h2>
        {content.body && (
          <p className="mt-4 text-muted-foreground">{content.body}</p>
        )}
        <div className="mt-8">
          <Button
            render={<Link href={content.ctaHref}>{content.ctaLabel}</Link>}
            nativeButton={false}
          />
        </div>
      </div>
    </section>
  );
}
