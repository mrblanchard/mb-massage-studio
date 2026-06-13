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
import { useState, useTransition } from "react";

import { AddSectionPicker } from "@/components/edit/add-section-picker";
import { SectionWrapper } from "@/components/edit/section-wrapper";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { reorderSections } from "@/lib/sections/actions";
import { sectionRegistry } from "@/lib/sections/registry";
import type { SectionContent, SectionType } from "@/lib/sections/types";

export interface SectionListItem {
  id: string;
  type: SectionType;
  content: SectionContent;
}

export function SectionList({ pageId, sections }: { pageId: string; sections: SectionListItem[] }) {
  const { isEditMode } = useEditMode();
  const [order, setOrder] = useState(() => sections.map((section) => section.id));
  const [, startTransition] = useTransition();

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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        {orderedSections.map((section) => {
          const definition = sectionRegistry[section.type];
          if (!definition) {
            return null;
          }

          const parsed = definition.schema.safeParse(section.content);
          const content: SectionContent = parsed.success ? parsed.data : definition.defaultContent;

          const Component = definition.Component;

          return (
            <SectionWrapper key={section.id} sectionId={section.id} sectionType={section.type} content={content}>
              <Component content={content} />
            </SectionWrapper>
          );
        })}
      </SortableContext>
      {isEditMode && <AddSectionPicker pageId={pageId} />}
    </DndContext>
  );
}
