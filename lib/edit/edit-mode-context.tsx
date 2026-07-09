"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { StyleSettingsValues, TypographyRole } from "@/lib/theme/typography-schema";

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
          setScrollToStyleRole(role);
        },
        clearStyleScrollRequest: () => setScrollToStyleRole(null),
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
