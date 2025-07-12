"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {DeleteEventDocument, Event} from "@/lib/gql/generated/graphql";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Edit2, Trash} from "lucide-react";
import {formatDateToDDMM, formatDateToHHMM} from "@/lib/utils";
import React, {useState} from "react";
import {getClient} from "@/lib/graphql";
import {toast} from "sonner";
import {useUser} from "@/components/providers";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {Dialog} from "@/components/ui/dialog";
import EventDialog from "@/components/dialog/events/event-dialog";

interface EventSectionProps {
  event: Event
  fetchEvents: () => Promise<void>
}

export default function EventSection(props: EventSectionProps) {
  const {sid} = useUser()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  async function handleDelete() {
    const client = getClient(String(sid))

    try {
      await client.request(DeleteEventDocument, {eventIds: [props.event.ID]})
      toast.success("Event gelöscht")
      void props.fetchEvents()
    } catch (error) {
      console.error(error)
      toast.error('Konnte Event nicht löschen')
    }

    setDeleteDialogOpen(false)
  }


  return (
    <>
      <Card>
        <CardContent>
          <CardHeader>
            <CardTitle className={'flex items-center justify-between'}>
              {props.event.title}
              <div className={'flex items-center space-x-2'}>
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    setEditDialogOpen(true);
                  }}
                >
                  <Edit2/>
                </Button>
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash className={'stroke-red-600'}/>
                </Button>
              </div>
            </CardTitle>
            <CardDescription className={'flex flex-col'}>
              {props.event.description}
              <div className={'flex items-center space-x-6'}>
                <div className={'flex items-center'}>
                  <Calendar size={18} className={'inline mr-1'}/>
                  {formatDateToDDMM(new Date(props.event.from))}
                </div>
                <div className={'flex items-center'}>
                  <Clock size={18} className={'inline mr-1'}/>
                  {formatDateToHHMM(new Date(props.event.from))} bis {formatDateToHHMM(new Date(props.event.to))}
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </CardContent>
      </Card>


      <ConfirmationDialog
        description={`Dies wird das Event ${props.event.title} unwiderruflich löschen`}
        isOpen={deleteDialogOpen}
        closeDialog={() => setDeleteDialogOpen(false)}
        mode={"confirmation"}
        onConfirm={handleDelete}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <EventDialog open={editDialogOpen} id={props.event.ID} modify={true}/>
      </Dialog>
    </>
  )
}