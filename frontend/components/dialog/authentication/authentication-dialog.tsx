import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Setting,
  SettingsDocument,
  SettingsQuery,
} from "@/lib/gql/generated/graphql";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { getClient } from "@/lib/graphql";
import { useRouter } from "next/navigation";
import { DialogProps } from "@radix-ui/react-dialog";
import AuthenticationForm from "./authentication-form";
import { Separator } from "@/components/ui/separator";

interface AuthenticationDialogProps extends DialogProps {
  closeDialog?: () => void;
}

export const AuthenticationDialog = (props: AuthenticationDialogProps) => {
  const client = getClient();
  const router = useRouter();
  const [settings, setSettings] = useState<Setting[] | undefined>(undefined);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
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
      } catch {
        toast.error("Fehler beim Laden der Einstellungen.");
      }
    };

    void fetchData();
  }, []);

  const standardEnabled =
    settings?.find((s) => s.key === "auth-standard-enabled")?.value === "1";
  return (
    settings && (
      <Dialog
        open={props.open}
        onOpenChange={(open) => {
          if (props.onOpenChange) props.onOpenChange(open);
          else if (props.closeDialog) props.closeDialog();
        }}
      >
        <DialogContent className="max-w-[90vw] rounded-lg sm:max-w-[550px]">
          <DialogHeader>
            <DialogClose onClick={props.closeDialog} />
            <DialogTitle>
              {isRegistering ? "Registrieren" : "Anmelden"}
            </DialogTitle>
            {standardEnabled && (
              <DialogDescription>
                <span>
                  {isRegistering ? "Zurück zur" : "Noch kein Konto?"}{" "}
                </span>
                <span
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  {isRegistering ? "Anmeldung" : "Registrieren"}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>
          {standardEnabled && (
            <AuthenticationForm
              isRegistering={isRegistering}
              closeDialog={props.closeDialog}
            />
          )}
          {settings.find((s) => s.key === "auth-sso-oidc-enabled")?.value ==
            "1" && (
            <>
              {standardEnabled && <Separator />}
              <Button
                onClick={() => router.push("/sso/oidc")}
                variant="secondary"
              >
                {settings.find((s) => s.key === "auth-sso-oidc-name")?.value}
                <LogIn />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    )
  );
};
