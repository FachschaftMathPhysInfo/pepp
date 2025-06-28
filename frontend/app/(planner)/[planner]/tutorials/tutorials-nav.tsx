"use client"
import React, {useCallback, useEffect} from "react";
import {useUser} from "@/components/providers";
import {SidebarNav} from "@/components/sidebar-nav";
import {slugify} from "@/lib/utils";
import {getClient} from "@/lib/graphql";
import {
  Tutorial,
  UmbrellaEventsTitlesDocument,
  UmbrellaEventsTitlesQuery,
  UmbrellasDocument,
  UmbrellasQuery
} from "@/lib/gql/generated/graphql";
import {Button} from "@/components/ui/button";
import {router} from "next/client";


interface TutorialsNavProps {
  umbrellaId: number;
}

export default function TutorialsNav({umbrellaId}: TutorialsNavProps) {
  const {user, sid} = useUser()
  const client = getClient(String(sid))
  const [eventsTitles, setEventsTitles] = React.useState<string[]>([])
  const [umbrellaTitle, setUmbrellaTitle] = React.useState<string>("")

  // This is an ugly workaraound, cuz user.tutorial.events.umbrella is null for some reason
  const getUmbrellaTitle = useCallback(async () => {
    const titleData = await client.request<UmbrellasQuery>(
      UmbrellasDocument,
      {id: umbrellaId}
    )
    setUmbrellaTitle(titleData.umbrellas[0].title)
  }, [umbrellaId])

  const getEventTitles = useCallback(async () => {
    const eventData = await client.request<UmbrellaEventsTitlesQuery>(
      UmbrellaEventsTitlesDocument,
      {umbrellaID: umbrellaId}
    )

    const eventTitles: string[] = eventData.events.map((event) => event.title)
    setEventsTitles(eventTitles)
  }, [umbrellaId])

  useEffect(() => {
    void getEventTitles()
    void getUmbrellaTitle()
  }, [umbrellaId])

  const reducedEvents = user?.tutorials?.reduce(
    (accumulator: Tutorial[], current: Tutorial) => {
      if (
        !accumulator.some((tutorial) => tutorial.event.ID === current.event.ID)
        && eventsTitles.includes(current.event.title)
      ) {
        accumulator.push(current);
      }
      return accumulator;
    },
    []
  );

  const tutorials = reducedEvents?.map(
    (tutorial) => ({
      title: tutorial.event.title,
      description: <>{new Date(tutorial.event.from).toLocaleDateString()}</>,
      href: `/${slugify(umbrellaTitle)}-${umbrellaId}/tutorials/${slugify(tutorial.event.title)}-${tutorial.event.ID}`,
    })
  );

  return (
    <>
      {tutorials ? (
        <aside>
          <SidebarNav items={tutorials ?? []}/>
        </aside>
      ) : (
        <div className={"flex flex-col gap-y-6 w-full p-10 text-center"}>
          Dir wurden noch in diesem Programm noch keine Tutorien zugewiesen.
          Möchtest du zur Programm unabhängigen Ansicht?
          <Button onClick={() => router.push('/profile/tutorials')}>
            Ja!
          </Button>
        </div>
      )}
    </>
  )
}
