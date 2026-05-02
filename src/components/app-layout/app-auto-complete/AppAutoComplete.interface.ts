import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Command as CommandPrimitive } from "cmdk";

export interface AutoCompleteOption {
  value: string;
  label: string;
}

export interface AppAutoCompleteProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  value?: string;
  options: AutoCompleteOption[];
  disabled?: boolean;
  withoutMargin?: boolean;
  onValueChange?: (value: string) => void;
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
