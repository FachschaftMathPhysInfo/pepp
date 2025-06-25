import { ManagementPageHeader } from "@/components/management-page-header";
import { BookCheck } from "lucide-react";

export default function RegistrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <ManagementPageHeader
          iconNode={<BookCheck />}
          title={"Meine Anmeldungen"}
          description={"Du bist zu folgenden Veranstaltungen angemeldet."}
        />
      </div>
      {children}
    </div>
  );
}
