import type React from "react";
import type { ReactNode } from "react";
import type { Calendar } from "@/components/ui/calendar";

export interface AppDatePickerClassNames {
  field?: string;
  label?: string;
  trigger?: string;
  content?: string;
  calendar?: string;
}

export interface AppDatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: Date;
  onValueChange?: (value: Date | undefined) => void;
  withoutMargin?: boolean;
  footer?: ReactNode;
  classNames?: AppDatePickerClassNames;
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    "mode" | "selected" | "onSelect" | "disabled"
  >;
  viewMode?: "full" | "year" | "month" | "day";
  lockedYear?: number;
  lockedMonth?: number;
}
