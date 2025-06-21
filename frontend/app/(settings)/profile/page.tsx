import { ManagementPageHeader } from "@/components/management-page-header";
import { Settings2 } from "lucide-react";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <ManagementPageHeader
        iconNode={<Settings2 />}
        title={"Einstellungen"}
        description={"Passe deine persönlichen Informationen an."}
      />
    </div>
  );
}
