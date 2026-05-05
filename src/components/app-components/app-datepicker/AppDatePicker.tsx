import { useId, useState } from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import type { AppDatePickerProps } from "./AppDatePicker.interface"

const formatDateLabel = (value?: Date) => {
  if (!value) {
    return ""
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value)
}

const AppDatePicker = (props: AppDatePickerProps) => {
  const {
    id,
    name,
    label = "Date",
    placeholder = "Pick a date",
    required = false,
    disabled = false,
    value,
    onValueChange,
    withoutMargin = false,
    footer,
    classNames,
    calendarProps,
  } = props

  const generatedId = useId()
  const inputId = id ?? `input-datepicker-${generatedId.replace(/:/g, "")}`
  const [open, setOpen] = useState(false)

  return (
    <Field className={cn(withoutMargin ? "" : "mb-4", classNames?.field)}>
      <FieldLabel htmlFor={inputId} className={cn(classNames?.label)}>
        {label}{required && <span className="text-destructive">*</span>}
      </FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={inputId}
            name={name}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between text-left font-normal",
              !value && "text-muted-foreground",
              classNames?.trigger,
            )}
            aria-required={required}
          >
            <span className="truncate">{value ? formatDateLabel(value) : placeholder}</span>
            <CalendarIcon className="ml-2 size-4 opacity-70" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className={cn("w-auto p-0", classNames?.content)} align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={value}
            onSelect={(nextDate) => {
              onValueChange?.(nextDate)
              setOpen(false)
            }}
            disabled={disabled}
            className={cn(classNames?.calendar)}
            {...calendarProps}
          />

          {footer ? <div className="border-t p-2">{footer}</div> : null}
        </PopoverContent>
      </Popover>
    </Field>
  )
}

export default AppDatePicker
