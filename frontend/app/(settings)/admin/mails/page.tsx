"use client";

import { Separator } from "@/components/ui/separator";
import {
  AllSettingsDocument,
  AllSettingsQuery,
  AllSettingsQueryVariables,
  Setting,
} from "@/lib/gql/generated/graphql";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState, useCallback } from "react";
import { getClient } from "@/lib/graphql";
import MailSection from "@/app/(settings)/admin/mails/mail-section";
import { useUser } from "@/components/providers";
import MailForm from "@/components/mail-form";

export default function Settings() {
  const { sid } = useUser();
  const [settings, setMailSettings] = useState<Setting[]>([]);
  const [generalSettings, setGeneralMailSettings] = useState<Setting[]>([]);
  const [confirmSettings, setConfirmMailSettings] = useState<Setting[]>([]);
  const [availablitySettings, setAvailabilityMailSettings] = useState<Setting[]>([]);
  const [assignSettings, setAssignMailSettings] = useState<Setting[]>([]);

  const fetchMails = useCallback(async () => {
    const client = getClient(String(sid));
    const mailData = await client.request<AllSettingsQuery>(AllSettingsDocument);

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
      <div>
        <h3 className="text-3xl font-bold">Mailverwaltung</h3>
        <p className="text-sm text-muted-foreground">
          Bearbeite vorhandene Mailabschnitte.
        </p>
      </div>
      <Separator />
      {settings.length === 0 ? (
        <div className={"w-full p-10 border rounded-lg"}>
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
                {generalSettings.map((setting) => (
                  <MailForm key={setting.key} setting={setting} />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Bestätigung
              </AccordionTrigger>
              <AccordionContent>
                {confirmSettings.map((setting) => (
                  <MailForm key={setting.key} setting={setting} />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Verfügbarkeiten
              </AccordionTrigger>
              <AccordionContent>
                {availablitySettings.map((setting) => (
                  <MailForm key={setting.key} setting={setting} />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className={"hover:no-underline"}>
                Zuweisungen
              </AccordionTrigger>
              <AccordionContent>
                {assignSettings.map((setting) => (
                  <MailForm key={setting.key} setting={setting} />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
}
