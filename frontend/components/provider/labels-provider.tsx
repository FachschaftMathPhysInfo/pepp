"use client";

import {createContext, ReactNode, useContext, useEffect, useState,} from "react";
import {Label, LabelKind, LabelsDocument} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";

type LabelsContextType = {
  topicLabels: Label[]
  typeLabels: Label[]
  triggerLabelRefetch: () => void;
};

const LabelsContext = createContext<LabelsContextType | undefined>(undefined);

export const LabelsProvider = ({ children }: { children: ReactNode }) => {
  const [refetchKey, setRefetchKey] = useState(false);
  const [topicLabels, setTopicLabels] = useState<Label[]>([]);
  const [typeLabels, setTypeLabels] = useState<Label[]>([]);

  useEffect(() => {
    const fetchLabels = async () => {
      const client = getClient();
      const labelData = await client.request(LabelsDocument, {})
      const newTopics: Label[] = labelData.labels.filter(l => l.kind === LabelKind.Topic)
      const newTypes: Label[] = labelData.labels.filter(l => l.kind === LabelKind.EventType)
      setTopicLabels(newTopics)
      setTypeLabels(newTypes)
    }

    void fetchLabels()
  }, [refetchKey]);

  const triggerLabelRefetch = () => {
    setRefetchKey(!refetchKey);
  };


  return (
    <LabelsContext.Provider value={{ topicLabels, typeLabels, triggerLabelRefetch }}>
      {children}
    </LabelsContext.Provider>
  );
};

export const useLabels = (): LabelsContextType => {
  const context = useContext(LabelsContext);
  if (context === undefined) {
    throw new Error("useLabels must be used within a LabelsProvider");
  }
  return context;
};
