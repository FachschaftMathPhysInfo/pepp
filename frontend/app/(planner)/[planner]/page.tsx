import { extractId } from "@/lib/utils";
import { PlannerPage } from "./planner";
import Link from "next/link";

export default async function IndexPage({
  params,
}: {
  params: Promise<{ planner: string }>;
}) {
  const { planner } = await params;
  const id = extractId(planner);
  return (
    <>
      <PlannerPage umbrellaID={id ?? 0} />
    </>
  );
}
