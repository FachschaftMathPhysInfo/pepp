"use client"

import {CalendarOff, Loader2} from "lucide-react";
import {useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {FutureEventsDocument, FutureEventsQuery} from "@/lib/gql/generated/graphql";

export default function IndexPage() {
  const [umbrellasInFutureExist, setUmbrellasInFutureExist] = useState(true);

  useEffect(() => {
    const fetchUmbrellasInFuture = async () => {
      const client = getClient();
      const response = await client.request<FutureEventsQuery>(FutureEventsDocument)
      setUmbrellasInFutureExist(!!response.events);
    }

    void fetchUmbrellasInFuture();
  }, [])

  return (
    <div className={'w-fill h-[60vh] flex flex-col gap-y-8 justify-center items-center text-center'}>
      {umbrellasInFutureExist ? (
        <>
          <Loader2 size={100} className={'animate-spin'} />
          Lade Event
        </>
      ) : (
        <>
          <CalendarOff size={100} className={'flex-shrink-0'}/>
          Aktuell sind noch keine Veranstaltungen geplant.
        </>
      )}


    </div>
  )
}
