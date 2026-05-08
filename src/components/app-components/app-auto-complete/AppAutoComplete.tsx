import { useId, useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
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

import type { AppAutoCompleteProps } from "./AppAutoComplete.interface"

const AppAutoComplete = (props: AppAutoCompleteProps) => {
    const {
        id,
        name,
        label = "Select",
        required = false,
        placeholder = "Select an option",
        searchPlaceholder = "Search...",
        emptyMessage = "No results found.",
        value,
        options,
        disabled = false,
        isDisabled = false,
        isLoading = false,
        withoutMargin = false,
        onValueChange,
        inputProps,
        triggerProps,
        classNames,
    } = props

    const generatedId = useId()
    const triggerId = id ?? `input-autocomplete-${generatedId.replace(/:/g, "")}`

    const [open, setOpen] = useState(false)

    const resolvedDisabled = disabled || isDisabled || isLoading

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options, value],
    )

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
                        <span className="truncate text-left">
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        {isLoading ? <Spinner className="size-4 opacity-50" /> : <ChevronsUpDownIcon className="size-4 opacity-50" />}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className={cn("w-(--radix-popover-trigger-width) p-0", classNames?.content)} align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} disabled={resolvedDisabled} {...inputProps} />
                        <CommandList className={cn(classNames?.list)}>
                            <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        disabled={resolvedDisabled}
                                        onSelect={() => {
                                            const nextValue = option.value === value ? "" : option.value
                                            onValueChange?.(nextValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "size-4",
                                                value === option.value ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </Field>
    )
}

export default AppAutoComplete
