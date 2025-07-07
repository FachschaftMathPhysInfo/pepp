"use client"

import {ManagementPageHeader} from "@/components/management-page-header";
import {Settings, Shield, Trash, User2} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import AccountForm from "@/app/(settings)/profile/account-form";
import PasswordForm from "@/app/(settings)/profile/password-form";
import ConfirmationDialog from "@/components/confirmation-dialog";
import React, {useState} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {DeleteUserDocument, DeleteUserMutation} from "@/lib/gql/generated/graphql";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";

export default function SettingsProfilePage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {user, sid} = useUser()

  async function deleteAccount() {
    const client = getClient(String(sid));

    try {
      await client.request<DeleteUserMutation>(DeleteUserDocument, {email: user?.mail})
      console.log(`Deleted user: ${user?.mail}`)
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title={'Einstellungen'}
        description={'Verwalte hier deinen Account'}
        iconNode={<Settings/>}
      />


      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center'}>
            <User2 className={'inline mr-2'}/>
            Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (<AccountForm/>) : (
            <div className={'w-full h-full flex flex-col justify-center items-center gap-y-6'}>
              <Skeleton className={'w-full h-6 rounded-lg'}/>
              <Skeleton className={'w-full h-6 rounded-lg'}/>
              <Skeleton className={'w-full h-6 rounded-lg'}/>
              <div className={'w-full flex justify-end'}>
                <Skeleton className={'w-32 h-8 rounded-lg'}/>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center'}>
            <Shield className={'inline mr-2'}/>
            Sicherheit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (<PasswordForm/>) : (
            <div className={'w-full h-full flex flex-col justify-center items-center gap-y-6'}>
              <Skeleton className={'w-full h-6 rounded-lg'}/>
              <Skeleton className={'w-full h-6 rounded-lg'}/>
              <Skeleton className={'w-full h-6 rounded-lg'}/>
              <div className={'w-full flex justify-end'}>
                <Skeleton className={'w-32 h-8 rounded-lg'}/>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {user ? (
        <Button
          className={'w-full text-center items-center bg-red-600 text-primary hover:bg-red-700'}
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash className={'inline mr-2'}/>
          Account löschen
        </Button>
      ) : (
        <Skeleton className={'w-full h-12 rounded-lg'} />
      )}



      <ConfirmationDialog
        description={"Dies wird deinen Account und alle dazu gehörigen Infos unwiederruflich löschen!"}
        isOpen={deleteDialogOpen}
        closeDialog={() => setDeleteDialogOpen(false)}
        onConfirm={deleteAccount}
        mode={"confirmation"}
      />
    </div>
  )
    ;
}
