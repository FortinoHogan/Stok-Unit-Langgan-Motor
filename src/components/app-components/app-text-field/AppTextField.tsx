import { useId, useState, type ChangeEvent, type FocusEvent, type InvalidEvent } from 'react'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { AppTextFieldProps } from './AppTextField.interface'

const AppTextField = (props: AppTextFieldProps) => {
    const {
        label,
        id,
        name,
        placeholder,
        type = "text",
        description,
        required = false,
        requiredMessage,
        error,
        value,
        onChange,
        withoutMargin = false,
        isUppercase = false,
        isDisabled = false,
    } = props
    const generatedId = useId()
    const inputId = id ?? `input-field-${generatedId.replace(/:/g, "")}`
    const [validationError, setValidationError] = useState("")

    const getRequiredError = (nextValue?: string) => {
        if (!required) {
            return ""
        }

        return nextValue?.trim()
            ? ""
            : requiredMessage ?? `${label} is required.`
    }

    const resolvedError = error || validationError

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value
        const nextValue = isUppercase ? rawValue.toUpperCase() : rawValue

        if (validationError) {
            setValidationError(getRequiredError(nextValue))
        }

        onChange?.(nextValue)
    }

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        setValidationError(getRequiredError(event.target.value))
    }

    const handleInvalid = (event: InvalidEvent<HTMLInputElement>) => {
        event.preventDefault()
        setValidationError(getRequiredError(event.currentTarget.value))
    }

    return (
        <Field className={withoutMargin ? "" : "mb-5"} data-invalid={!!resolvedError}>
            <FieldLabel htmlFor={inputId}>{label}{required && <span className="text-destructive">*</span>}</FieldLabel>
            <Input
                id={inputId}
                name={name}
                type={type}
                placeholder={placeholder}
                required={required}
                value={value}
                disabled={isDisabled}
                onChange={handleChange}
                onBlur={handleBlur}
                onInvalid={handleInvalid}
                aria-invalid={!!resolvedError}
                aria-required={required}
            />
            {resolvedError ? (
                <FieldDescription className="text-destructive">{resolvedError}</FieldDescription>
            ) : description ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}
        </Field>
    )
}

export default AppTextField