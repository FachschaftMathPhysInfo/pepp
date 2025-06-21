"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SwitchCard } from "@/components/switch-card";
import { BotIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ScalarType,
  Setting,
  SettingsDocument,
  SettingsQuery,
  UpsertSettingDocument,
  UpsertSettingMutation,
} from "@/lib/gql/generated/graphql";
import { getClient } from "@/lib/graphql";
import { useUser } from "@/components/providers";
import { useEffect, useState } from "react";
import { ManagementPageHeader } from "@/components/management-page-header";

const FormSchema = z.object({
  oidc_name: z.string().nonempty("Feld darf nicht leer sein."),
});

export default function IndexPage() {
  const { sid } = useUser();
  const [settings, setSettings] = useState<Setting[] | undefined>(undefined);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      oidc_name: "",
    },
  });

  useEffect(() => {
    if (!sid) return;
    const client = getClient(sid!);
    const fetchData = async () => {
      try {
        const settingsData = await client.request<SettingsQuery>(
          SettingsDocument,
          {
            key: [
              "auth-sso-oidc-name",
              "auth-sso-oidc-enabled",
              "auth-standard-enabled",
            ],
          }
        );
        setSettings(settingsData.settings);
        form.reset({
          oidc_name:
            settingsData.settings.find((s) => s.key === "auth-sso-oidc-name")
              ?.value ?? "OIDC Login",
        });
      } catch {
        toast.error("Fehler beim Laden der Einstellungen.");
      }
    };

    fetchData();
  }, [sid]);

  function getSettingValue(key: string) {
    const s = settings?.find((s) => s.key === key);
    if (!s) return "0";

    return s.value;
  }

  async function changeSetting(key: string, value: string, type: ScalarType) {
    const client = getClient(sid!);
    try {
      client.request<UpsertSettingMutation>(UpsertSettingDocument, {
        setting: {
          key: key,
          value: value,
          type: type,
        },
      });
      toast.info("Erfolgreich gesichert!");
    } catch {
      toast.error(
        "Einstellung konnte nicht gespeichert werden. Bitte versuche es erneut."
      );
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await changeSetting(
      "auth-sso-oidc-name",
      data.oidc_name,
      ScalarType.String
    );
  }

  return (
    settings && (
      <section className="space-y-6">
        <ManagementPageHeader
          iconNode={<BotIcon />}
          title={"Authentifizierung"}
          description={
            "Hier kannst du die Authentifizierungsschnittstellen der Plattform verwalten. Um beispielsweise Änderungen an der Schnittstelle vorzunehmen, kontaktiere bitte deinen Sysadmin."
          }
        />
        <SwitchCard
          title="Standard Login"
          description="Nutzerinnen und Nutzer können sich auf dieser Plattform registrieren und anmelden."
          initiallyChecked={
            getSettingValue("auth-standard-enabled") === "0" ? false : true
          }
          onCheckedChange={async (checked) =>
            await changeSetting(
              "auth-standard-enabled",
              checked ? "1" : "0",
              ScalarType.Boolean
            )
          }
        />
        <SwitchCard
          title="Open ID Connect Login"
          description="Fügt einen Login-Button zur Authentifizierung mittels anderem Provider hinzu. Die Schnittstelle muss von deinem Sysadmin eingerichtet werden."
          initiallyChecked={
            getSettingValue("auth-sso-oidc-enabled") === "0" ? false : true
          }
          onCheckedChange={async (checked) =>
            await changeSetting(
              "auth-sso-oidc-enabled",
              checked ? "1" : "0",
              ScalarType.Boolean
            )
          }
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-row space-x-2"
            >
              <FormField
                control={form.control}
                name="oidc_name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="OIDC Login" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name unter welchem der Login angezeigt wird.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant="secondary" type="submit">
                <Save />
              </Button>
            </form>
          </Form>
        </SwitchCard>
      </section>
    )
  );
}
