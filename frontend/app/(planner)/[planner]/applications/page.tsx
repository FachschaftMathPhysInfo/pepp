import {ManagementPageHeader} from "@/components/management-page-header";
import {BookCheck} from "lucide-react";
import ApplicationInfoSection from "@/app/(planner)/[planner]/applications/application-info-section";
import {extractId} from "@/lib/utils";
import ApplicationManagementSection from "@/app/(planner)/[planner]/applications/application-management-section";
import {Separator} from "@/components/ui/separator";

export const metadata = {
  title: "Anmeldungen",
}

interface ApplicationsPageProps {
  params: Promise<{planner: string}>
}

export default async function ApplicationsPage({params}: ApplicationsPageProps) {
  const { planner } = await params
  const umbrellaID = extractId(planner)

  if (!umbrellaID) {
    return null
  }

  return (
    <div className={'space-y-6'}>
      <ManagementPageHeader
      title={'Anmeldungen'}
      description={'Verwalte hier, wer für dieses Programm zugelassen wird'}
      iconNode={<BookCheck/>}
      />

      <ApplicationInfoSection umbrellaID={umbrellaID}/>

      <Separator />

      <ApplicationManagementSection umbrellaID={umbrellaID} />
    </div>
  )
}
