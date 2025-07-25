import {ManagementPageHeader} from "@/components/management-page-header";
import {BookCheck} from "lucide-react";
import {extractId} from "@/lib/utils";
import ApplicationsWrapper from "@/app/(planner)/[planner]/applications/applications-wrapper";

export const metadata = {
  title: "Anmeldungen",
}

interface ApplicationsPageProps {
  params: Promise<{ planner: string }>
}

export default async function ApplicationsPage({params}: ApplicationsPageProps) {
  const {planner} = await params
  const umbrellaID = extractId(planner)

  if (!umbrellaID) {
    return null
  }

  return (
    <div className={'space-y-6'}>
      <ManagementPageHeader
        title={'Bewerbungen'}
        description={'Verwalte hier, wer für dieses Programm zugelassen wird'}
        iconNode={<BookCheck/>}
      />

      <ApplicationsWrapper umbrellaID={umbrellaID}/>
    </div>
  )
}
