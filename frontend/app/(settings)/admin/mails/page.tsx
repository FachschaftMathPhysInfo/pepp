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
  const [generalMailSettings, setGeneralMailSettings] = useState<Setting[]>([]);
  const [confirmMailSettings, setConfirmMailSettings] = useState<Setting[]>([]);
  const [availabilityMailSettings, setAvailabilityMailSettings] = useState<Setting[]>([]);
  const [assignMailSettings, setAssignMailSettings] = useState<Setting[]>([]);
  const [acceptedMailSettings, setAcceptedMailSettings] = useState<Setting[]>([]);
  const [deniedMailSettings, setDeniedMailSettings] = useState<Setting[]>([]);

  const fetchMailSettings = useCallback(async () => {
    const client = getClient(String(sid));
    const mailData = await client.request<SettingsQuery>(SettingsDocument);

    if (mailData.settings) {
      const allMailSettings = mailData.settings.filter((setting) =>
        setting.key.startsWith("email")
      );
      const newGeneralMailSettings = mailData.settings.filter((setting) =>
        ["email-greeting", "email-name", "email-signature"].includes(
          setting.key
        )
      );
      const newConfirmationMailSettings = mailData.settings.filter((setting) =>
        setting.key.startsWith("email-confirm")
      );
      const newAvailabilityMailSettings = mailData.settings.filter(
        (setting) => setting.key.startsWith("email-availability")
      );
      const newAssignMailSettings = mailData.settings.filter((setting) =>
        setting.key.startsWith("email-assignment")
      );
      const newAcceptedMailSettings = mailData.settings.filter((setting) =>
        setting.key.startsWith("email-application-accepted")
      );
      const newDeniedMailSettings = mailData.settings.filter((setting) =>
        setting.key.startsWith("email-application-denied")
      );

      setMailSettings(allMailSettings);
      console.log(allMailSettings);
      console.log(newAcceptedMailSettings)
      setGeneralMailSettings(newGeneralMailSettings);
      setConfirmMailSettings(newConfirmationMailSettings);
      setAvailabilityMailSettings(newAvailabilityMailSettings);
      setAssignMailSettings(newAssignMailSettings);
      setAcceptedMailSettings(newAcceptedMailSettings);
      setDeniedMailSettings(newDeniedMailSettings);
    }
  }, [sid]);

  useEffect(() => {
    void fetchMailSettings();
  }, [fetchMailSettings]);

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
        <div className={"w-full p-10 border rounded-lg justify-center text-center"}>
          Es sind keine Mail Einstellungen verfügbar.
        </div>
      ) : (
        <>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Allgemein
              </AccordionTrigger>
              <AccordionContent>
                <MailForm
                  description={'Textblöcke die in jeder Mail verwendet werden'}
                  settings={generalMailSettings}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Account Bestätigung
              </AccordionTrigger>
              <AccordionContent>
                <MailForm
                  description={'Textblöcke die in Mails zur Account Bestätigung genutzt werden'}
                  settings={confirmMailSettings}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Verfügbarkeiten
              </AccordionTrigger>
              <AccordionContent>
                <MailForm
                  description={'Textblöcke die in Mails zur Bestätigung von Verfügbarkeiten genutzt werden'}
                  settings={availabilityMailSettings}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Zuweisungen
              </AccordionTrigger>
              <AccordionContent>
                <MailForm
                  description={'Textblöcke die in Mails zu Tutorien Zuweisungen genutzt werden'}
                  settings={assignMailSettings}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Registrierung Akzeptiert
              </AccordionTrigger>
              <AccordionContent>
                <MailForm
                  description={'Textblöcke die verwendet werden, wenn ein Studi zum Programm zugelassen wird'}
                  settings={acceptedMailSettings}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Registrierung Abgelehnt
              </AccordionTrigger>
              <AccordionContent>
                <MailForm
                  description={'Textblöcke die verwendet werden, wenn ein Studi vom Programm abgelehnt wurde'}
                  settings={deniedMailSettings}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
}
