import { extractId } from "@/lib/utils";
import React from "react";
import PlannerEventModal from "./event";

export default async function Page({
  params,
}: {
  params: Promise<{ planner: string; event: string }>;
}) {
  const { event } = await params;

  return <PlannerEventModal id={extractId(event) ?? 0} />;
}
