"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { SectionType } from "@/lib/sections/types";
import type { StyleSettingsValues, TypographyRole } from "@/lib/theme/typography-schema";

export interface SectionStyleTarget {
  id: string;
  type: SectionType;
  backgroundColor: string;
}

interface EditModeContextValue {
  canEdit: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  styleSettings: StyleSettingsValues;
  setStyleSettings: (settings: StyleSettingsValues) => void;
  isStyleSidebarOpen: boolean;
  setStyleSidebarOpen: (open: boolean) => void;
  scrollToStyleRole: TypographyRole | null;
  requestStyleScroll: (role: TypographyRole) => void;
  clearStyleScrollRequest: () => void;
  sectionStyleTarget: SectionStyleTarget | null;
  requestSectionStyleScroll: (target: SectionStyleTarget) => void;
  setSectionStyleColor: (backgroundColor: string) => void;
  clearSectionStyleTarget: () => void;
}

const defaultStyleSettings: StyleSettingsValues = {
  fontHeading: "Inter",
  fontBody: "Inter",
  baseFontSize: "medium",
  typography: {},
};

const EditModeContext = createContext<EditModeContextValue>({
  canEdit: false,
  isEditMode: false,
  toggleEditMode: () => {},
  styleSettings: defaultStyleSettings,
  setStyleSettings: () => {},
  isStyleSidebarOpen: false,
  setStyleSidebarOpen: () => {},
  scrollToStyleRole: null,
  requestStyleScroll: () => {},
  clearStyleScrollRequest: () => {},
  sectionStyleTarget: null,
  requestSectionStyleScroll: () => {},
  setSectionStyleColor: () => {},
  clearSectionStyleTarget: () => {},
});

export function EditModeProvider({
  canEdit,
  initialStyleSettings,
  children,
}: {
  canEdit: boolean;
  initialStyleSettings?: StyleSettingsValues;
  children: ReactNode;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [styleSettings, setStyleSettings] = useState<StyleSettingsValues>(
    initialStyleSettings ?? defaultStyleSettings
  );
  const [isStyleSidebarOpen, setStyleSidebarOpen] = useState(false);
  const [scrollToStyleRole, setScrollToStyleRole] = useState<TypographyRole | null>(null);
  const [sectionStyleTarget, setSectionStyleTarget] = useState<SectionStyleTarget | null>(null);

  return (
    <EditModeContext.Provider
      value={{
        canEdit,
        isEditMode: canEdit && isEditMode,
        toggleEditMode: () => setIsEditMode((prev) => !prev),
        styleSettings,
        setStyleSettings,
        isStyleSidebarOpen,
        setStyleSidebarOpen,
        scrollToStyleRole,
        requestStyleScroll: (role) => {
          setStyleSidebarOpen(true);
          setSectionStyleTarget(null);
          setScrollToStyleRole(role);
        },
        clearStyleScrollRequest: () => setScrollToStyleRole(null),
        sectionStyleTarget,
        requestSectionStyleScroll: (target) => {
          setStyleSidebarOpen(true);
          setScrollToStyleRole(null);
          setSectionStyleTarget(target);
        },
        setSectionStyleColor: (backgroundColor) =>
          setSectionStyleTarget((prev) => (prev ? { ...prev, backgroundColor } : prev)),
        clearSectionStyleTarget: () => setSectionStyleTarget(null),
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
