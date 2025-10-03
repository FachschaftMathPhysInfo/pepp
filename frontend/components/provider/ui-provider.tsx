"use client";

import { createContext, ReactNode, useContext } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type UIContextType = {
  isMobile: boolean | undefined;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <UIContext.Provider value={{ isMobile }}>{children}</UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
