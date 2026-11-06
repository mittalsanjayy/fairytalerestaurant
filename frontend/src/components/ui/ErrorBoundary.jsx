import { Component } from 'react'
import { Emblem } from './BrandMark'
import './States.css'

/** Catches render errors so a bug never leaves the visitor with a blank screen. */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('UI error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="state-screen" role="alert">
        <div className="state-screen__inner">
          <Emblem size={64} />
          <h1>Something went wrong</h1>
          <p className="lead">
            We hit an unexpected problem. Please refresh the page, or call us and we will be happy
            to help.
          </p>
          <div className="state-screen__actions">
            <button
              type="button"
              className="btn btn--gold btn--md"
              onClick={() => window.location.reload()}
            >
              <span className="btn__label">Refresh page</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
}
