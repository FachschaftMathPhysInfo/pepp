import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import EventTable from "@/app/form-tutor/ui/table/table";
import { Header } from "@/components/header"

const inputDivStyling = "w-96 my-3"
const tableDivStyling = "my-10 w-full h-full"

export default function Page() {
    return (
        <div className="w-full h-full">
            <Header></Header>
            <div className="w-fit mx-auto p-10">
                <h1 className="font-bold text-2xl">Anmeldung Vorkurstutor:in</h1>

                <div className={inputDivStyling}>
                    <Input placeholder="Vorname"/>
                </div>

                <div className={inputDivStyling}>
                    <Input placeholder="Nachname"/>
                </div>

                <div className={inputDivStyling}>
                    <Input type="email" placeholder="E-Mail" />
                </div>

                <div className={tableDivStyling}>
                    <EventTable/>
                </div>

                <div className={inputDivStyling}>
                    <Button>Submit</Button>
                </div>
            </div>
        </div>
    )
}