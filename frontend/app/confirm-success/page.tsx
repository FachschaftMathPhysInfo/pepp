import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MailCheck} from "lucide-react";


export default async function ConfirmSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className={'p-12 flex flex-col items-center justify-center'}>
        <CardHeader>
          <MailCheck size={100} className={'stroke-green-600'}/>
        </CardHeader>
        <CardContent className={'flex flex-col items-center justify-center'}>
          <CardTitle className="text-2xl font-bold text-green-600">E-Mail Bestätigt</CardTitle>
          <CardDescription className="mt-2 text-lg">
            Du kannst deinen Account nun mit allen Funktionen nutzen
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
