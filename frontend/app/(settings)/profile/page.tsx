"use client";

import { Separator } from "@/components/ui/separator";
import React, { useState} from "react";
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
import { Save } from "lucide-react";
// import { useUmbrella } from "@/components/providers/umbrella-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "date-fns";
import { send } from "process";
import { stat } from "fs";


const FormEmailSchema = z.object({
  title: z.string().email( {
    message: "Bitte gib eine Valide E-Mail an.",
  }),
});

const FormVerificationSchema = z.object({
  title: z.string().min( 2,{
    message: "Verifikationscode ist Falsch!",
  }),
});

export default function SettingsProfilePage() {

  const [personInfo, Spi] =useState("test@email.de");
  const [newEmail, setNewEmail] = useState("");
  const [EmailDialog, setEmaiDialog] = useState(false);
  const [EmailVerificationDialog, setEmailVerificationDialog] = useState(false);
  const [ChangePasswordDialog, setChangePasswordDialog] = useState(false);
  const [DeleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [umbrella, setUmbrella] = useState<Event | null>(null);

  const formEmail = useForm<z.infer<typeof FormEmailSchema>>({
    resolver: zodResolver(FormEmailSchema),
    defaultValues: {
      title: umbrella?.title ?? "",
    },
  });

  const formVerification = useForm<z.infer<typeof FormVerificationSchema>>({
    resolver: zodResolver(FormEmailSchema),
    defaultValues: {
      title: umbrella?.title ?? "",
    },
  });



  function sendVerifikationEmail(data: z.infer<typeof FormEmailSchema>) {
    setNewEmail(data.title);
    setEmaiDialog(false);
    setEmailVerificationDialog(true);
  }
  function updateEmail() {
    Spi(newEmail);
    // implement ubdating the email in the database
    setEmailVerificationDialog(false);
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
      <h3> Email:  {personInfo} {umbrella?.type} </h3>
         
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
                          placeholder={"Name"}
                          
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
        <DialogContent>
          <DialogTitle>Gebe den Verifikations code ein.</DialogTitle>
          <Form {...formVerification}>
            <form
              onSubmit ={formVerification.handleSubmit(updateEmail)}
              className="w-2/3 space-y-6"
              >
                <FormField
                control={formVerification.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Verifikationscode eingeben</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={"Name"}
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
              <Button type="submit">
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
      </Dialog>
    </div>
  );
}
