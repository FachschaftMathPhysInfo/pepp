import {Setting} from "@/lib/gql/generated/graphql";
import {cn} from "@/lib/utils";
import {Separator} from "@radix-ui/react-dropdown-menu";

interface MailSectionProps {
  setting: Setting;
  className?: string;
}

export default function SettingSection({
  setting,
  className,
}: MailSectionProps) {
  return (
    <div
      className={cn(
        "border border-muted-foreground/50 rounded-2xl p-8",
        className
      )}
    >
      <div className={"w-full flex flex-row justify-between items-start"}>
        <div>
          <Separator/>
          <div className={"font-bold text-xl"}>{setting.key}</div>
          <div className={"text-muted-foreground"}>
            <span>{setting.value}</span>
            <span className={"mx-2"}>|</span>
            <span>{setting.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
