"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  LoginUserDocument,
  LoginUserQuery,
  LoginUserQueryVariables,
  User,
} from "@/lib/gql/generated/graphql";
import {
  defaultApplication,
  defaultBuilding,
  defaultEvent,
  defaultRoom,
  defaultTutorial,
  defaultUser,
} from "@/types/defaults";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { getClient } from "@/lib/graphql";
import { setCookie, deleteCookie, getCookie } from "@/lib/cookie";
import { useRouter, useSearchParams } from "next/navigation";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  sid: string | null;
  setSid: (sid: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sid, setSid] = useState<string | null>(getCookie("sid"));

  useEffect(() => {
    const sid = searchParams.get("sid");
    if (sid) {
      setSid(sid);
      router.push("/");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) deleteCookie("sid");
  }, [user]);

  useEffect(() => {
    if (!sid) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      const client = getClient(sid);

      const vars: LoginUserQueryVariables = {
        sid: sid,
      };

      const userData = await client.request<LoginUserQuery>(
        LoginUserDocument,
        vars
      );

      const user = userData.users[0];
      setUser({
        ...defaultUser,
        ...user,
        registrations: user.registrations?.map((r) => ({
          ...defaultTutorial,
          ...r,
          event: { ...defaultEvent, ...r.event },
        })),
        tutorials: user.tutorials?.map((t) => ({
          ...defaultTutorial,
          ...t,
          event: { ...defaultEvent, ...t.event },
          room: {
            ...defaultRoom,
            ...t.room,
            building: { ...defaultBuilding, ...t.room.building },
          },
        })),
        applications:
          user.applications?.map((a) => ({
            ...defaultApplication,
            ...a,
            event: { ...defaultEvent, ...a.event },
          })) || [],
      });
    };

    setCookie("sid", sid, 10);
    fetchUser();
  }, [sid]);

  return (
    <UserContext.Provider value={{ user, setUser, sid, setSid }}>
      {children}
    </UserContext.Provider>
  );
};

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

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
