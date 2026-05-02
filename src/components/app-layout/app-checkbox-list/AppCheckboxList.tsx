import { useId, useMemo, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Field, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import type { AppCheckboxListProps } from "./AppCheckboxList.interface"

const AppCheckboxList = (props: AppCheckboxListProps) => {
    const {
        id,
        name,
        label = "Select",
        required = false,
        placeholder = "Select options",
        searchPlaceholder = "Search...",
        emptyMessage = "No results found.",
        values,
        options,
        disabled = false,
        isDisabled = false,
        isLoading = false,
        withoutMargin = false,
        onValuesChange,
        inputProps,
        triggerProps,
        classNames,
    } = props

    const generatedId = useId()
    const triggerId = id ?? `input-checkbox-list-${generatedId.replace(/:/g, "")}`

    const [open, setOpen] = useState(false)

    const resolvedDisabled = disabled || isDisabled || isLoading

    const selectedLabels = useMemo(
        () => options.filter((option) => values.includes(option.value)).map((option) => option.label),
        [options, values],
    )

    const displayValue = selectedLabels.length
        ? `${selectedLabels.length} selected`
        : placeholder

    const toggleValue = (optionValue: string) => {
        if (resolvedDisabled) {
            return
        }

        const nextValues = values.includes(optionValue)
            ? values.filter((value) => value !== optionValue)
            : [...values, optionValue]

        onValuesChange?.(nextValues)
    }

    return (
        <Field className={cn(withoutMargin ? "" : "mb-4", classNames?.field)}>
            <FieldLabel htmlFor={triggerId} className={cn(classNames?.label)}>
                {label}{required && <span className="text-destructive">*</span>}
            </FieldLabel>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={triggerId}
                        name={name}
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-required={required}
                        disabled={resolvedDisabled}
                        className={cn("w-full justify-between", classNames?.trigger)}
                        {...triggerProps}
                    >
                        <span className="truncate text-left">{displayValue}</span>
                        {isLoading ? <Spinner className="size-4 opacity-50" /> : <ChevronDownIcon className="size-4 opacity-50" />}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className={cn("w-(--radix-popover-trigger-width) p-0", classNames?.content)} align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} disabled={resolvedDisabled} {...inputProps} />
                        <CommandList className={cn(classNames?.list)}>
                            <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const checked = values.includes(option.value)

                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={`${option.label} ${option.value}`}
                                            disabled={resolvedDisabled}
                                            onSelect={() => toggleValue(option.value)}
                                            className="gap-2"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => toggleValue(option.value)}
                                                aria-label={option.label}
                                            />
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </Field>
    )
}

export default AppCheckboxList
