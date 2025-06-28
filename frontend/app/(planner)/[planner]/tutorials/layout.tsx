import {extractId} from "@/lib/utils";
import {ManagementPageHeader} from "@/components/management-page-header";
import {GraduationCap} from "lucide-react";
import React from "react";
import {Metadata} from "next";
import TutorialsNav from "@/app/(planner)/[planner]/tutorials/tutorials-nav";

export const metadata: Metadata = {
  title: "Pepp - Meine Tutorien",
}

interface TutorialsLayoutProps {
  params: Promise<{ planner: string }>;
  children: React.ReactNode;
}

export default async function TutorialsLayout({params, children}: TutorialsLayoutProps) {
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
        <div className="flex flex-col space-y-5 lg:flex-row lg:space-y-0 mt-6">
          <aside className="w-64">
            <TutorialsNav umbrellaId={umbrellaId}/>
          </aside>

          <div className="flex-1 lg:ml-4">
            {children}
          </div>
        </div>
      ) : (
        <p>Große Error</p>
      )}
    </>
  )
}
