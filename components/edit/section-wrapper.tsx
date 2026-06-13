"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { SectionEditSheet } from "@/components/edit/section-edit-sheet";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { deleteSection } from "@/lib/sections/actions";
import type { SectionContent, SectionType } from "@/lib/sections/types";

interface SectionWrapperProps {
  sectionId: string;
  sectionType: SectionType;
  content: SectionContent;
  children: ReactNode;
}

export function SectionWrapper({ sectionId, sectionType, content, children }: SectionWrapperProps) {
  const { isEditMode } = useEditMode();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionId,
  });

  if (!isEditMode) {
    return <>{children}</>;
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      className={`group relative outline-1 outline-dashed outline-transparent transition-opacity hover:outline-primary/40 ${
        isDragging ? "z-10 opacity-50" : ""
      }`}
    >
      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label="Edit section"
          onClick={() => setIsEditOpen(true)}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
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
