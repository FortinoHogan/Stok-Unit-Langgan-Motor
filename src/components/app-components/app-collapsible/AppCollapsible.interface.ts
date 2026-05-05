import type { ReactNode } from "react"

export interface AppCollapsibleProps {
  title: ReactNode
  children: ReactNode
  description?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  withoutMargin?: boolean
  classNames?: {
    wrapper?: string
    trigger?: string
    content?: string
    title?: string
    description?: string
  }
}
