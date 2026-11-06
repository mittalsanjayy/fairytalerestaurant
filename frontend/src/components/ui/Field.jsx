import { useId } from 'react'
import './Field.css'

/**
 * Accessible form field: visible label, hint, and an error announced to screen readers.
 *   <Field label="Name" name="name" value={...} onChange={...} error={errors.name} required />
 *   <Field as="select" ...><option/></Field>      <Field as="textarea" rows={4} ... />
 */
export default function Field({
  as: Control = 'input',
  label,
  name,
  error,
  hint,
  required = false,
  optional = false,
  className = '',
  children,
  ...rest
}) {
  const uid = useId()
  const id = `${uid}-${name}`
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? <span className="field__req" aria-hidden="true"> *</span> : null}
        {optional ? <span className="field__opt"> (optional)</span> : null}
      </label>
      <Control
        id={id}
        name={name}
        className={`field__control field__control--${Control}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        {...rest}
      >
        {children}
      </Control>
      {hint && !error ? (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
