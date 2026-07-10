import type { CSSProperties } from "react";

import { Prose } from "@/components/ui/prose";
import { cn } from "@/lib/utils";
import type { TwoColumnContent } from "@/lib/sections/schemas/two-column";

export function TwoColumnSection({
  content,
  id,
  sectionPadding,
}: {
  content: TwoColumnContent;
  id?: string;
  sectionPadding?: CSSProperties;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  const pos = content.sidebarPosition ?? "right";
  const width = content.mainWidth ?? "70";

  return (
    <section
      id={id}
      aria-labelledby={content.heading ? headingId : undefined}
      className="mx-auto max-w-5xl px-4 py-16"
      style={sectionPadding}
    >
      {content.heading && (
        <h2 id={headingId} className="mb-8 text-3xl tracking-tight">
          {content.heading}
        </h2>
      )}
      <div
        className={cn(
          "grid gap-8",
          pos === "right" && width === "60" && "md:grid-cols-[3fr_2fr]",
          pos === "right" && width === "70" && "md:grid-cols-[7fr_3fr]",
          pos === "right" && width === "75" && "md:grid-cols-[3fr_1fr]",
          pos === "left" && width === "60" && "md:grid-cols-[2fr_3fr]",
          pos === "left" && width === "70" && "md:grid-cols-[3fr_7fr]",
          pos === "left" && width === "75" && "md:grid-cols-[1fr_3fr]",
        )}
      >
        <div className={cn(pos === "left" && "md:order-last")}>
          <Prose html={content.mainContent} className="text-muted-foreground" />
        </div>
        <aside
          role="complementary"
          aria-label="Sidebar"
          className={cn(
            "rounded-lg border bg-muted/30 p-4",
            pos === "left" && "md:order-first",
          )}
        >
          <Prose html={content.sidebarContent} className="text-muted-foreground" />
        </aside>
      </div>
    </section>
  );
}
