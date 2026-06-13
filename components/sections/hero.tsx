import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/lib/sections/schemas/hero";

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section
      className={cn(
        "mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:py-24",
        content.imageUrl && "md:grid-cols-2 md:items-center"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center text-center",
          content.imageUrl && "md:items-start md:text-left"
        )}
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {content.heading}
        </h1>
        {content.subheading && (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {content.subheading}
          </p>
        )}
        {content.ctaLabel && content.ctaHref && (
          <div className="mt-8">
            <Button
              render={<Link href={content.ctaHref}>{content.ctaLabel}</Link>}
              nativeButton={false}
            />
          </div>
        )}
      </div>
      {content.imageUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <Image
            src={content.imageUrl}
            alt={content.heading}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
    </section>
  );
}
