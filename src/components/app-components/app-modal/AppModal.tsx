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
    } = props

    return (
        <Dialog
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            modal={modal}
        >
            {trigger ? (
                <DialogTrigger>{trigger}</DialogTrigger>
            ) : null}

            <DialogContent
                showCloseButton={showCloseButton}
                className={cn(classNames?.content)}
                {...contentProps}
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