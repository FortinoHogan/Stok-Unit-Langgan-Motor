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
    const [searchValue, setSearchValue] = useState("")

    const resolvedDisabled = disabled || isDisabled || isLoading

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options, value],
    )

    const displayOptions = useMemo(() => {
        const normalizedSearchValue = searchValue.trim().toLowerCase()
        const allOption = options.find((option) => {
            const normalizedLabel = option.label.trim().toLowerCase()
            const normalizedValue = option.value.trim().toLowerCase()

            return normalizedLabel === "all" || normalizedValue === "all"
        })

        const optionsWithoutAll = allOption
            ? options.filter((option) => option.value !== allOption.value)
            : options

        if (!normalizedSearchValue) {
            return allOption ? [allOption, ...optionsWithoutAll] : optionsWithoutAll
        }

        const filteredOptions = optionsWithoutAll.filter((option) => {
            const normalizedLabel = option.label.toLowerCase()
            const normalizedValue = option.value.toLowerCase()

            return normalizedLabel.includes(normalizedSearchValue)
                || normalizedValue.includes(normalizedSearchValue)
        })

        return allOption ? [allOption, ...filteredOptions] : filteredOptions
    }, [options, searchValue])

    return (
        <Field className={cn(withoutMargin ? "" : "mb-4", classNames?.field)}>
            <FieldLabel htmlFor={triggerId} className={cn(classNames?.label)}>
                {label}{required && <span className="text-destructive">*</span>}
            </FieldLabel>

            <Popover
                open={open}
                onOpenChange={(isOpen) => {
                    setOpen(isOpen)

                    if (!isOpen) {
                        setSearchValue("")
                    }
                }}
            >
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
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            disabled={resolvedDisabled}
                            value={searchValue}
                            onValueChange={(nextValue) => {
                                setSearchValue(nextValue)
                                inputProps?.onValueChange?.(nextValue)
                            }}
                            {...inputProps}
                        />
                        <CommandList className={cn(classNames?.list)}>
                            <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {displayOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        disabled={resolvedDisabled}
                                        className="cursor-pointer"
                                        onSelect={() => {
                                            const nextValue = option.value === value ? "" : option.value
                                            onValueChange?.(nextValue)
                                            setOpen(false)
                                            setSearchValue("")
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
