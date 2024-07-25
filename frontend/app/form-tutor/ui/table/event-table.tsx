import {TutorFormEventsQuery} from "@/lib/gql/generated/graphql";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getEvents } from "@/app/actions";
import { useEffect, useState } from "react";

const EventTable = () => {
  const [data, setData] = useState<TutorFormEventsQuery | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getEvents();
      setData(result);
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full mx-auto">
      <DataTable columns={columns} data={data.events} />
    </div>
  );
};

export default EventTable;
