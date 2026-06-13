import Image from "next/image";

import { cn } from "@/lib/utils";
import type { GalleryContent } from "@/lib/sections/schemas/gallery";

export function GallerySection({ content }: { content: GalleryContent }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      {content.heading && (
        <h2 className="text-center text-3xl font-bold tracking-tight">
          {content.heading}
        </h2>
      )}
      {content.images.length > 0 ? (
        <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", content.heading && "mt-10")}>
          {content.images.map((image, index) => (
            <figure key={index} className="overflow-hidden rounded-lg">
              <div className="relative aspect-square w-full">
                <Image
                  src={image.url}
                  alt={image.caption ?? ""}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              {image.caption && (
                <figcaption className="mt-2 text-sm text-muted-foreground">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      ) : (
        <p className={cn("text-center text-sm text-muted-foreground", content.heading && "mt-10")}>
          No images yet.
        </p>
      )}
    </section>
  );
}
