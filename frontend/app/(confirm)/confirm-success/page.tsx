import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MailCheck} from "lucide-react";


export default async function ConfirmSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className={'max-w-[500px]'}>
        <CardHeader className={'flex flex-col items-center justify-center'}>
          <MailCheck size={100} className={'stroke-green-600'}/>
          <CardTitle className="text-2xl font-bold text-green-600">E-Mail Bestätigt!</CardTitle>
        </CardHeader>
        <CardContent className={'text:center'}>
          Du kannst deinen Account nun mit allen Funktionen nutzen.
        </CardContent>
      </Card>
    </div>
  );
}
