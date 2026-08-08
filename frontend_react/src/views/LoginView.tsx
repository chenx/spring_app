import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function LoginView() {
  const navigate = useNavigate() // Initialize the router hook
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      })
      console.log(response)
      setSuccessMessage(response.data) // "Login successful!"

      // Save token if your backend sends one (e.g., JWT)
      localStorage.setItem('token', response.data.token)
      console.log('token: ', response.data.token) // token: undefined

      // Redirect to the protected dashboard page
      navigate('/dashboard')
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data || 'Invalid username or password.')
      } else {
        setErrorMessage('Cannot connect to backend server.')
      }
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

      {/* Feedback messages */}
      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  )
}

export default LoginView
