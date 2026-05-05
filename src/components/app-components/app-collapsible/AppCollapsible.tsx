import { ChevronDown } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

import type { AppCollapsibleProps } from "./AppCollapsible.interface"

const AppCollapsible = (props: AppCollapsibleProps) => {
  const {
    title,
    children,
    description,
    open,
    defaultOpen = false,
    disabled = false,
    onOpenChange,
    withoutMargin = false,
    classNames,
  } = props

  return (
    <Collapsible
      open={open}
      defaultOpen={defaultOpen}
      disabled={disabled}
      onOpenChange={onOpenChange}
      className={cn("rounded-lg border bg-card", withoutMargin ? "" : "mb-4", classNames?.wrapper)}
    >
      <CollapsibleTrigger
        className={cn(
          "group flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
          "disabled:pointer-events-none disabled:opacity-50",
          classNames?.trigger,
        )}
      >
        <div className="space-y-0.5">
          <h3 className={cn("text-sm font-semibold", classNames?.title)}>{title}</h3>
          {description ? (
            <p className={cn("text-xs text-muted-foreground", classNames?.description)}>{description}</p>
          ) : null}
        </div>
        <ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className={cn("border-t px-4 py-3", classNames?.content)}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default AppCollapsible
