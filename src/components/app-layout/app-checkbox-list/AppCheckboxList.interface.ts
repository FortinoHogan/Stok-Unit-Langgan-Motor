import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Command as CommandPrimitive } from "cmdk";

export interface CheckboxListOption {
  value: string;
  label: string;
}

export interface AppCheckboxListProps {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  values: string[];
  options: CheckboxListOption[];
  disabled?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  withoutMargin?: boolean;
  onValuesChange?: (values: string[]) => void;
  inputProps?: ComponentProps<typeof CommandPrimitive.Input>;
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  classNames?: {
    field?: string;
    label?: string;
    trigger?: string;
    content?: string;
    list?: string;
  };
}
