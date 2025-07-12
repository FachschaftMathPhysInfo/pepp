import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Event} from "@/lib/gql/generated/graphql";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Edit2, Trash} from "lucide-react";
import {formatDateToDDMM, formatDateToHHMM} from "@/lib/utils";
import React from "react";

interface EventSectionProps {
  event: Event
  setEditDialogState: React.Dispatch<React.SetStateAction<{ open: boolean, id: number }>>;
  setDeleteDialogState: React.Dispatch<React.SetStateAction<{ open: boolean, id: number }>>;
}

export default function EventSection(props: EventSectionProps) {
  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle className={'flex items-center justify-between'}>
            {props.event.title}
            <div className={'flex items-center space-x-2'}>
              <Button
                variant={"ghost"}
                onClick={() => {
                  props.setEditDialogState({open: true, id: props.event.ID})
                }}
              >
                <Edit2/>
              </Button>
              <Button
                variant={"ghost"}
                onClick={() => props.setDeleteDialogState({open: true, id: props.event.ID})}
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
  )
}