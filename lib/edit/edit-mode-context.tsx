"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface EditModeContextValue {
  canEdit: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextValue>({
  canEdit: false,
  isEditMode: false,
  toggleEditMode: () => {},
});

export function EditModeProvider({
  canEdit,
  children,
}: {
  canEdit: boolean;
  children: ReactNode;
}) {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditModeContext.Provider
      value={{
        canEdit,
        isEditMode: canEdit && isEditMode,
        toggleEditMode: () => setIsEditMode((prev) => !prev),
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
