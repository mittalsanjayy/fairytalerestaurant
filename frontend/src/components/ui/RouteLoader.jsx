import './States.css'

/** Shown while a lazily loaded route is downloading. Not the cinematic intro (Phase 2). */
export default function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="route-loader__ring" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
