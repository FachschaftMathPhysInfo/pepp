import {Vorlesung, columns} from "./columns"
import {DataTable} from "./data-table"

async function getData(): Promise<Vorlesung[]> {
    // Fetch data from your API here.
    return [
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        {
            isSelected: false,
            name: "Logik",
            date: "1.10.",
        },
        // ...
    ]
}

export default async function EventTable() {
    const data = await getData()

    return (
        <div className="w-fill mx-auto">
            <DataTable columns={columns} data={data}/>
        </div>
    )
}
