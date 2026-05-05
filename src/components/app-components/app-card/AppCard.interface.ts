import type { ReactNode } from "react"

export interface AppCardClassNames {
  card?: string
  header?: string
  title?: string
  description?: string
  action?: string
  content?: string
  footer?: string
}

export interface AppCardProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: "default" | "sm"
  withoutMargin?: boolean
  classNames?: AppCardClassNames
}
