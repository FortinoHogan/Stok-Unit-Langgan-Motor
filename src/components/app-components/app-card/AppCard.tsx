import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { AppCardProps } from "./AppCard.interface"

const AppCard = (props: AppCardProps) => {
  const {
    title,
    description,
    action,
    children,
    footer,
    size = "default",
    withoutMargin = false,
    classNames,
  } = props

  return (
    <Card
      size={size}
      className={cn(withoutMargin ? "" : "mb-4", classNames?.card)}
    >
      {title || description || action ? (
        <CardHeader className={cn(classNames?.header)}>
          {title ? <CardTitle className={cn(classNames?.title)}>{title}</CardTitle> : null}
          {description ? (
            <CardDescription className={cn(classNames?.description)}>{description}</CardDescription>
          ) : null}
          {action ? <CardAction className={cn(classNames?.action)}>{action}</CardAction> : null}
        </CardHeader>
      ) : null}

      {children ? <CardContent className={cn(classNames?.content)}>{children}</CardContent> : null}

      {footer ? <CardFooter className={cn(classNames?.footer)}>{footer}</CardFooter> : null}
    </Card>
  )
}

export default AppCard
