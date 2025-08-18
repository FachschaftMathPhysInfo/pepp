"use client"

import ApplicationManagementSection from "@/app/(planner)/[planner]/applications/application-management-section";
import {Separator} from "@/components/ui/separator";
import ApplicationInfoSection from "@/app/(planner)/[planner]/applications/application-info-section";
import React from "react";

interface ApplicationsWrapperProps {
  umbrellaID: number
}

export default function ApplicationsWrapper(props: ApplicationsWrapperProps) {
  const [refetchKey, setRefetchKey] = React.useState<number>(0);
  const [maximumNewStudents, setMaximumNewStudents] = React.useState<number>(0);

  return (
    <>
      <ApplicationManagementSection
        umbrellaID={props.umbrellaID}
        triggerRefetch={() => setRefetchKey(refetchKey + 1)}
        maximumNewStudents={maximumNewStudents}
      />

      <Separator/>

      <ApplicationInfoSection
        umbrellaID={props.umbrellaID}
        refetchKey={refetchKey}
        setMaximumNewStudents={setMaximumNewStudents}
      />
    </>
  )
}