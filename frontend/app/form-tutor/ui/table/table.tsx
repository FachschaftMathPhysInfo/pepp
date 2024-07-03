import {columns} from "./columns"
import {DataTable} from "./data-table"
import { VorlesungResponse } from "@/app/lib/definitions"
import { GetServerSideProps } from "next"
import { client } from "@/app/lib/graphClient"
import { GET_EVENTS } from "@/app/lib/queries"

export const getServerSideProps: GetServerSideProps = async () => {
    const data = await client.request(GET_EVENTS);
    return {
        props: {
            vorlesungen: data.vorlesung,
        }
    };
};

export default async function EventTable({ vorlesungen }: VorlesungResponse) {

    return (
        <div className="w-fill mx-auto">
            <DataTable columns={columns} data={vorlesungen}/>
        </div>
    )
}
