import axios from 'axios'

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5120/api',
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
    // Log errors in development environment
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      console.error('API Error:', error);
    }

    // Handle authentication errors ONLY if not on dashboard or reservation pages
    if (error.response?.status === 401) {
      // Get current URL path
      const currentPath = window.location.pathname;

      // Never redirect for dashboard-related pages - they should handle their own errors
      const isDashboardOrReservationPage =
        currentPath.startsWith('/dashboard') ||
        currentPath.startsWith('/reservations') ||
        currentPath === '/';

      // Don't redirect if we're on a dashboard/reservation page or login-related page
      const shouldRedirect = !isDashboardOrReservationPage &&
        !['/login', '/register', '/forgot-password'].includes(currentPath);

      // Clear auth storage and redirect ONLY if we should redirect
      if (shouldRedirect) {
        // Clear auth state
        localStorage.removeItem('auth-storage');
        // Redirect to login page
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api