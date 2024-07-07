import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getEvents } from "@/app/actions";

const EventTable = async () => {
  const data = await getEvents();

  return (
    <div className="w-fill mx-auto">
      <DataTable columns={columns} data={data.events} />
    </div>
  );
}

export { EventTable };
