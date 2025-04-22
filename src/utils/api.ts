import axios from 'axios'

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5120/api',
})

// Add request interceptor to set authorization header on every request
api.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token
      : null

    // If token exists, add it to the headers
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle common error scenarios
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear auth state if needed
      localStorage.removeItem('auth-storage')
      // You could also redirect to login page here if needed
      window.location.href = '/login'
    }

    // Log errors in development environment
    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      console.error('API Error:', error)
    }

    return Promise.reject(error)
  }
)

export default api