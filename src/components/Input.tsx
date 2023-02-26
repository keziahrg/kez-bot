import { forwardRef, HTMLInputTypeAttribute } from 'react'

interface InputProps {
    label: string
    placeholder: string
    id: string
    name: string
    type: HTMLInputTypeAttribute
    disabled?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, placeholder, id, name, type, disabled }: InputProps, ref) => (
        <>
            <label className="sr-only" htmlFor={id}>
                {label}
            </label>
            <input
                disabled={disabled}
                ref={ref}
                autoComplete="off"
                className="w-full appearance-none rounded-3xl border-2 bg-grey-light py-4 pr-12 pl-4 dark:border-white dark:bg-grey-dark"
                placeholder={placeholder}
                id={id}
                name={name}
                type={type}
            />
        </>
    )
)

Input.displayName = 'Input'
