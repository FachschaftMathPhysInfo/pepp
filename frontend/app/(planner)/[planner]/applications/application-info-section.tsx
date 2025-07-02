"use client"
import {useUser} from "@/components/providers";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {AllApplicantsDocument, AllApplicantsQuery} from "@/lib/gql/generated/graphql";
import ApplicationScoreChart from "@/app/(planner)/[planner]/applications/application-score-chart";

interface ApplicationInfoSectionProps {
  umbrellaID: number
}

export type Applicant = {
  mail: string;
  applications?: {
    score: number;
    accepted?: boolean | null | undefined;
    event: {
      ID: number;
    };
  }[] | null | undefined;
}

export default function ApplicationInfoSection({umbrellaID}: ApplicationInfoSectionProps) {
  const {sid} = useUser()
  const [peopleApplied, setPeopleApplied] = useState<Applicant[]>([])
  const [peopleAccepted, setPeopleAccepted] = useState<Applicant[]>([])

  useEffect(() => {
    const fetchApplications = async () => {
      const client = getClient(String(sid))
      const applicantsData = await client.request<AllApplicantsQuery>(AllApplicantsDocument, {})
      setPeopleApplied(applicantsData.users)
      const acceptedPeople = applicantsData.users.filter(
        user => user.applications?.filter(
          application => application.event.ID === umbrellaID
        )[0].accepted === true
      )
      setPeopleAccepted(acceptedPeople)
    }

    void fetchApplications()
  }, [umbrellaID, sid])


  return (
    <div className={'w-full flex flex-col items-center flex-wrap space-y-6'}>
      <div className={'flex items-center space-x-6 w-full'}>
        <Card className={'flex-grow'}>
          <CardHeader>
            <CardTitle>
              Anmeldungen
            </CardTitle>
            <CardDescription>
              So viele haben sich schon angemeldet
            </CardDescription>
          </CardHeader>
          <CardContent className={'text-center text-3xl'}>
            {peopleApplied.length}
          </CardContent>
        </Card>

        <Card className={'flex-grow'}>
          <CardHeader>
            <CardTitle>
              Angenommen
            </CardTitle>
            <CardDescription>
              So viele haben wir angenommen
            </CardDescription>
          </CardHeader>
          <CardContent className={'text-center text-3xl'}>
            {peopleAccepted.length}
          </CardContent>
        </Card>
      </div>

      <Card className={'flex-grow w-full'}>
        <CardHeader>
          <CardTitle>
            Score
          </CardTitle>
          <CardDescription>
            So ist der Score unter allen Anmeldungen aufgeteilt
          </CardDescription>
        </CardHeader>
        <CardContent className={'h-full'}>
          <ApplicationScoreChart applicants={peopleApplied} umbrellaID={umbrellaID}/>
        </CardContent>
      </Card>
    </div>
  )
}