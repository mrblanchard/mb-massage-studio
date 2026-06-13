import { cn } from "@/lib/utils";
import type { ServicesContent } from "@/lib/sections/schemas/services";

const justifyClasses: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  full: "justify-start",
};

export function ServicesSection({ content }: { content: ServicesContent }) {
  const alignment = content.alignment ?? "center";

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-center text-3xl font-bold tracking-tight">
        {content.heading}
      </h2>
      <div className={cn("mt-10 flex flex-wrap gap-6", justifyClasses[alignment])}>
        {content.items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border p-6",
              alignment === "full"
                ? "flex-1 basis-60"
                : "w-full sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333%_-_1rem)]"
            )}
          >
            <h3 className="font-semibold">{item.title}</h3>
            {item.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
