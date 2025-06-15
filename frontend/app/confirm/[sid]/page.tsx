import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MailCheck, MailX} from "lucide-react";


export default async function ConfirmPage({params}: {params: Promise<{ sid: string }>}) {
  const { sid } = await params;

  let status: "success" | "error";

  try {
    const response = await fetch(`http://localhost:8080/confirm/${sid}`);

    if (response.ok) {
      status = "success";
    } else {
      status = "error";
    }

  } catch {
    status = "error";
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
        {status === "success" ? (
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
        ) : (
          <Card className={'p-12 flex flex-col items-center justify-center'}>
            <CardHeader>
              <MailX size={100} className={'stroke-red-600'}/>
            </CardHeader>
            <CardContent className={'flex flex-col items-center justify-center'}>
              <CardTitle className="text-2xl font-bold text-red-600">E-Mail Bestätigung fehlgeschlagen</CardTitle>
              <CardDescription className="mt-2 text-lg">
                Dieser Link ist entweder abgelaufen oder dein Konto wurde schon aktiviert
              </CardDescription>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
