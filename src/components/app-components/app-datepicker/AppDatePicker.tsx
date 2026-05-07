import { useId, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { AppDatePickerProps } from "./AppDatePicker.interface";

const formatDateLabel = (
  value?: Date,
  viewMode: "full" | "year" | "month" | "day" = "full",
) => {
  if (!value) {
    return "";
  }

  const formatOptions: Intl.DateTimeFormatOptions = {};

  if (viewMode === "full" || viewMode === "year") {
    formatOptions.year = "numeric";
  }
  if (viewMode === "full" || viewMode === "month") {
    formatOptions.month = "short";
  }
  if (viewMode === "full" || viewMode === "day") {
    formatOptions.day = "2-digit";
  }

  return new Intl.DateTimeFormat("en-US", formatOptions).format(value);
};

const YearPicker = ({
  value,
  onSelect,
  disabled,
}: {
  value?: Date;
  onSelect: (date: Date) => void;
  disabled?: boolean;
}) => {
  const currentYear = new Date().getFullYear();
  const selectedYear = value?.getFullYear() ?? currentYear;
  const startYear = currentYear - 6;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => {
              const newDate = new Date(value || Date.now());
              newDate.setFullYear(year);
              onSelect(newDate);
            }}
            disabled={disabled}
            className={cn(
              "px-3 py-2 text-sm rounded-md border transition-colors",
              selectedYear === year
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};

const MonthPicker = ({
  value,
  onSelect,
  disabled,
  lockedYear,
}: {
  value?: Date;
  onSelect: (date: Date) => void;
  disabled?: boolean;
  lockedYear?: number;
}) => {
  const selectedYear = value?.getFullYear() ?? new Date().getFullYear();
  const selectedMonth = value?.getMonth() ?? 0;
  const [displayYear, setDisplayYear] = useState(lockedYear ?? selectedYear);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleSelectMonth = (monthIndex: number) => {
    const newDate = new Date(value || Date.now());
    newDate.setFullYear(displayYear);
    newDate.setMonth(monthIndex);
    onSelect(newDate);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        {lockedYear ? (
          <span className="w-full text-center text-sm font-semibold">
            {displayYear}
          </span>
        ) : (
          <>
            <button
              onClick={() => setDisplayYear((prev) => prev - 1)}
              disabled={disabled}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold">{displayYear}</span>
            <button
              onClick={() => setDisplayYear((prev) => prev + 1)}
              disabled={disabled}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => handleSelectMonth(index)}
            disabled={disabled}
            className={cn(
              "px-3 py-2 text-sm rounded-md border transition-colors",
              displayYear === selectedYear && selectedMonth === index
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {month.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
};

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
    viewMode = "full",
    lockedYear,
    lockedMonth,
  } = props;

  const generatedId = useId();
  const inputId = id ?? `input-datepicker-${generatedId.replace(/:/g, "")}`;
  const [open, setOpen] = useState(false);

  const renderDatePicker = () => {
    if (viewMode === "year") {
      return (
        <YearPicker
          value={value}
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
          disabled={disabled}
        />
      );
    }

    if (viewMode === "month") {
      return (
        <MonthPicker
          value={value}
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
          disabled={disabled}
          lockedYear={lockedYear}
        />
      );
    }

    // Default: day picker
    const lockedMonthProps =
      lockedYear !== undefined && lockedMonth !== undefined
        ? {
            startMonth: new Date(lockedYear, lockedMonth - 1, 1),
            endMonth: new Date(lockedYear, lockedMonth - 1, 1),
            defaultMonth: new Date(lockedYear, lockedMonth - 1, 1),
            captionLayout: "label" as const,
          }
        : {};

    return (
      <Calendar
        mode="single"
        captionLayout="dropdown"
        selected={value}
        onSelect={(nextDate) => {
          onValueChange?.(nextDate);
          setOpen(false);
        }}
        disabled={disabled}
        className={cn(classNames?.calendar)}
        {...lockedMonthProps}
        {...calendarProps}
      />
    );
  };

  return (
    <Field className={cn(withoutMargin ? "" : "mb-4", classNames?.field)}>
      <FieldLabel htmlFor={inputId} className={cn(classNames?.label)}>
        {label}
        {required && <span className="text-destructive">*</span>}
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
            <span className="truncate">
              {value ? formatDateLabel(value, viewMode) : placeholder}
            </span>
            <CalendarIcon className="ml-2 size-4 opacity-70" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn("w-auto p-0", classNames?.content)}
          align="start"
        >
          {renderDatePicker()}

          {footer ? <div className="border-t p-2">{footer}</div> : null}
        </PopoverContent>
      </Popover>
    </Field>
  );
};

export default AppDatePicker;
