import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { AppModalProps } from './AppModal.interface'

const AppModal = (props: AppModalProps) => {
    const {
        open,
        defaultOpen,
        onOpenChange,
        modal = true,
        trigger,
        title,
        description,
        children,
        footer,
        showCloseButton = true,
        contentProps,
        classNames,
        canCloseOnOverlayClick = false,
    } = props

    const handlePointerDownOutside: NonNullable<typeof contentProps>['onPointerDownOutside'] = (event) => {
        if (!canCloseOnOverlayClick) {
            event.preventDefault()
        }

        contentProps?.onPointerDownOutside?.(event)
    }

    const handleInteractOutside: NonNullable<typeof contentProps>['onInteractOutside'] = (event) => {
        if (!canCloseOnOverlayClick) {
            event.preventDefault()
        }

        contentProps?.onInteractOutside?.(event)
    }

    return (
        <Dialog
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            modal={modal}
        >
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : null}

            <DialogContent
                {...contentProps}
                showCloseButton={showCloseButton}
                className={cn(classNames?.content)}
                onPointerDownOutside={handlePointerDownOutside}
                onInteractOutside={handleInteractOutside}
            >
                {title || description ? (
                    <DialogHeader className={cn(classNames?.header)}>
                        {title ? (
                            <DialogTitle className={cn(classNames?.title)}>{title}</DialogTitle>
                        ) : null}
                        {description ? (
                            <DialogDescription className={cn(classNames?.description)}>
                                {description}
                            </DialogDescription>
                        ) : null}
                    </DialogHeader>
                ) : null}

                {children ? <div className={cn(classNames?.body)}>{children}</div> : null}

                {(footer) ? (
                    <DialogFooter
                        className={cn(classNames?.footer)}
                    >
                        {footer}
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}

export default AppModal