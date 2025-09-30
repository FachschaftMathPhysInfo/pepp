"use client";

import {
  Setting,
  SettingsDocument,
  SettingsQuery,
} from "@/lib/gql/generated/graphql";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCallback, useEffect, useState } from "react";
import { getClient } from "@/lib/graphql";
import MailForm from "@/app/(settings)/admin/mails/mail-form";
import { ManagementPageHeader } from "@/components/management-page-header";
import { Mail } from "lucide-react";
import {useUser} from "@/components/provider/user-provider";

export default function Settings() {
  const { sid } = useUser();
  const [settings, setMailSettings] = useState<Setting[]>([]);
  const [generalSettings, setGeneralMailSettings] = useState<Setting[]>([]);
  const [confirmSettings, setConfirmMailSettings] = useState<Setting[]>([]);
  const [availablitySettings, setAvailabilityMailSettings] = useState<
    Setting[]
  >([]);
  const [assignSettings, setAssignMailSettings] = useState<Setting[]>([]);

  const fetchMails = useCallback(async () => {
    const client = getClient(String(sid));
    const mailData = await client.request<SettingsQuery>(SettingsDocument);

    if (mailData.settings) {
      const filterSettingsToMailSettings = mailData.settings.filter((setting) =>
        setting.key.startsWith("email")
      );
      const filterMailSettingsGeneral = mailData.settings.filter((setting) =>
        ["email-greeting", "email-name", "email-signature"].includes(
          setting.key
        )
      );
      const filterMailSettingsConfirm = mailData.settings.filter((setting) =>
        setting.key.startsWith("email-confirm")
      );
      const filterMailSettingsAvailability = mailData.settings.filter(
        (setting) => setting.key.startsWith("email-availability")
      );
      const filterMailSettingsAssign = mailData.settings.filter((setting) =>
        setting.key.startsWith("email-assignment")
      );
      setMailSettings(filterSettingsToMailSettings);
      setGeneralMailSettings(filterMailSettingsGeneral);
      setConfirmMailSettings(filterMailSettingsConfirm);
      setAvailabilityMailSettings(filterMailSettingsAvailability);
      setAssignMailSettings(filterMailSettingsAssign);
    }
  }, [sid]);

  useEffect(() => {
    void fetchMails();
  }, [fetchMails]);

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        iconNode={<Mail />}
        title={"Mailverwaltung"}
        description={
          "Bearbeite die Templates der automatisiert verschickten Mails."
        }
      />
      {settings.length === 0 ? (
        <div
          className={"w-full p-10 border rounded-lg justify-center text-center"}
        >
          Es sind keine Einstellung zu E-Mails verfügbar.
        </div>
      ) : (
        <>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Allgemein
              </AccordionTrigger>
              <AccordionContent>
                <MailForm settings={generalSettings} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Bestätigung
              </AccordionTrigger>
              <AccordionContent>
                <MailForm settings={confirmSettings} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Verfügbarkeiten
              </AccordionTrigger>
              <AccordionContent>
                <MailForm settings={availablitySettings} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Zuweisungen
              </AccordionTrigger>
              <AccordionContent>
                <MailForm settings={assignSettings} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
}
