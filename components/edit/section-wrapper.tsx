"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { SectionEditSheet } from "@/components/edit/section-edit-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { EDIT_HOVER_OUTLINE } from "@/lib/edit/hover-outline";
import { deleteSection } from "@/lib/sections/actions";
import type { SectionContent, SectionType } from "@/lib/sections/types";

interface SectionWrapperProps {
  sectionId: string;
  sectionType: SectionType;
  content: SectionContent;
  backgroundColor: string | null;
  children: ReactNode;
}

export function SectionWrapper({
  sectionId,
  sectionType,
  content,
  backgroundColor,
  children,
}: SectionWrapperProps) {
  const { isEditMode } = useEditMode();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionId,
  });

  if (!isEditMode) {
    return backgroundColor ? <div style={{ backgroundColor }}>{children}</div> : <>{children}</>;
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: backgroundColor ?? undefined,
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this section? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteSection(sectionId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Section deleted.");
      }
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-section-id={sectionId}
      data-section-type={sectionType}
      data-section-bg={backgroundColor ?? ""}
      className={cn(
        "group relative rounded-md",
        EDIT_HOVER_OUTLINE,
        isDragging && "z-10 opacity-50",
      )}
    >
      <div
        data-edit-toolbar
        className="absolute top-3 right-3 z-20 flex items-center gap-0.5 rounded-full border bg-background/95 p-1 opacity-0 shadow-md backdrop-blur transition-all duration-200 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          aria-label="Edit section"
          onClick={() => setIsEditOpen(true)}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete section"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          <Trash2 />
        </Button>
      </div>
      {children}
      <SectionEditSheet
        sectionId={sectionId}
        sectionType={sectionType}
        content={content}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
