import Header from "@/components/header";
import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Planner from "./ui/planner";

export default function Home() {
  return (
    <main>
      <Header />

      <Suspense fallback={<Skeleton className="h-10 w-[200px]" />}>
        <Planner />
      </Suspense>
    </main>
  );
}
