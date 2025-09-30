import { extractId } from "@/lib/utils";
import { TutorialPage } from "./tutorial-page";

export default async function TutorialDetailPage({
  params,
}: {
  params: Promise<{ tutorial: string }>;
}) {
  const { tutorial } = await params;
  return (
    <>
      <TutorialPage eventID={extractId(tutorial) ?? 0} />
    </>
  );
}
