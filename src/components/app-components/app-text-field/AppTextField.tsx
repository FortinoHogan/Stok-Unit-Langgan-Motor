import type { ChangeEvent } from 'react'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { AppTextFieldProps } from './AppTextField.interface'

const AppTextField = (props: AppTextFieldProps) => {
    const { label, placeholder, type = "text", description, required = false, error, value, onChange, withoutMargin = false } = props
    return (
        <Field className={withoutMargin ? "" : "mb-5"} data-invalid={!!error}>
            <FieldLabel htmlFor="input-field-username">{label}</FieldLabel>
            <Input
                id="input-field-username"
                type={type}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onChange && onChange(event.target.value)}
                aria-invalid={!!error}
            />
            {error ? (
                <FieldDescription>{error}</FieldDescription>
            ) : description ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}
        </Field>
    )
}

export default AppTextField