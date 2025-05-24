import {Event, UmbrellaEventsTitlesDocument, UmbrellaEventsTitlesQuery} from "@/lib/gql/generated/graphql";
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
  const { sid } = useUser()
  const readableFrom = formatDateToDDMM(new Date(umbrella.from))
  const readableTo = formatDateToDDMM(new Date(umbrella.to))
  const [tutorialNames, setTutorialNames] = React.useState<string[]>([])

  useEffect(() => {
    const fetchEventNames = async () => {
      const client = getClient(String(sid))
      const tutorialNameData = await client.request(
        UmbrellaEventsTitlesDocument,
        {umbrellaID: umbrella.ID}
      )
      setTutorialNames(tutorialNameData.events.map(event => event.title))
    }

    void fetchEventNames()
  }, [sid]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className={'flex justify-between items-center'}>
            {umbrella.title}
            <div>
              <button
                className={'mr-4'}
                onClick={() => setDialogState({mode: "editUmbrella", umbrella: umbrella})}
              >
                <Pencil className={'w-5'}/>
              </button>
              <button
                className={'mr-4'}
                onClick={() => setDialogState({mode: "deleteUmbrella", umbrella: umbrella})}
              >
                <Trash className={'w-5 stroke-red-500'}/>
              </button>
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          <span className={"flex items-center"}>
            <Calendar className={'inline w-4 mr-2'}/>
            {readableFrom} bis {readableTo}
          </span>
          <span className={"block"}>{umbrella.description}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type={"single"} collapsible>
          <AccordionItem value={'item-1'}>
            <AccordionTrigger className={'hover:no-underline'}>
              Veranstaltungen in diesem Programm
            </AccordionTrigger>
            <AccordionContent className={'pl-5'}>
              <ul className={'list-disc decoration-1'}>
                {tutorialNames.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}