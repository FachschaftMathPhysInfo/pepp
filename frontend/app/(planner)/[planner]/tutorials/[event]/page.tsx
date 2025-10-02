import { extractId } from "@/lib/utils";
import { TutorialPage } from "./tutorial-page";

export default async function TutorialDetailPage({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event } = await params;
  return (
    <>
      <TutorialPage eventID={extractId(event) ?? 0} />
    </>
  );
}
