"use client"

import {Event, PlannerEventsDocument, PlannerEventsQuery} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";
import React, {useCallback, useEffect, useState} from "react";
import {defaultEvent} from "@/types/defaults";
import {Skeleton} from "@/components/ui/skeleton";
import {FerrisWheel, PlusCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ManagementPageHeader} from "@/components/management-page-header";
import {EventDialog} from "@/components/dialog/events/event-dialog";
import {Dialog} from "@/components/ui/dialog";
import {columns} from "@/app/(planner)/[planner]/columns";
import {DataTable} from "@/app/(planner)/[planner]/data-table";
import {useRefetch} from "@/components/providers";

interface EventsOverviewPageProps {
  umbrellaID: number
}

export default function EventsOverviewPage(props: EventsOverviewPageProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [events, setEvents] = useState<Event[]>([])
  const {refetchKey} = useRefetch()
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const client = getClient()

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
  }, [props.umbrellaID])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents, props.umbrellaID, refetchKey])

  if (loading) {
    return (
      <div className={'w-full mt-6'}>
        <Skeleton className={'w-full h-[80px]'}/>

        <div className={'flex flex-col mt-5 space-y-6'}>
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
            onClick={() => setCreateDialogOpen(true)}
          >
            <PlusCircle className={'inline mr-2'}/>
            Event hinzufügen
          </Button>
        }
      />

      <DataTable columns={columns} data={events}/>

      <EventDialog
        event={null}
        isOpen={createDialogOpen}
        onCloseAction={() => setCreateDialogOpen(false)}
      />
    </div>


  )
}