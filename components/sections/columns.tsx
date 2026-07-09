import Image from "next/image";

import { PayPalButtonForm } from "@/components/paypal-button-form";
import { Prose } from "@/components/ui/prose";
import { cn } from "@/lib/utils";
import type { ColumnsContent } from "@/lib/sections/schemas/columns";

export function ColumnsSection({ content, id }: { content: ColumnsContent; id?: string }) {
  const headingId = id ? `${id}-heading` : undefined;
  const count = content.columns.length;

  return (
    <section
      id={id}
      aria-labelledby={content.heading ? headingId : undefined}
      className="mx-auto max-w-6xl px-4 py-16"
    >
      {content.heading && (
        <h2 id={headingId} className="mb-10 text-center text-3xl tracking-tight">
          {content.heading}
        </h2>
      )}
      <div
        className={cn(
          "grid gap-8",
          count === 2 && "sm:grid-cols-2",
          count === 3 && "sm:grid-cols-3",
          count === 4 && "sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {content.columns.map((column, index) => (
          <div key={index} className="flex flex-col gap-4">
            {column.imageUrl && (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
                <Image
                  src={column.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={`(min-width: 1024px) ${Math.round(100 / count)}vw, (min-width: 640px) 50vw, 100vw`}
                />
              </div>
            )}
            {column.content && (
              <Prose html={column.content} className="text-muted-foreground" />
            )}
            {column.payPalButton && <PayPalButtonForm {...column.payPalButton} />}
          </div>
        ))}
      </div>
    </section>
  );
}
