"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { updateSectionContent } from "@/lib/sections/actions";
import { sectionRegistry } from "@/lib/sections/registry";
import type { SectionContent, SectionType } from "@/lib/sections/types";

interface SectionEditSheetProps {
  sectionId: string;
  sectionType: SectionType;
  content: SectionContent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionEditSheet({
  sectionId,
  sectionType,
  content,
  open,
  onOpenChange,
}: SectionEditSheetProps) {
  const [isSaving, startTransition] = useTransition();
  const definition = sectionRegistry[sectionType];

  if (!definition) {
    return null;
  }

  const EditForm = definition.EditForm;

  const handleSave = (values: SectionContent) =>
    new Promise<void>((resolve) => {
      startTransition(async () => {
        const result = await updateSectionContent(sectionId, values);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Section updated.");
          onOpenChange(false);
        }
        resolve();
      });
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit {definition.label}</SheetTitle>
          <SheetDescription>Changes are published immediately after saving.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <EditForm content={content} onSave={handleSave} isSaving={isSaving} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
