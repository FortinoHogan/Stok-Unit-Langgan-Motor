import type React from "react";
import type { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";

export interface AppModalClassNames {
  content?: string;
  header?: string;
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
}

export interface AppModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  contentProps?: Omit<
    React.ComponentProps<typeof DialogPrimitive.Content>,
    "children" | "className"
  >;
  classNames?: AppModalClassNames;
}
