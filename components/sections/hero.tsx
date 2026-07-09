import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/lib/sections/schemas/hero";

export function HeroSection({ content, id }: { content: HeroContent; id?: string }) {
  const headingId = id ? `${id}-heading` : undefined;

  if (content.layout === "overlay" && content.imageUrl) {
    const overlayClass = {
      light: "bg-black/30",
      medium: "bg-black/50",
      dark: "bg-black/70",
    }[content.overlayDarkness ?? "medium"];

    const logoSizeClass = {
      small: "w-[10rem]",
      medium: "w-[20rem]",
      large: "w-[30rem]",
      xlarge: "w-[40rem]",
    }[content.logoSize ?? "large"];

    return (
      <section
        id={id}
        aria-labelledby={content.heading ? headingId : undefined}
        className="relative flex min-h-[520px] items-center justify-center overflow-hidden"
      >
        <Image
          src={content.imageUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className={`absolute inset-0 ${overlayClass}`} />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4 py-24 text-center text-white">
          {content.logoUrl && (
            <div className={`relative aspect-square max-w-full ${logoSizeClass}`}>
              <Image src={content.logoUrl} alt="" fill className="object-contain" />
            </div>
          )}
          {content.heading && (
            <h1
              id={headingId}
              className={cn(
                "text-4xl tracking-tight text-white sm:text-5xl",
                content.hideTextVisually && "sr-only"
              )}
            >
              {content.heading}
            </h1>
          )}
          {content.subheading && (
            <p
              className={cn(
                "max-w-2xl text-lg text-white/90",
                content.hideTextVisually && "sr-only"
              )}
            >
              {content.subheading}
            </p>
          )}
          {content.ctaLabel && content.ctaHref && (
            <div className="mt-4">
              <Button
                render={<Link href={content.ctaHref}>{content.ctaLabel}</Link>}
                nativeButton={false}
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      aria-labelledby={content.heading ? headingId : undefined}
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
        {content.heading && (
          <h1
            id={headingId}
            className={cn(
              "text-4xl tracking-tight sm:text-5xl",
              content.hideTextVisually && "sr-only"
            )}
          >
            {content.heading}
          </h1>
        )}
        {content.subheading && (
          <p
            className={cn(
              "mt-4 max-w-2xl text-lg text-muted-foreground",
              content.hideTextVisually && "sr-only"
            )}
          >
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
            alt={content.heading ?? ""}
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
