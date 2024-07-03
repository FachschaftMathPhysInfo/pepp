import {Event, columns} from "./columns"
import {DataTable} from "./data-table"

async function getData(): Promise<Event[]> {
    const jsonData = {
        "data": {
            "events": [
                {
                    "ID": "6da7655a-1c20-4228-9b8c-d1ee99317a87",
                    "title": "event1",
                    "from": "2024-07-01T10:00:00Z",
                    "to": "2024-07-01T12:00:00Z"
                }
            ]
        }
    };

    const events: Event[] = jsonData.data.events.map(event => ({
        id: event.ID,
        title: event.title,
        from: new Date(event.from),
        to: new Date(event.to)
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
