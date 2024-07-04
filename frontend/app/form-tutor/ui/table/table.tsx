import { columns } from "../../../../lib/columns"
import { DataTable } from "./data-table"
import { client } from "@/lib/graphClient"
import { GET_EVENTS } from "@/lib/queries"
import { Veranstaltungen, Vorlesung } from "@/lib/definitions"

async function getData(): Promise<Vorlesung[]> {
    const jsonData : Veranstaltungen = await client.request(GET_EVENTS);

    const vorlesungen: Vorlesung[] = jsonData.events.map(event => ({
        id: event.ID,
        title: event.title,
        date: new Date(event.from).toLocaleDateString(),
        time: new Date(event.from).toLocaleTimeString() + " - " + new Date(event.to).toLocaleTimeString()
    }));

    return vorlesungen;
}

export default async function EventTable() {
    const data = await getData()

    return (
        <div className="w-fill mx-auto">
            <DataTable columns={columns} data={data}/>
        </div>
    )
}
