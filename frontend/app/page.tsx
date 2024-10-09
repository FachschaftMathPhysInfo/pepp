import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Planner from "./ui/planner";
import { Providers } from "./providers";

export default function Home() {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-[200px]" />}>
      <Providers>
        <Planner />
      </Providers>
    </Suspense>
  );
}
