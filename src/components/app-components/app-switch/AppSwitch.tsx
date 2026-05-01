import { useId } from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import type { AppSwitchProps } from "./AppSwitch.interface"

const AppSwitch = (props: AppSwitchProps) => {
    const {
        label,
        id,
        name,
        checked,
        defaultChecked,
        onCheckedChange,
        description,
        error,
        disabled = false,
        required = false,
        withoutMargin = false,
        size = "default",
        classNames,
        switchProps,
    } = props

    const generatedId = useId()
    const switchId = id ?? `input-switch-${generatedId.replace(/:/g, "")}`

    return (
        <Field
            orientation="horizontal"
            className={cn(withoutMargin ? "" : "mb-5", classNames?.field)}
            data-invalid={!!error}
            data-disabled={disabled}
        >
            <div className={cn("flex items-center gap-3", classNames?.switchWrapper)}>
                <Switch
                    id={switchId}
                    name={name}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                    required={required}
                    size={size}
                    aria-invalid={!!error}
                    aria-required={required}
                    className={cn(classNames?.switchRoot)}
                    {...switchProps}
                />
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
                <FieldLabel htmlFor={switchId} className={cn("cursor-pointer", classNames?.label)}>
                    {label}
                    {required ? <span className="text-destructive">*</span> : null}
                </FieldLabel>

                {error ? (
                    <FieldDescription className={cn("text-destructive", classNames?.error)}>
                        {error}
                    </FieldDescription>
                ) : description ? (
                    <FieldDescription className={cn(classNames?.description)}>
                        {description}
                    </FieldDescription>
                ) : null}
            </div>
        </Field>
    )
}

export default AppSwitch
