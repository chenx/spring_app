import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ADDED REQUEST INTERCEPTOR TO AUTOMATICALLY ATTACH THE JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      // Must use capital B and exactly one space before the token string
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 1. Check if the server explicitly rejected the token with a 401 Unauthorized status
    if (error.response && error.response.status === 401) {
      // Clear out the invalid token data cache immediately
      localStorage.removeItem('token')

      // Redirect the user back to the login view page safely
      router.navigate('/login')

      // Return a clean customized error reject message
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    const message = error.response?.data?.message || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default api
