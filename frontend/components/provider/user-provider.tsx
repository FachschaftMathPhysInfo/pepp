"use client";

import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {
  LoginUserDocument,
  LoginUserQuery,
  LoginUserQueryVariables,
  LogoutDocument,
  User
} from "@/lib/gql/generated/graphql";
import {useRouter, useSearchParams} from "next/navigation";
import {deleteCookie, getCookie, setCookie} from "@/lib/cookie";
import {getClient} from "@/lib/graphql";
import {
  defaultApplication,
  defaultBuilding,
  defaultEvent,
  defaultRoom,
  defaultTutorial,
  defaultUser
} from "@/types/defaults";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  sid: string | null;
  logout: () => void;
  login: (sid: string) => void;
};
const UserContext = createContext<UserContextType | undefined>(undefined);
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
export const UserProvider = ({children}: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sid, setSid] = useState<string | null>(null);

  const sidFromQuery = useSearchParams().get("sid");

  // load session id initially from search param or cookie
  useEffect(() => {
    if (sidFromQuery) {
      setSid(sidFromQuery);
      router.replace("/");
    } else {
      const cookieSid = getCookie("sid");
      if (cookieSid) setSid(cookieSid);
    }
  }, []);

  // login
  useEffect(() => {
    if (!sid) return;

    const fetchData = async () => {
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
          event: {...defaultEvent, ...r.event},
        })),
        tutorials: user.tutorials?.map((t) => ({
          ...defaultTutorial,
          ...t,
          event: {...defaultEvent, ...t.event},
          room: {
            ...defaultRoom,
            ...t.room,
            building: {...defaultBuilding, ...t.room.building},
          },
        })),
        applications:
          user.applications?.map((a) => ({
            ...defaultApplication,
            ...a,
            event: {...defaultEvent, ...a.event},
          })) || [],
      });
    };

    void fetchData();
    setCookie("sid", sid, 10);
  }, [sid]);

  const logout = async () => {
    const client = getClient()
    try {
      if(sid) await client.request(LogoutDocument, {sid})
    } catch {/* if sid was not present, this will fail but has no consequences */ }

    deleteCookie("sid");
    setSid(null);
    setUser(null);
    router.push("/");
  };

  const login = (sid: string) => {
    setSid(sid);
  };

  return (
    <UserContext.Provider value={{user, setUser, sid, logout, login}}>
      {children}
    </UserContext.Provider>
  );
};