import {Label, LabelsDocument, LabelsQuery} from "@/lib/gql/generated/graphql";
import React, {useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {LabelDialogState} from "@/app/(settings)/admin/labels/page";
import {LabelTable} from "@/components/tables/label-table/label-table";

interface LabelSectionProps {
  setDialogState: React.Dispatch<React.SetStateAction<LabelDialogState>>;
}

export default function LabelSection(props: LabelSectionProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLabels = async () => {
      setLoading(true);
      const client = getClient();

      try {
        const labelData = await client.request<LabelsQuery>(LabelsDocument)
        setLabels(labelData.labels)
        setLoading(false);
      } catch (error) {
        toast.error('Laden der Labels ist fehlgeschlagen, versuche es später nochmal')
        console.error('Failed fetching labels: ', error)
      }
    }

    void fetchLabels();
  }, []);

  if (loading) {
    return (
      <div className={'w-full h-[300px] relative'}>
        <Skeleton className={'w-full h-[300px]'} />
        <p className={'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}>Lade ...</p>
      </div>
    )
  }

  return (
    <LabelTable
      data={labels}
      setDialogState={props.setDialogState}
    />
  )
}