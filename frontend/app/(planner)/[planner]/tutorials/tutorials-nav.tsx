"use client"
import React, {useCallback, useEffect} from "react";
import {RefetchProvider, useUser} from "@/components/providers";
import {SidebarNav} from "@/components/sidebar-nav";
import {slugify} from "@/lib/utils";
import {getClient} from "@/lib/graphql";
import {
  UmbrellaEventsTitlesDocument,
  UmbrellaEventsTitlesQuery,
  UmbrellasDocument,
  UmbrellasQuery
} from "@/lib/gql/generated/graphql";
import {Button} from "@/components/ui/button";
import {router} from "next/client";


export default function TutorialsNav({umbrellaId} : {umbrellaId: number}) {
  const { user, sid } = useUser()
  const client = getClient(String(sid))
  const [eventsTitles, setEventsTitles] = React.useState<string[]>([])
  const [umbrellaTitle, setUmbrellaTitle] = React.useState<string>("")

  // This is an ugly workaraound, cuz user.tutorial.events.umbrella is null for some reason
  const getUmbrellaTitle = useCallback(async() => {
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

  const tutorials = user?.tutorials?.filter(
    (tutorial) => eventsTitles.includes(tutorial.event.title)
  ).map(
    (tutorial) => ({
      title: tutorial.event.title,
      description: <>{new Date(tutorial.event.from).toLocaleDateString()}</>,
      href: `/${slugify(umbrellaTitle)}/tutorials/${slugify(tutorial.event.title)}-${tutorial.event.ID}`
    })
  )


  return (
    <>
      {tutorials ? (
        <div className="flex flex-col space-y-5 lg:flex-row lg:space-y-0">
          <aside>
            <SidebarNav items={tutorials ?? []} />
          </aside>
          <RefetchProvider>
            <div className="w-full lg:ml-4"></div>
          </RefetchProvider>
        </div>
      ) : (
        <div className={"flex flex-col gap-y-6 w-full p-10 text-center"}>
          Dir wurden noch in diesem Programm noch keine Tutorien zugewiesen. Möchtest du zur Programm unabhängigen Ansicht?
          <Button onClick={() => router.push('/profile/tutorials')}>
            Ja!
          </Button>
        </div>
      )}
    </>
  )
}
