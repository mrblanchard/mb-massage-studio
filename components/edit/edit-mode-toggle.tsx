"use client";

import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEditMode } from "@/lib/edit/edit-mode-context";

export function EditModeToggle() {
  const { canEdit, isEditMode, toggleEditMode } = useEditMode();

  if (!canEdit) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-40">
      <Button size="lg" className="shadow-lg" onClick={toggleEditMode}>
        {isEditMode ? (
          <>
            <X /> Exit edit mode
          </>
        ) : (
          <>
            <Pencil /> Edit mode
          </>
        )}
      </Button>
    </div>
  );
}
