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
  UmbrellaOfEventDocument,
  UmbrellaOfEventQuery,
  UmbrellaOfEventQueryVariables,
  UmbrellasDocument,
  UmbrellasQuery,
  UmbrellasQueryVariables,
  User,
} from "@/lib/gql/generated/graphql";
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
      console.log("checking for: ", id);
      const vars: UmbrellasQueryVariables = {
        id: id,
      };
      const umbrellaData = await client.request<UmbrellasQuery>(
        UmbrellasDocument,
        vars
      );
      console.log(umbrellaData.umbrellas.length);
      return umbrellaData.umbrellas.length ? true : false;
    };

    const getEventsUmbrellaID = async (id: number): Promise<number | null> => {
      console.log("getting u for: ", id);
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
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
