import type { ComponentType, CSSProperties } from "react";
import type { z } from "zod";

import type { sectionTypeEnum } from "@/lib/db/schema";

export type SectionType = (typeof sectionTypeEnum.enumValues)[number];

export type SectionContent = Record<string, unknown>;

export interface SectionEditFormProps<T extends SectionContent> {
  content: T;
  onSave: (content: T) => Promise<void>;
  isSaving: boolean;
}

export interface SectionDefinition<T extends SectionContent = SectionContent> {
  type: SectionType;
  label: string;
  schema: z.ZodType<T>;
  defaultContent: T;
  Component: ComponentType<{ content: T; id?: string; sectionPadding?: CSSProperties }>;
  EditForm: ComponentType<SectionEditFormProps<T>>;
}

export function defineSection<T extends SectionContent>(
  definition: SectionDefinition<T>
): SectionDefinition<SectionContent> {
  return definition as unknown as SectionDefinition<SectionContent>;
}
