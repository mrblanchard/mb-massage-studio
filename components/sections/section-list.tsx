"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { InsertSectionPicker } from "@/components/edit/insert-section-picker";
import { SectionWrapper } from "@/components/edit/section-wrapper";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { addSection, reorderSections } from "@/lib/sections/actions";
import { sectionRegistry } from "@/lib/sections/registry";
import type { SectionStyleOverrides } from "@/lib/sections/section-style";
import { uploadImage } from "@/lib/uploads/upload-image";
import type { SectionContent, SectionType } from "@/lib/sections/types";

export interface SectionListItem {
  id: string;
  type: SectionType;
  content: SectionContent;
  backgroundColor: string | null;
  styleOverrides: SectionStyleOverrides;
}

export function SectionList({ pageId, sections }: { pageId: string; sections: SectionListItem[] }) {
  const { isEditMode } = useEditMode();
  const [order, setOrder] = useState(() => sections.map((section) => section.id));
  const [, startTransition] = useTransition();
  const [, startUpload] = useTransition();

  // File drag-over detection
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sectionsById = new Map(sections.map((section) => [section.id, section]));
  const orderedSections = order
    .map((id) => sectionsById.get(id))
    .filter((section): section is SectionListItem => Boolean(section));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    const next = arrayMove(order, oldIndex, newIndex);

    setOrder(next);

    startTransition(async () => {
      await reorderSections(pageId, next);
    });
  }

  function makeFileDrop(afterSectionId: string | null) {
    return (file: File) => {
      startUpload(async () => {
        try {
          const url = await uploadImage(file);
          await addSection(pageId, "gallery", afterSectionId, {
            heading: "",
            images: [{ url, caption: "" }],
          });
          toast.success("Image added as gallery section.");
        } catch {
          toast.error("Failed to upload image.");
        }
      });
    };
  }

  function handleContainerDragEnter(e: React.DragEvent<HTMLDivElement>) {
    if (!isEditMode || !e.dataTransfer.types.includes("Files")) return;
    dragCounter.current++;
    setIsDraggingFile(true);
  }

  function handleContainerDragLeave() {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingFile(false);
    }
  }

  function handleContainerDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
    }
  }

  function handleContainerDrop(e: React.DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes("Files")) {
      // Individual zone drop handlers will fire first; this resets state
      dragCounter.current = 0;
      setIsDraggingFile(false);
    }
  }

  return (
    <div
      onDragEnter={handleContainerDragEnter}
      onDragLeave={handleContainerDragLeave}
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {isEditMode && (
            <InsertSectionPicker
              pageId={pageId}
              afterSectionId={null}
              isFileDropTarget={isDraggingFile}
              onFileDrop={makeFileDrop(null)}
            />
          )}
          {orderedSections.map((section) => {
            const definition = sectionRegistry[section.type];
            if (!definition) {
              return null;
            }

            const parsed = definition.schema.safeParse(section.content);
            const content: SectionContent = parsed.success ? parsed.data : definition.defaultContent;

            const Component = definition.Component;

            return (
              <div key={section.id}>
                <SectionWrapper
                  sectionId={section.id}
                  sectionType={section.type}
                  content={content}
                  backgroundColor={section.backgroundColor}
                  styleOverrides={section.styleOverrides}
                >
                  <Component content={content} id={section.id} />
                </SectionWrapper>
                {isEditMode && (
                  <InsertSectionPicker
                    pageId={pageId}
                    afterSectionId={section.id}
                    isFileDropTarget={isDraggingFile}
                    onFileDrop={makeFileDrop(section.id)}
                  />
                )}
              </div>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}
