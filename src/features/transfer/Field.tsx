import type {
  ComponentProps,
  ReactElement,
  ReactNode,
} from 'react'
import { useFormContext } from 'react-hook-form'
import type { TransferFormValues } from './transferSchema'

type FieldName = keyof TransferFormValues

// Everything that ties an input to its error, for screen readers.
export function useFieldError(name: FieldName) {
  const { formState } = useFormContext<TransferFormValues>()
  const message = formState.errors[name]?.message
  const errorId = `${name}-error`

  return {
    message,
    errorId,
    inputProps: {
      'aria-invalid': message ? true : undefined,
      'aria-describedby': message ? errorId : undefined,
    },
  }
}

interface FieldErrorProps {
  id: string
  message?: string
}

export function FieldError({ id, message }: FieldErrorProps): ReactElement | null {
  if (!message) return null
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  )
}

interface TextFieldProps extends ComponentProps<'input'> {
  name: FieldName
  label: string
  hint?: ReactNode
}

export function TextField({ name, label, hint, ...inputProps }: TextFieldProps) {
  const { register } = useFormContext<TransferFormValues>()
  const error = useFieldError(name)

  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={name}>{label}</label>
        {hint}
      </div>
      <input
        id={name}
        type="text"
        {...inputProps}
        {...error.inputProps}
        {...register(name)}
      />
      <FieldError id={error.errorId} message={error.message} />
    </div>
  )
}