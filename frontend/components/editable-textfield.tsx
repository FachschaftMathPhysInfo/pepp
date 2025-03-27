import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";
interface EditableTextfieldProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  edit: boolean;
  value: string;
}

export default function EditableTextfield({
  className,
  value,
  edit,
}: EditableTextfieldProps) {
  return (
    <TextareaAutosize
      placeholder="Veranstaltungstitel"
      defaultValue={value}
      disabled={!edit}
      className={cn(
        "disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-dashed border-b-2 disabled:border-none pb-2",
        className
      )}
    />
  );
}
