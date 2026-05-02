import type { HTMLInputTypeAttribute } from "react";

export interface AppTextFieldProps {
  label: string;
  id?: string;
  name?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  description?: string;
  required?: boolean;
  requiredMessage?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  withoutMargin?: boolean;
  isUppercase?: boolean;
  isDisabled?: boolean;
}
