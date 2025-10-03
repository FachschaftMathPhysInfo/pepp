import React from "react";
import { Mail } from "lucide-react";

export function MailLinkWithLabel({
  label,
  mail,
}: {
  label: string;
  mail: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-row items-center">
        <Mail className="mr-2 h-4 w-4 opacity-70" />
        <a href={"mailto:" + mail} className="truncate">
          {mail}
        </a>
      </div>
    </div>
  );
}
