import {Separator} from "@/components/ui/separator";
import React from "react";


interface ManagementPageProps {
  title: string,
  description: string,
  iconNode?: React.ReactNode
  actionButton?: React.ReactNode
}

export function ManagementPageHeader({ title, description, iconNode, actionButton }: ManagementPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className={'flex items-center flex-wrap gap-y-3 mb-4'}>
          <div className={'flex items-center mr-4'}>
            {iconNode && <div className="mr-2">{iconNode}</div>}
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          {actionButton}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {description}
        </p>
      </div>
      <Separator className={'mb-8'}/>
    </div>
  )
}