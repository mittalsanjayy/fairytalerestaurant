import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

/**
 * Premium button. Renders the right element for the job:
 *   <Button to="/x">      -> client-side route link
 *   <Button href="...">   -> anchor (external links open safely in a new tab)
 *   <Button onClick>      -> <button type="button"> (pass type="submit" for forms)
 */
const Button = forwardRef(function Button(
  { variant = 'gold', size = 'md', to, href, icon, className = '', children, ...rest },
  ref,
) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ')

  const content = (
    <>
      <span className="btn__label">{children}</span>
      {icon ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (href) {
    const external = /^https?:\/\//i.test(href)
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return (
    <button ref={ref} type="button" className={classes} {...rest}>
      {content}
    </button>
  )
})

export default Button
