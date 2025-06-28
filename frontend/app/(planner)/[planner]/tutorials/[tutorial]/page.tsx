import { extractId } from "@/lib/utils";
import { TutorialPage } from "@/components/tutorial-detail-page/tutorial-page";

export default async function TutorialDetailPage({
  params,
}: {
  params: Promise<{ tutorial: string }>;
}) {
  const { tutorial } = await params;
  return (
    <>
      <TutorialPage id={extractId(tutorial) ?? 0} />
    </>
  );
}
