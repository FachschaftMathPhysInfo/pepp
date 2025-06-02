import {Event} from "@/lib/gql/generated/graphql";
import {Calendar, Pencil, Trash} from "lucide-react";
import React from "react";
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
    <div className={'flex justify-between items-start sm:items-center w-full max-w-full'}>
      <span className={'flex max-sm:items-start justify-between items-center flex-grow max-sm:flex-col'}>
          {/*FIXME: should wrap*/}
          <h2 className={'text-2xl font-bold mr-5'}>{umbrella.title}</h2>
          <span className={'text-muted-foreground flex items-center mr-5'}>
            <Calendar className={'inline mr-1 w-4'}/>
            {readableFrom} bis {readableTo}
          </span>
      </span>

      <span className={'mx-5 flex items-center'}>
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