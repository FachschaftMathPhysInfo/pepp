"use client"

import EventTable from "./event-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  const inputDivStyling = "w-full my-1 grow-0";
  const tableDivStyling = "my-5 md:min-h-32 grow";

  const action = () => {
    alert("hello")
  }

  return (
    <div className="w-full h-full">
      <div className="w-full mt-3">
        <h1 className="text-center font-bold text-2xl mb-2"> Anmeldung Vorkurstutor:in </h1>
    <form action={action} className="flex flex-col w-[85%] md:w-[50%] xl:w-[35%] md:h-[calc(100vh-10rem)] mx-auto pb-3">
      <div className={inputDivStyling}>
        <Input type="text" name="fn" placeholder="Vorname" />
      </div>

      <div className={inputDivStyling}>
        <Input type="text" name="sn" placeholder="Nachname" />
      </div>

      <div className={inputDivStyling}>
        <Input type="email" name="email" placeholder="E-Mail" />
      </div>

      <div className={tableDivStyling}>
        <EventTable />
      </div>
      <Button className="submit">Anmelden</Button>
    </form>
      </div>
    </div>
  );
}
