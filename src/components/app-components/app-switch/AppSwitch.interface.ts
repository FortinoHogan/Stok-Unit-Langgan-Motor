import type React from "react";
import type { Switch as SwitchPrimitive } from "radix-ui";

export interface AppSwitchClassNames {
  field?: string;
  label?: string;
  description?: string;
  error?: string;
  switchWrapper?: string;
  switchRoot?: string;
}

export interface AppSwitchProps {
  label: React.ReactNode;
  id?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  description?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  withoutMargin?: boolean;
  size?: "sm" | "default";
  classNames?: AppSwitchClassNames;
  switchProps?: Omit<
    React.ComponentProps<typeof SwitchPrimitive.Root>,
    | "id"
    | "name"
    | "checked"
    | "defaultChecked"
    | "onCheckedChange"
    | "disabled"
    | "required"
    | "className"
  >;
}
