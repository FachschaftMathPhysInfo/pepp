"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Globe, House, Mail, Phone, Save } from "lucide-react";
import {
  ScalarType,
  Setting,
  SettingsDocument,
  SettingsQuery,
  UpsertSettingDocument,
  UpsertSettingMutation,
} from "@/lib/gql/generated/graphql";
import { getClient } from "@/lib/graphql";
import React, { useEffect, useState } from "react";
import { ManagementPageHeader } from "@/components/management-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DiscordIcon,
  GithubIcon,
  InstagramIcon,
  MatrixIcon,
  WhatsappIcon,
} from "@/components/social-icons";
import {useUser} from "@/components/provider/user-provider";

const FormSchema = z.object({
  input: z.string(),
});

export default function IndexPage() {
  const { sid } = useUser();
  const [settings, setSettings] = useState<Setting[] | undefined>(undefined);
  useEffect(() => {
    if (!sid) return;
    const client = getClient(sid!);
    const fetchData = async () => {
      try {
        const settingsData = await client.request<SettingsQuery>(
          SettingsDocument,
          {
            key: [
              "social-telephone",
              "social-mail",
              "social-whatsapp",
              "social-instagram",
              "social-discord",
              "social-matrix",
              "social-homepage",
              "social-github",
            ],
          }
        );
        setSettings(settingsData.settings);
      } catch {
        toast.error("Fehler beim Laden der Einstellungen.");
      }
    };

    fetchData();
  }, [sid]);

  function getSettingValue(key: string) {
    const s = settings?.find((s) => s.key === key);
    return s ? s.value : "";
  }

  return (
    settings && (
      <section className="space-y-6">
        <ManagementPageHeader
          iconNode={<Globe />}
          title={"Kontakt"}
          description={
            "Verwalte hier die Kontaktmöglichkeiten, welche über dem Header angezeigt werden. Leere Felder werden nicht angezeigt."
          }
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Klassisch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SocialSettingInput
              settingKey="social-telephone"
              settingValue={getSettingValue("social-telephone")}
              icon={<Phone className="size-4" />}
              placeholder="Telefonnummer"
            />
            <SocialSettingInput
              settingKey="social-mail"
              settingValue={getSettingValue("social-mail")}
              icon={<Mail className="size-4" />}
              placeholder="E-Mail Adresse"
            />
            <SocialSettingInput
              settingKey="social-homepage"
              settingValue={getSettingValue("social-homepage")}
              icon={<House className="size-4" />}
              placeholder="Homepage-Link"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SocialSettingInput
              settingKey="social-whatsapp"
              settingValue={getSettingValue("social-whatsapp")}
              icon={<WhatsappIcon className="size-4" />}
            />
            <SocialSettingInput
              settingKey="social-discord"
              settingValue={getSettingValue("social-discord")}
              icon={<DiscordIcon className="size-4" />}
            />
            <SocialSettingInput
              settingKey="social-github"
              settingValue={getSettingValue("social-github")}
              icon={<GithubIcon className="size-4" />}
            />
            <SocialSettingInput
              settingKey="social-instagram"
              settingValue={getSettingValue("social-instagram")}
              icon={<InstagramIcon className="size-4" />}
            />
            <SocialSettingInput
              settingKey="social-matrix"
              settingValue={getSettingValue("social-matrix")}
              icon={<MatrixIcon className="size-4" />}
            />
          </CardContent>
        </Card>
      </section>
    )
  );
}

interface SocialSettingInputProps {
  settingKey: string;
  settingValue: string;
  icon: React.ReactNode;
  placeholder?: string;
}

function SocialSettingInput({
  icon,
  settingValue,
  settingKey,
  placeholder = "Link",
}: SocialSettingInputProps) {
  const { sid } = useUser();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      input: settingValue,
    },
  });

  async function changeSetting(data: z.infer<typeof FormSchema>) {
    const client = getClient(sid!);
    try {
      client.request<UpsertSettingMutation>(UpsertSettingDocument, {
        setting: {
          key: settingKey,
          value: data.input,
          type: ScalarType.String,
        },
      });
      toast.info("Erfolgreich gesichert!");
    } catch {
      toast.error(
        "Einstellung konnte nicht gespeichert werden. Bitte versuche es erneut."
      );
    }
  }

  return (
    <div className="flex flex-row items-center gap-x-4 w-full">
      {icon}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(changeSetting)}
          className="flex flex-row gap-x-2 w-full"
        >
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder={placeholder} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" variant="secondary">
            <Save className="size-4" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
