import {extractId} from "@/lib/utils";
import {ManagementPageHeader} from "@/components/management-page-header";
import {GraduationCap} from "lucide-react";
import React from "react";
import {Metadata} from "next";
import TutorialsNav from "@/app/(planner)/[planner]/tutorials/tutorials-nav";

export const metadata: Metadata = {
  title: "Pepp - Meine Tutorien",
}

export default async function TutorialsPage({params}: { params: Promise<{ planner: string }> }) {
  const {planner} = await params
  const umbrellaId = extractId(planner)

  return (
    <>
      <ManagementPageHeader
        iconNode={<GraduationCap/>}
        title={'Meine Tutorien'}
        description={'Hier findest du die Tutorien des gerade ausgewählten Programms'}
      />

      {umbrellaId ? (
        <TutorialsNav umbrellaId={umbrellaId}/>
      ) : (
        <p>Große Error</p>
      )}
    </>
  )
}
