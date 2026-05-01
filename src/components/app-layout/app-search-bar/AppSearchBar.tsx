import { useId, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { AppSearchBarProps } from "./AppSearchBar.interface"

const AppSearchBar = (props: AppSearchBarProps) => {
    const {
        id,
        name,
        label = "Search",
        placeholder = "Type to search...",
        withoutMargin = false,
        disabled = false,
        value,
        defaultValue = "",
        onValueChange,
        onSearch,
        triggerSearchOnEnter = true,
        trimSearchValue = true,
        buttonText = "Search",
        buttonVariant = "outline",
        buttonSize = "default",
        inputProps,
        buttonProps,
        classNames,
    } = props

    const generatedId = useId()
    const inputId = id ?? `input-search-${generatedId.replace(/:/g, "")}`
    const [internalValue, setInternalValue] = useState(defaultValue)

    const currentValue = useMemo(
        () => (value !== undefined ? value : internalValue),
        [internalValue, value],
    )

    const resolveSearchValue = () => {
        return trimSearchValue ? currentValue.trim() : currentValue
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value

        if (value === undefined) {
            setInternalValue(nextValue)
        }

        onValueChange?.(nextValue)
    }

    const handleSearch = () => {
        onSearch?.(resolveSearchValue())
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!triggerSearchOnEnter || event.key !== "Enter") {
            return
        }

        event.preventDefault()
        handleSearch()
    }

    return (
        <Field className={cn(withoutMargin ? "" : "mb-4", classNames?.field)}>
            <FieldLabel htmlFor={inputId} className={cn(classNames?.label)}>
                {label}
            </FieldLabel>
            <div className={cn("flex items-center gap-2", classNames?.group)} data-slot="button-group">
                <Input
                    id={inputId}
                    name={name}
                    placeholder={placeholder}
                    value={currentValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className={cn(classNames?.input)}
                    {...inputProps}
                />

                <Button
                    type="button"
                    variant={buttonVariant}
                    size={buttonSize}
                    onClick={handleSearch}
                    disabled={disabled}
                    className={cn(classNames?.button)}
                    {...buttonProps}
                >
                    {buttonText}
                </Button>
            </div>


        </Field>
    )
}

export default AppSearchBar
