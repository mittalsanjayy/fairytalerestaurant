import './GoldDivider.css'

/** Thin gold rule with a centred diamond ornament. Decorative only. */
export default function GoldDivider({ className = '' }) {
  return (
    <div className={`gold-divider ${className}`.trim()} aria-hidden="true">
      <span className="gold-divider__line" />
      <svg className="gold-divider__gem" width="12" height="12" viewBox="0 0 12 12">
        <path d="M6 0.5 11.5 6 6 11.5 0.5 6z" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M6 3.4 8.6 6 6 8.6 3.4 6z" fill="currentColor" />
      </svg>
      <span className="gold-divider__line" />
    </div>
  )
}
