import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import EventTable from "@/app/form-tutor/ui/table/table";
import { Header } from "./ui/header"

const inputDivCss = "w-96 my-3"
const divCSS = "my-10 w-full h-full"

export default function Page() {
    return (
        <div className="w-full h-full">
            <Header></Header>
            <div className="w-fit mx-auto p-10">

                <h1 className="font-bold text-2xl">Anmeldung Vorkurstutor:in</h1>

                <div className={inputDivCss}>
                    <Input placeholder="Vorname"></Input>
                </div>

                <div className={inputDivCss}>
                    <Input placeholder="Nachname"></Input>
                </div>

                <div className={inputDivCss}>
                    <Input type="email" placeholder="E-Mail"></Input>
                </div>

                <div className={divCSS}>
                    <EventTable></EventTable>
                </div>


                <div className={inputDivCss}>
                    <Button>Submit</Button>
                </div>
            </div>

        </div>
    )
}