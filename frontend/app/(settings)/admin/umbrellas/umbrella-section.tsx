import {
  Event,
  TutorsOfEventDocument, TutorsOfEventOfUmbrellaDocument,
  UmbrellaEventsTitlesDocument,
  UmbrellaEventsTitlesQuery
} from "@/lib/gql/generated/graphql";
import {Calendar, Pencil, Trash} from "lucide-react";
import React, {useEffect} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {UmbrellaDialogState} from "@/app/(settings)/admin/umbrellas/page";
import {formatDateToDDMM} from "@/lib/utils";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";

interface BuildingSectionProps {
  umbrella: Event;
  setDialogState: React.Dispatch<React.SetStateAction<UmbrellaDialogState>>;
}

export default function UmbrellaSection({umbrella, setDialogState}: BuildingSectionProps) {
  const {sid} = useUser()
  const readableFrom = formatDateToDDMM(new Date(umbrella.from))
  const readableTo = formatDateToDDMM(new Date(umbrella.to))
  const [numberOfEvents, setNumberOfEvents] = React.useState<number>(0)
  const [numberOfTutors, setNumberOfTutors] = React.useState<number>(0)

  useEffect(() => {
    const fetchEventNames = async () => {
      const client = getClient(String(sid))
      const tutorialData = await client.request(
        TutorsOfEventOfUmbrellaDocument,
        {umbrellaID: umbrella.ID}
      )

      const namesOfTutors = tutorialData.events.map(
        event => event.tutorials?.map(
          tutorial => tutorial.tutors?.map(
            tutor => tutor.mail
          )
        )
      )

      const amountUniqueTutors = [... new Set(namesOfTutors)].length

      setNumberOfEvents(tutorialData.events.length)
      setNumberOfTutors(amountUniqueTutors)
    }

    void fetchEventNames()
  }, [sid]);

  return (

    <div className={'flex justify-between items-center w-full'}>
      <span className={'flex items-center'}>
        <span className={'flex items-center'}>


      </span>
        <span className={'flex items-center'}>
        <p className={'text-2xl font-bold mr-5'}>{umbrella.title}</p>
        <span className={'text-muted-foreground flex items-center'}>
          <Calendar className={'inline mr-1 w-4'}/>
          {readableFrom} bis {readableTo}
        </span>
        <span className={'text-muted-foreground mx-4'}>|</span>
        <span className={'text-muted-foreground mr-3'}>Tutor:innen: {numberOfTutors}</span>
        <span className={'text-muted-foreground mr-5'}>Events: {numberOfEvents}</span>
      </span>
      </span>
      <span className={'mr-5 flex items-center'}>
        <button
          className={'mr-4'}
          onClick={() => setDialogState({mode: "editUmbrella", umbrella: umbrella})}
        >
          <Pencil className={'w-5'}/>
        </button>
        <button
          onClick={() => setDialogState({mode: "deleteUmbrella", umbrella: umbrella})}
        >
          <Trash className={'w-5 stroke-red-500'}/>
        </button>
      </span>
    </div>
  )
}