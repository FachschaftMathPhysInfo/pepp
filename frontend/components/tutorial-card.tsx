import {Card, CardContent} from "@/components/ui/card";
import TutorialElement from "@/components/tutorial-element";
import {Button} from "@/components/ui/button";
import {CirclePlus} from "lucide-react";
import {toast} from "sonner";
import {Tutorial} from "@/lib/gql/generated/graphql";

interface TutorialCardProps {
  tutorials: Tutorial[];
}

export default function TutorialCard({tutorials}: TutorialCardProps) {
  return (
    <Card>
      <CardContent>
        {tutorials.length >= 1 ? tutorials.map((tutorial) => (
          <TutorialElement key={tutorial.ID} tutorial={tutorial} />
        )) : (
          <div className={'w-full py-10 text-center'}>
            Für dieses Event gibt es noch keine Tutorien
          </div>
        )}
        <Button
          onClick={() => toast.info("Not Implemented Yet")}
          variant={"secondary"}
          type={"button"}
          className={'w-full'}
        >
          <CirclePlus/>
          Tutorium hinzufügen
        </Button>
      </CardContent>
    </Card>
  )
}