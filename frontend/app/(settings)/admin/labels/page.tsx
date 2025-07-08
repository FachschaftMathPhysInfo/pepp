"use client";

import { Tags } from "lucide-react";
import { ManagementPageHeader } from "@/components/management-page-header";

export default function IndexPage() {
  return (
    <section className="space-y-6">
      <ManagementPageHeader
        iconNode={<Tags />}
        title={"Labels"}
        description={
          "Hier kannst du die Label anpassen, welche deine Veranstaltungen bekommen. Beachte hierbei, dass diese entweder Veranstaltungstyp oder -thema beschreiben."
        }
      />
    </section>
  );
}
