import './SectionHeading.css'

/**
 * Consistent section opener: gold eyebrow + serif display title + optional lead.
 * `as` lets the page choose the correct heading level for accessibility.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
  id,
  className = '',
}) {
  return (
    <header className={`section-heading section-heading--${align} ${className}`.trim()}>
      {eyebrow ? (
        <span className={`eyebrow ${align === 'center' ? 'eyebrow--center' : ''}`.trim()}>
          {eyebrow}
        </span>
      ) : null}
      <Tag id={id} className="section-heading__title">
        {title}
      </Tag>
      {lead ? <p className="lead section-heading__lead">{lead}</p> : null}
    </header>
  )
}
