"use client"

import {ReactNode, createContext, useContext, useState} from "react";
import { User } from "@/lib/gql/generated/graphql"

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context
}

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <UserProvider>{children}</UserProvider>
  )
}
