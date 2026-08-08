import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import axios from 'axios'
import 'antd/dist/reset.css'
import './index.css'
import router from './router'

// Configure Axios Interceptor globally
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('main.tsx token: ', token)

    // If a token exists in local storage, inject it into the HTTP Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      // config.headers['Authorization'] = 'Basic ' + btoa('user:password')
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
