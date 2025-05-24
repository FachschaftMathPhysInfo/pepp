import {Event} from "@/lib/gql/generated/graphql";
import {Calendar, Pencil, Trash} from "lucide-react";
import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {UmbrellaDialogState} from "@/app/(settings)/admin/umbrellas/page";
import {formatDateToDDMM} from "@/lib/utils";

interface BuildingSectionProps {
  umbrella: Event;
  setDialogState: React.Dispatch<React.SetStateAction<UmbrellaDialogState>>;
}

export default function UmbrellaSection({umbrella, setDialogState}: BuildingSectionProps) {
  const readableFrom = formatDateToDDMM(new Date(umbrella.from))
  const readableTo = formatDateToDDMM(new Date(umbrella.to))

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
      </CardContent>
    </Card>
  )
}