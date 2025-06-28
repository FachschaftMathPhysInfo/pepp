import {ManagementPageHeader} from "@/components/management-page-header";
import {BookCheck} from "lucide-react";
import {RegistrationsView} from "@/components/registrations-view";
import {extractId} from "@/lib/utils";

export default async function RegistrationsLayout({params}: { params: Promise<{ planner: string }> }) {
    const {planner} = await params;
    const umbrellaId = extractId(planner);
    return (
        <div className="space-y-6">

            <ManagementPageHeader
                iconNode={<BookCheck/>}
                title={"Meine Anmeldungen"}
                description={"Du bist zu folgenden Veranstaltungen angemeldet."}
            />
            <RegistrationsView
                umbrellaID={umbrellaId}
            />
        </div>
    );
}
