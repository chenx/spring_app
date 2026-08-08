'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Posts to our own BFF route, not the Spring Boot backend directly.
      // The route sets an httpOnly session cookie; no token ever reaches this code.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setErrorMessage(data?.message || 'Invalid username or password.')
        return
      }

      setSuccessMessage(data?.message || 'Login successful!')

      router.push('/dashboard')
      // Forces the root layout (Server Component) to re-read the session cookie.
      router.refresh()
    } catch {
      setErrorMessage('Cannot connect to backend server.')
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" required />
        </div>

        <div>
          <label>Password:</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>

        <button type="submit">Log In</button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  )
}
