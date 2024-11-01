import EventDialog from "@/components/event-dialog";
import { Footer } from "@/components/footer";
import { PlannerHeader } from "@/components/planner-selection";

interface PlannerLayoutProps {
  children: React.ReactNode;
}

export default function PlannerLayout({ children }: PlannerLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 mt-[90px] space-y-4 pl-6 pr-6">
        <PlannerHeader />
        <EventDialog />
        {children}
      </main>
      <Footer />
    </div>
  );
}
