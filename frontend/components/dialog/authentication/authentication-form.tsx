import {getClient} from "@/lib/graphql";
import React, {useRef, useState} from "react";
import {z} from "zod";
import {
  LoginDocument,
  LoginQuery,
  LoginQueryVariables,
  RegistrationDocument,
  RegistrationMutation,
  RegistrationMutationVariables
} from "@/lib/gql/generated/graphql";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {useUser} from "@/components/provider/user-provider";


const SignInFormSchema = z.object({
  email: z.string().min(4, {
    message: "Bitte gib deine E-Mail Adresse an.",
  }),
  password: z.string().min(1, {
    message: "Bitte gib dein Passwort an.",
  }),
});

const RegisterFormSchema = SignInFormSchema.extend({
  fn: z.string().min(1, {
    message: "Bitte gib deinen Vornamen an.",
  }),
  sn: z.string().min(1, {
    message: "Bitte gib deinen Nachnamen an.",
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
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwörter stimmen nicht überein.",
});

interface AuthenticationFormProps {
  isRegistering : boolean;
  closeDialog?: () => void;
}

export default function AuthenticationForm({isRegistering, closeDialog}: AuthenticationFormProps) {
  const client = getClient();
  const formRef = useRef<HTMLFormElement>(null);

  const { login } = useUser();
  const [correct, setCorrect] = useState(true);
  const [loading, setLoading] = useState(false);
  const activeSchema = isRegistering ? RegisterFormSchema : SignInFormSchema;
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && formRef.current) {
      const focusableElements = Array.from(
        formRef.current.querySelectorAll(
          'input:not([disabled]), button:not([disabled]), [role="button"]:not([disabled])'
        )
      ) as HTMLElement[];

      const currentIndex = focusableElements.indexOf(e.target as HTMLElement);

      if (currentIndex !== -1) {
        e.preventDefault();

        let nextIndex;
        if (e.shiftKey) {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        } else {
          nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        }

        focusableElements[nextIndex]?.focus();
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof activeSchema>) => {
    setLoading(true);

    if (isRegistering && "fn" in data && "sn" in data && "password" in data) {
      const details: RegistrationMutationVariables = {
        mail: data.email,
        password: data.password,
        fn: data.fn,
        sn: data.sn,
      };

      const sid = await client.request<RegistrationMutation>(
        RegistrationDocument,
        details
      );
      login(sid.addUser);
    }

    const credentials: LoginQueryVariables = {
      mail: data.email,
      password: data.password,
    };

    try {
      const sid = await client.request<LoginQuery>(LoginDocument, credentials);

      login(sid.login);
      if (closeDialog) closeDialog()
    } catch {
      setCorrect(false);
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className="space-y-4"
      >
        {isRegistering && (
          <div className="flex flex-row space-x-4">
            <FormField
              name="fn"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      autoFocus={isRegistering}
                      placeholder="Vorname"
                      tabIndex={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="sn"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Nachname"
                      tabIndex={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                <Input
                  autoFocus={!isRegistering}
                  type="email"
                  placeholder="Email"
                  tabIndex={isRegistering ? 3 : 1}
                  {...field}
                />
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
                <Input
                  type="password"
                  placeholder="Passwort"
                  tabIndex={isRegistering ? 4 : 2}
                  {...field}
                />
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
                    tabIndex={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            tabIndex={isRegistering ? 6 : 3}
          >
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
  )
}