import { extractId } from "@/lib/utils";
import { PlannerPage } from "./planner";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Pepp - Stundenplan',
  description: 'Stundenplan des Vorkurses der Fachschaft MathPhysInfo',
  keywords: ['pepp', 'stundenplan', 'vorkurs', 'heidelberg', 'uni'],
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ planner: string }>;
}) {
  const { planner } = await params;
  const id = extractId(planner);

  return <PlannerPage umbrellaID={id ?? 0} />
}
