import { DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  EmailPasswordLoginDocument,
  EmailPasswordLoginQuery,
  EmailPasswordLoginQueryVariables,
  EventRegistration,
  RegistrationDocument,
  RegistrationMutation,
  RegistrationMutationVariables,
} from "@/lib/gql/generated/graphql";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { client } from "@/lib/graphql";
import { useUser } from "./providers";

const SignInFormSchema = z.object({
  email: z.string().min(4, {
    message: "Bitte gib deine E-Mail Adresse an.",
  }),
  password: z
    .string()
    .min(8, { message: "Muss mindestens 8 Zeichen lang sein." })
    .regex(new RegExp(".*[A-Z].*"), {
      message: "Muss einen Großbuchstaben enthalten.",
    })
    .regex(new RegExp(".*\\d.*"), { message: "Muss eine Nummer enthalten." })
    .regex(new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"), {
      message: "Muss ein Sonderzeichen enthalten.",
    }),
});

const RegisterFormSchema = SignInFormSchema.extend({
  fn: z.string().min(1, {
    message: "Bitte gib deinen Vornamen an.",
  }),
  sn: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwörter stimmen nicht überein.",
});

export const SignInDialog = () => {
  const { setUser, setRegistrations } = useUser();
  const [correct, setCorrect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const activeSchema = isRegistering ? RegisterFormSchema : SignInFormSchema;

  const onSubmit = async (data: z.infer<typeof activeSchema>) => {
    setLoading(true);

    if (isRegistering && "fn" in data && "sn" in data && "password" in data) {
      const details: RegistrationMutationVariables = {
        mail: data.email,
        password: data.password,
        fn: data.fn,
        sn: data.sn,
      };

      try {
        const userData = await client.request<RegistrationMutation>(
          RegistrationDocument,
          details
        );
        setUser(userData.addUser);
      } catch {
        console.log("ne");
      }
    }

    const credentials: EmailPasswordLoginQueryVariables = {
      email: data.email,
      password: data.password,
    };

    try {
      const userData = await client.request<EmailPasswordLoginQuery>(
        EmailPasswordLoginDocument,
        credentials
      );
      setUser(userData.login.user);
      setRegistrations(userData.registrations.map(r => ({
        event: {
          ID: r.event.ID,
          title: "",
          topic: { name: "" },
          type: { name: "" },
          from: "",
          to: "",
          needsTutors: true,
        },
        room: r.room,
      })))
    } catch {
      setCorrect(false);
    }

    setLoading(false);
  };

  const form = useForm<z.infer<typeof activeSchema>>({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fn: "",
      sn: "",
    },
  });

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>{isRegistering ? "Registrieren" : "Anmelden"}</DialogTitle>
        <DialogDescription>
          <span>{isRegistering ? "Zurück zur" : "Noch kein Konto?"} </span>
          <span
            onClick={() => setIsRegistering(isRegistering ? false : true)}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {isRegistering ? "Anmeldung" : "Registrieren"}
          </span>
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isRegistering && (
            <div className="flex flex-row space-x-4">
              <FormField
                name="fn"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Vorname" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="sn"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Nachname" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Passwort" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isRegistering && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Passwort wiederholen"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegistering ? "Registrieren" : "Anmelden"}
            </Button>
            {!correct && (
              <p className="mt-1 text-xs text-muted-foreground text-red-500">
                Email oder Passwort ist falsch.
              </p>
            )}
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};
