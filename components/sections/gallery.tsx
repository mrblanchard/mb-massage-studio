import Image from "next/image";

import { cn } from "@/lib/utils";
import type { GalleryContent } from "@/lib/sections/schemas/gallery";

export function GallerySection({ content, id }: { content: GalleryContent; id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={id && content.heading ? `${id}-heading` : undefined}
      className="mx-auto max-w-5xl px-4 py-16"
    >
      {content.heading && (
        <h2 id={id ? `${id}-heading` : undefined} className="text-center text-3xl tracking-tight">
          {content.heading}
        </h2>
      )}
      {content.images.length > 0 ? (
        <div role="list" className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", content.heading && "mt-10")}>
          {content.images.map((image, index) => (
            <figure role="listitem" key={index} className="overflow-hidden rounded-lg">
              <div className="relative aspect-square w-full">
                <Image
                  src={image.url}
                  alt={image.caption || "Gallery image"}
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
