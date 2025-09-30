"use client";

import { getClient } from "@/lib/graphql";
import { useEffect, useState } from "react";
import {
  AllUsersDocument,
  AllUsersQuery,
  User,
} from "@/lib/gql/generated/graphql";
import { UserTable } from "@/components/tables/user-table/user-table";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import { ManagementPageHeader } from "@/components/management-page-header";
import { Users } from "lucide-react";
import {useUser} from "@/components/provider/user-provider";

export default function UserSettingsPage() {
  const { sid } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    setLoading(true);
    const client = getClient(String(sid));
    const userData = await client.request<AllUsersQuery>(AllUsersDocument);

    if (userData.users) {
      setUsers(
        userData.users.map((user) => ({
          ...defaultUser,
          ...user,
          tutorials: user.tutorials?.map((t) => ({
            ...defaultTutorial,
            ...t,
            event: { ...defaultEvent, ...t.event },
          })),
        }))
      );
    }

    setLoading(false);
  };

  // FIXME: this needs to refetch after updating users
  useEffect(() => {
    void fetchData();
  }, [sid]);

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        iconNode={<Users />}
        title={"User Verwaltung"}
        description={
          "Hier kannst Du User:innen löschen und ihre Rollen bearbeiten."
        }
      />
      {loading ? (
        <div>Lade User Tabelle</div>
      ) : (
        <div>
          <UserTable data={users} refreshData={fetchData} />
        </div>
      )}
    </div>
  );
}
