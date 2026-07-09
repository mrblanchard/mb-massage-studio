"use client";

import { Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";

import { FooterEditSheet } from "@/components/edit/footer-edit-sheet";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { EDIT_HOVER_OUTLINE } from "@/lib/edit/hover-outline";
import { cn } from "@/lib/utils";

interface FooterEditWrapperProps {
  children: ReactNode;
  tagline?: string | null;
  businessInfo?: { address?: string; phone?: string; email?: string; hours?: string };
  footerColumns: { heading?: string; body?: string; links: { label: string; href: string }[] }[];
  socialLinks?: Record<string, string>;
}

export function FooterEditWrapper({ children, ...props }: FooterEditWrapperProps) {
  const { isEditMode } = useEditMode();
  const [open, setOpen] = useState(false);

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div className={cn("group relative", EDIT_HOVER_OUTLINE)}>
      <div
        data-edit-toolbar
        className="absolute top-3 right-3 z-30 flex items-center gap-0.5 rounded-full border bg-background/95 p-1 opacity-0 shadow-md backdrop-blur transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          aria-label="Edit footer"
          onClick={() => setOpen(true)}
        >
          <Pencil />
        </Button>
      </div>
      {children}
      <FooterEditSheet open={open} onOpenChange={setOpen} {...props} />
    </div>
  );
}
