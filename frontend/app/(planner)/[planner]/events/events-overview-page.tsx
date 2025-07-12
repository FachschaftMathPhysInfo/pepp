"use client"

import {DeleteEventDocument, Event, PlannerEventsDocument, PlannerEventsQuery} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";
import {useCallback, useEffect, useState} from "react";
import {defaultEvent} from "@/types/defaults";
import SearchInput from "@/components/search-input";
import EventSection from "@/app/(planner)/[planner]/events/event-section";
import {Skeleton} from "@/components/ui/skeleton";
import {FerrisWheel, PlusCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {ManagementPageHeader} from "@/components/management-page-header";
import EventDialog from "@/components/dialog/events/event-dialog";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {useUser} from "@/components/providers";
import {Dialog} from "@/components/ui/dialog";

export type EventOverviewDialogState = {
  mode: "modify" | "view" | "delete" | null
  eventID: number | undefined
}

interface EventsOverviewPageProps {
  umbrellaID: number
}

export default function EventsOverviewPage(props: EventsOverviewPageProps) {
  const {sid} = useUser()
  const [loading, setLoading] = useState<boolean>(false)
  const [events, setEvents] = useState<Event[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [dialogState, setDialogState] = useState<EventOverviewDialogState>({mode: null, eventID: undefined})

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const client = getClient()

    try {
      const data = await client.request<PlannerEventsQuery>(
        PlannerEventsDocument,
        {umbrellaID: props.umbrellaID}
      )

      setEvents(data.events.map(e => ({
        ...defaultEvent,
        ...e,
        tutorials: [],
        umbrella: defaultEvent
      })))
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }, [props.umbrellaID])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents, props.umbrellaID])

  async function handleDelete() {
    const client = getClient(String(sid))

    if (!dialogState.eventID) {
      console.log('Tried deleting event without ID')
      return
    }

    try {
      await client.request(DeleteEventDocument, {eventIds: [dialogState.eventID]})
    } catch (error) {
      console.error(error)
      toast.error('Konnte Event nicht löschen')
    }

    setDialogState({mode: null, eventID: undefined})
  }

  if (loading) {
    return (
      <div className={'w-full mt-6'}>
        <Skeleton className={'w-full h-[80px]'}/>

        <div className={'flex flex-col mt-5 space-y-6'}>
          <Skeleton className={'w-full h-[200px]'}/>
          <Skeleton className={'w-full h-[200px]'}/>
          <Skeleton className={'w-full h-[200px]'}/>
        </div>
      </div>
    )
  }

  return (
    <div className={'space-y-6'}>
      <ManagementPageHeader
        title={'Events'}
        description={'Hier kannst du die Events des ausgewählten Programms verwalten'}
        iconNode={<FerrisWheel/>}
        actionButton={
          <Button
            onClick={() => setDialogState({mode: "modify", eventID: undefined})}
          >
            <PlusCircle className={'inline mr-2'}/>
            Event hinzufügen
          </Button>
        }
      />

      <SearchInput searchValue={searchValue} setSearchValueAction={setSearchValue}/>

      <div className={'space-y-4'}>
        {events.filter(event => event.title.includes(searchValue)).map(event => (
          <EventSection key={event.ID} event={event} setDialogState={setDialogState}/>
        ))}
      </div>

      <Dialog
        open={dialogState.mode === "modify"}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({mode: null, eventID: undefined})
          }
        }}
      >
        <EventDialog
          open={dialogState.mode === "modify"}
          id={dialogState.eventID}
          modify={dialogState.mode === "modify"}
        />
      </Dialog>


      <ConfirmationDialog
        description={'Dies wird das Event unwiderruflich löschen'}
        isOpen={dialogState.mode === "delete"}
        closeDialog={() => setDialogState({mode: null, eventID: 0})}
        onConfirm={handleDelete}
        mode={"confirmation"}
      />

    </div>


  )
}