import {Event} from "@/lib/gql/generated/graphql";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";

const EventTable = () => {
  const [data, setData] = useState<Event[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full mx-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default EventTable;
