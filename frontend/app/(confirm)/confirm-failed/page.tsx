import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MailX} from "lucide-react";


export default async function ConfirmFailPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Card className={'max-w-[500px]'}>
        <CardHeader className={'flex flex-col items-center justify-center'}>
          <MailX size={100} className={'stroke-red-600'}/>
          <CardTitle className="text-2xl font-bold text-red-600">URL nicht gültig</CardTitle>
        </CardHeader>
        <CardContent className={'text-center'}>
            Dieser Link ist abgelaufen oder hat nie existiert. Solltest du einen neuen Account erstellt haben,
            musst du innerhalb einer Stunde deine E-Mail bestätigen, sonst wird er wieder gelöscht. <br/>
            Registriere dich gerne erneut oder melde dich bei den Systemadministrator:innen,
            solltest du glauben ein Systemfehler liegt vor
        </CardContent>
      </Card>
    </div>
  );
}
