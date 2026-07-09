"use client";

import { Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";

import { HeaderEditSheet } from "@/components/edit/header-edit-sheet";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { EDIT_HOVER_OUTLINE } from "@/lib/edit/hover-outline";
import { cn } from "@/lib/utils";

interface HeaderEditWrapperProps {
  children: ReactNode;
  siteName: string;
  logoUrl?: string | null;
  navLinks: { label: string; href: string }[];
  headerCtaLabel?: string | null;
  headerCtaHref?: string | null;
  homeSections: { id: string; label: string }[];
}

export function HeaderEditWrapper({ children, ...props }: HeaderEditWrapperProps) {
  const { isEditMode } = useEditMode();
  const [open, setOpen] = useState(false);

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div className={cn("group relative", EDIT_HOVER_OUTLINE)}>
      <div
        data-edit-toolbar
        className="absolute top-3 right-3 z-50 flex items-center gap-0.5 rounded-full border bg-background/95 p-1 opacity-0 shadow-md backdrop-blur transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          aria-label="Edit header"
          onClick={() => setOpen(true)}
        >
          <Pencil />
        </Button>
      </div>
      {children}
      <HeaderEditSheet open={open} onOpenChange={setOpen} {...props} />
    </div>
  );
}
