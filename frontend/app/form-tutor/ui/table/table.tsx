import {columns} from "../../../../lib/columns"
import {DataTable} from "./data-table"
import { client } from "@/lib/graphClient"
import { GET_EVENTS } from "@/lib/queries"
import { Event } from "@/lib/definitions"

async function getData(): Promise<Event[]> {
    const jsonData = await client.request(GET_EVENTS);

    const events: Event[] = jsonData.events.map(event => ({
        id: event.ID,
        title: event.title,
        date: new Date(event.from).toLocaleDateString(),
        time: new Date(event.from).toLocaleTimeString() + " - " + new Date(event.to).toLocaleTimeString()
    }));

    return events;
}

export default async function EventTable() {
    const data = await getData()

    return (
        <div className="w-fill mx-auto">
            <DataTable columns={columns} data={data}/>
        </div>
    )
}
