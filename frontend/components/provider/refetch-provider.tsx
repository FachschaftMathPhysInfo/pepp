"use client";

import {createContext, ReactNode, useContext, useState,} from "react";

type RefetchContextType = {
  refetchKey: number;
  triggerRefetch: () => void;
};

const RefetchContext = createContext<RefetchContextType | undefined>(undefined);

export const RefetchProvider = ({ children }: { children: ReactNode }) => {
  const [refetchKey, setRefetchKey] = useState(0);

  const triggerRefetch = () => {
    setRefetchKey((prev) => prev + 1);
  };

  return (
    <RefetchContext.Provider value={{ refetchKey, triggerRefetch }}>
      {children}
    </RefetchContext.Provider>
  );
};

export const useRefetch = (): RefetchContextType => {
  const context = useContext(RefetchContext);
  if (context === undefined) {
    throw new Error("useRefetch must be used within a RefetchProvider");
  }
  return context;
};
