"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  LoginDocument,
  LoginQuery,
  LoginQueryVariables,
  Role,
  Tutorial,
  UmbrellaOfEventDocument,
  UmbrellaOfEventQuery,
  UmbrellaOfEventQueryVariables,
  UmbrellasDocument,
  UmbrellasQuery,
  UmbrellasQueryVariables,
  User,
} from "@/lib/gql/generated/graphql";
import {
  defaultApplication,
  defaultEvent,
  defaultTutorial,
  defaultUser,
} from "@/types/defaults";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { client } from "@/lib/graphql";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const login = async (sid: string) => {
      const vars: LoginQueryVariables = {
        sessionID: sid,
      };
      const userData = await client.request<LoginQuery>(LoginDocument, vars);
      const user = userData.login.user;
      setUser({
        ...defaultUser,
        ...user,
        registrations: user.registrations?.map((r) => ({
          ...defaultTutorial,
          ...r,
          event: { ...defaultEvent, ...r.event },
        })),
        applications:
          user.applications?.map((a) => ({
            ...defaultApplication,
            ...a,
            event: { ...defaultEvent, ...a.event },
          })) || [],
      });
    };
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

type UmbrellaContextType = {
  umbrellaID: number | null;
  setUmbrellaID: (id: number | null) => void;
  closeupID: number | null;
  setCloseupID: (id: number | null) => void;
};

const UmbrellaContext = createContext<UmbrellaContextType | undefined>(
  undefined
);

export const useUmbrella = () => {
  const context = useContext(UmbrellaContext);
  if (!context) {
    throw new Error("useUmbrella must be used within a UmbrellaProvider");
  }
  return context;
};

export const UmbrellaProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [umbrellaID, setUmbrellaID] = useState<number | null>(null);
  const [closeupID, setCloseupID] = useState<number | null>(null);

  useEffect(() => {
    const isUmbrella = async (id: number): Promise<Boolean> => {
      const vars: UmbrellasQueryVariables = {
        id: id,
      };
      const umbrellaData = await client.request<UmbrellasQuery>(
        UmbrellasDocument,
        vars
      );
      return umbrellaData.umbrellas.length ? true : false;
    };

    const getEventsUmbrellaID = async (id: number): Promise<number | null> => {
      const vars: UmbrellaOfEventQueryVariables = {
        id: id,
      };
      const eventData = await client.request<UmbrellaOfEventQuery>(
        UmbrellaOfEventDocument,
        vars
      );
      return eventData.events.length && eventData.events[0].umbrella
        ? eventData.events[0].umbrella?.ID
        : null;
    };

    const id = parseInt(searchParams.get("e") ?? "");
    if (id) {
      isUmbrella(id).then((yes) => {
        if (!yes) {
          getEventsUmbrellaID(id).then((umbrellaID) => {
            setUmbrellaID(umbrellaID);
            setCloseupID(id);
          });
        }
      });
    }
  }, [searchParams.get("e")]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    router.push(
      pathname +
        "?" +
        createQueryString(
          "e",
          closeupID ? closeupID.toString() : umbrellaID?.toString() ?? "0"
        )
    );
  }, [umbrellaID, closeupID]);

  return (
    <UmbrellaContext.Provider
      value={{ umbrellaID, setUmbrellaID, closeupID, setCloseupID }}
    >
      {children}
    </UmbrellaContext.Provider>
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
