import type React from "react";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";

export interface AppSearchBarClassNames {
  field?: string;
  label?: string;
  group?: string;
  input?: string;
  button?: string;
}

export interface AppSearchBarProps {
  id?: string;
  name?: string;
  label?: React.ReactNode;
  placeholder?: string;
  withoutMargin?: boolean;
  disabled?: boolean;

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  onSearch?: (value: string) => void;
  triggerSearchOnEnter?: boolean;
  trimSearchValue?: boolean;

  buttonText?: React.ReactNode;
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
  buttonSize?: VariantProps<typeof buttonVariants>["size"];

  inputProps?: Omit<
    React.ComponentProps<"input">,
    | "id"
    | "name"
    | "value"
    | "defaultValue"
    | "onChange"
    | "placeholder"
    | "disabled"
  >;
  buttonProps?: Omit<
    React.ComponentProps<"button">,
    "children" | "type" | "onClick" | "disabled"
  >;

  classNames?: AppSearchBarClassNames;
}
