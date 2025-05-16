"use client";

import {getClient} from "@/lib/graphql";
import {useEffect, useState} from "react";
import {
  AllUsersDocument,
  AllUsersQuery,
  User
} from "@/lib/gql/generated/graphql";
import {useUser} from "@/components/providers";
import {Separator} from "@/components/ui/separator";
import {UserTable} from "@/components/tables/user-table/user-table";
import {defaultEvent, defaultTutorial, defaultUser} from "@/types/defaults";


export default function UserSettingsPage() {
  const { sid } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {

    setLoading(true);
    const client = getClient(String(sid));
    const userData = await client.request<AllUsersQuery>(AllUsersDocument)

    if (userData.users){
      setUsers(userData.users.map((user) => ({
        ...defaultUser,
        ...user,
        tutorials: user.tutorials?.map((t) => ({
          ...defaultTutorial,
          ...t,
          event: {...defaultEvent, ...t.event}
        }))
      })))
    }

    setLoading(false);
  }

  // FIXME: this needs to refetch after updating users
  useEffect(() => {
    void fetchData()
  }, [sid])


  return (
    <>
      <h1 className={'text-2xl font-bold'}>User Verwaltung</h1>
      <p>Hier kannst Du User:innen löschen und ihre Rollen bearbeiten</p>
      <Separator className={'my-12'}/>
      {loading ?
        (<div>Lade User Tabelle</div>) :
        (<UserTable data={users} refreshData={fetchData}/>)
      }
    </>
  )
}