import Image from "next/image";
import type { CSSProperties } from "react";

import { Prose } from "@/components/ui/prose";
import { cn } from "@/lib/utils";
import type { AboutContent } from "@/lib/sections/schemas/about";

export function AboutSection({
  content,
  id,
  sectionPadding,
}: {
  content: AboutContent;
  id?: string;
  sectionPadding?: CSSProperties;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        "mx-auto grid gap-8 px-4 py-16",
        content.imageUrl ? "max-w-5xl md:grid-cols-2 md:items-center" : "max-w-3xl"
      )}
      style={sectionPadding}
    >
      {content.imageUrl && (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg md:order-last">
          <Image
            src={content.imageUrl}
            alt={content.heading}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
      <div>
        <h2 id={id ? `${id}-heading` : undefined} className="text-3xl tracking-tight">{content.heading}</h2>
        <Prose html={content.body} className="mt-4 text-muted-foreground" />
      </div>
    </section>
  );
}
