"use client";

import { Separator } from "@/components/ui/separator";
import React, { use, useState} from "react";
import { useUser } from "@/components/providers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormInput, Save } from "lucide-react";
import { getClient } from "@/lib/graphql";
// import { useUmbrella } from "@/components/providers/umbrella-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "date-fns";
import { send, title } from "process";
import { stat } from "fs";


const FormEmailSchema = z.object({
  title: z.string().email( {
    message: "Bitte gib eine Valide E-Mail an.",
  }),
});

const FormPlaceholder = z.object({
  VerifikationCode: z.string().min(1, {
    message: "Bitte gib eine Validen Verifikations code ein.",
  }),
});

const FormDeleteAccount = z.object({
  pl: (z.string())


});


export default function SettingsProfilePage() {
  const { sid, user } = useUser();  
  const [personInfo, Spi] =useState("test@email.de");
  const [newEmail, setNewEmail] = useState("");
  const [EmailDialog, setEmaiDialog] = useState(false);
  const [EmailVerificationDialog, setEmailVerificationDialog] = useState(false);
  const [ChangePasswordDialog, setChangePasswordDialog] = useState(false);
  const [DeleteAccountDialog, setDeleteAccountDialog] = useState(false);
  /*
  useEffect(() => {
    const fetchUser = async () => {
      const client = getClient(sid!);

      const vars: UserDetailQueryVariables = {
        tutorMail: user?.mail!,
      };
      const tutorialsData = await client.request<>(
        vars
      );
      
    };
    fetchUser();	
    },[0]);
  */
  const formEmail = useForm<z.infer<typeof FormEmailSchema>>({
    resolver: zodResolver(FormEmailSchema),
    defaultValues: {
      title: "",
    },
  });

   const formVerification = useForm<z.infer<typeof FormPlaceholder>>({
    resolver: zodResolver(FormPlaceholder),
    defaultValues: {
      VerifikationCode: "",
    },
  });

  const formDeleteAccount = useForm<z.infer<typeof FormDeleteAccount>>({
    resolver: zodResolver(FormDeleteAccount),
    defaultValues: {
      pl: "",
    },
  });



  function sendVerifikationEmail(data: z.infer<typeof FormEmailSchema>) {
    setNewEmail(data.title);
    setEmaiDialog(false);
    setEmailVerificationDialog(true);
  }
  function updateEmail(data: z.infer<typeof FormPlaceholder>) {
    Spi(newEmail);
    // implement ubdating the email in the database
    setEmailVerificationDialog(false);
  }
  function deleteAccount(data: z.infer<typeof FormDeleteAccount>) {
    // implement deleting the account in the database
    setDeleteAccountDialog(false);
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Einstellungen</h3>
        <p className="text-sm text-muted-foreground">
          Passe deine persönlichen Informationen an.
        </p>
      </div>

      <Separator />
      <h3> Email:  {personInfo}  </h3>
         
      <Dialog open={EmailDialog} onOpenChange={setEmaiDialog}>
        <DialogTrigger asChild>
          <Button //variant="ghost" 
          > change E-Mail
          </Button>
        </DialogTrigger>
        <DialogContent >
          <DialogTitle>Gebe deine neue Emailadresse an</DialogTitle>
          <Form {...formEmail}>
            <form
              onSubmit={formEmail.handleSubmit(sendVerifikationEmail)}
              className="w-2/3 space-y-6"
            >
              <FormField
                control={formEmail.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                      <FormControl>
                        <Input
                          placeholder={"E-Mail"}
                          content=""
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Give a avlid E-Mail address. A verifikation code will be sent to this address.
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                Sende verifikation E-Mail
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={EmailVerificationDialog} onOpenChange={setEmailVerificationDialog}>
        <DialogTrigger>
          
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Gebe den Verifikations code ein.</DialogTitle>
          <Form {...formVerification}>
            <form
              onSubmit ={formVerification.handleSubmit(updateEmail)}
              className="w-2/3 space-y-6"
              >
                <FormField
                control={formVerification.control}
                name="VerifikationCode"
                render={({field}) => (
                  <FormItem>
                      <FormLabel>Verifikationscode eingeben</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={"Verifikationscode"}
                          content=""
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Input th verifikation code you received in your E-Mail
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" onClick={()=>{updateEmail}}>
                Check E-Mail Verifikation
              </Button>
              <Button  onClick={() => {setEmailVerificationDialog(false); setEmaiDialog(true)}}>
                Switch E-Mail
              </Button>
              
              
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {"\n"}
      <Dialog open={ChangePasswordDialog} onOpenChange={setChangePasswordDialog}>
      <DialogTrigger asChild>
          <Button //variant="ghost" 
          > Change Passwort
          </Button>
        </DialogTrigger>
      </Dialog>

      {"\n"}
      <Dialog open={DeleteAccountDialog} onOpenChange={setDeleteAccountDialog}>
      <DialogTrigger asChild>
          <Button //variant="ghost" 
          > delete Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Account löschen</DialogTitle>
          <Form {...formDeleteAccount}>
            <form
              onSubmit={formDeleteAccount.handleSubmit(deleteAccount)}
              className="w-2/3 space-y-6"
            >
              <FormField
                control={formDeleteAccount.control}
                name="pl"
                render={({ field }) => (
                  <FormItem>
                      <FormControl>
                        <Input
                          placeholder={"Passwort"}
                          content=""
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Gebe dein Passwort ein um dein Account zu löschen.
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                Delete Account
              </Button>
            </form>
          </Form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
