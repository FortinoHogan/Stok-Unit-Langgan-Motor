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

    const groupedOptions = useMemo(() => {
        const groupedMap = options.reduce((accumulator, option) => {
            const groupName = option.group || "Options"
            const previous = accumulator.get(groupName) || []

            accumulator.set(groupName, [...previous, option])
            return accumulator
        }, new Map<string, typeof options>())

        return Array.from(groupedMap.entries()).map(([groupName, groupOptions]) => ({
            groupName,
            options: groupOptions,
        }))
    }, [options])

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

    const toggleGroupValues = (groupOptionValues: string[]) => {
        if (resolvedDisabled) {
            return
        }

        const isAllChecked = groupOptionValues.every((optionValue) => values.includes(optionValue))

        if (isAllChecked) {
            const nextValues = values.filter((value) => !groupOptionValues.includes(value))
            onValuesChange?.(nextValues)
            return
        }

        const nextValues = [...new Set([...values, ...groupOptionValues])]
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

                <PopoverContent className={cn("w-(--radix-popover-trigger-width) max-h-80 overflow-hidden p-0 touch-pan-y", classNames?.content)} align="start">
                    <Command
                        className="max-h-80"
                        filter={(value, search, keywords) => {
                            const queryList = search
                                .toLowerCase()
                                .trim()
                                .split(/\s+/)
                                .filter(Boolean)

                            if (!queryList.length) {
                                return 1
                            }

                            const searchableText = `${value} ${(keywords || []).join(" ")}`.toLowerCase()
                            return queryList.every((query) => searchableText.includes(query)) ? 1 : 0
                        }}
                    >
                        <CommandInput placeholder={searchPlaceholder} disabled={resolvedDisabled} {...inputProps} />
                        <CommandList
                            className={cn("max-h-64 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]", classNames?.list)}
                            onWheel={(event) => {
                                event.stopPropagation()
                            }}
                            onTouchMove={(event) => {
                                event.stopPropagation()
                            }}
                        >
                            <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
                            {groupedOptions.map((group) => (
                                <CommandGroup key={group.groupName} heading={group.groupName === "Options" ? undefined : group.groupName}>
                                    <CommandItem
                                        value={`select all ${group.groupName}`}
                                        keywords={[group.groupName, "select", "all"]}
                                        disabled={resolvedDisabled}
                                        onSelect={() => toggleGroupValues(group.options.map((option) => option.value))}
                                        className="gap-2 font-medium"
                                    >
                                        <Checkbox
                                            checked={(() => {
                                                const groupOptionValues = group.options.map((option) => option.value)
                                                const checkedCount = groupOptionValues.filter((optionValue) => values.includes(optionValue)).length

                                                if (!checkedCount) {
                                                    return false
                                                }

                                                if (checkedCount === groupOptionValues.length) {
                                                    return true
                                                }

                                                return "indeterminate"
                                            })()}
                                            onCheckedChange={() => toggleGroupValues(group.options.map((option) => option.value))}
                                            aria-label={group.groupName === "Options" ? "Select all options" : `Select all ${group.groupName}`}
                                        />
                                        <span>
                                            {group.groupName === "Options"
                                                ? "Select all"
                                                : `Select all ${group.groupName}`}
                                        </span>
                                    </CommandItem>
                                    {group.options.map((option) => {
                                        const checked = values.includes(option.value)

                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={option.label}
                                                keywords={[group.groupName]}
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
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </Field>
    )
}

export default AppCheckboxList
