import { useState } from 'react'
import { Emblem } from '@/components/ui/BrandMark'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { adminApi } from './adminApi'

export default function Login({ onLoggedIn, notice }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      onLoggedIn(await adminApi.login(email.trim(), password))
    } catch (err) {
      setError(err.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : err.message)
      setBusy(false)
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <Emblem size={96} />
        <h1>Owner sign in</h1>
        {notice ? <p className="admin-note" role="status">{notice}</p> : null}
        <Field label="Email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="form-alert" role="alert">{error}</p> : null}
        <Button type="submit" disabled={busy || !email || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}
