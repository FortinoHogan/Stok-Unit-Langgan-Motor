import type { HTMLInputTypeAttribute } from "react";

export interface AppTextFieldProps {
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  description?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  withoutMargin?: boolean;
}
