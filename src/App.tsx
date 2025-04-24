import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/layout/Layout'

// Pages
import { Login } from './components/pages/auth/Login'
import { Register } from './components/pages/auth/Register'
import { NotFound } from './components/pages/NotFound'

// Lazy loaded components for better performance
const Dashboard = React.lazy(() => import('./components/pages/dashboard/Dashboard'))
const ResourceList = React.lazy(() => import('./components/pages/resources/ResourceList'))
const ResourceDetail = React.lazy(() => import('./components/pages/resources/ResourceDetail'))
const ReservationList = React.lazy(() => import('./components/pages/reservations/ReservationList'))
const ReservationDetail = React.lazy(() => import('./components/pages/reservations/ReservationDetail'))
const CreateReservation = React.lazy(() => import('./components/pages/reservations/CreateReservation'))
const PaymentPage = React.lazy(() => import('./components/pages/payments/PaymentPage'))
const UserProfile = React.lazy(() => import('./components/pages/profile/UserProfile'))
const NotificationList = React.lazy(() => import('./components/pages/notifications/NotificationList'))

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectPath?: string
}

function App() {
  const { isAuthenticated, checkAuthStatus, loading } = useAuthStore()
  const location = useLocation()

  // Check auth status on app load and route changes
  useEffect(() => {
    // Log API base URL in development
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      console.log('API URL:', import.meta.env.VITE_API_URL)
    }

    checkAuthStatus()
  }, [checkAuthStatus])

  // Protected route component that redirects to login if not authenticated
  const ProtectedRoute = ({ children, redirectPath = '/login' }: ProtectedRouteProps) => {
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 !border-t-2 !border-b-2 !border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return <Navigate to={redirectPath} state={{ from: location }} replace />
    }

    return <>{children}</>
  }

  const LoadingFallback = () => (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 !border-t-2 !border-b-2 !border-blue-600"></div>
    </div>
  )

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/resources" element={
          <ProtectedRoute>
            <Layout>
              <ResourceList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/resources/:id" element={
          <ProtectedRoute>
            <Layout>
              <ResourceDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reservations" element={
          <ProtectedRoute>
            <Layout>
              <ReservationList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reservations/:id" element={
          <ProtectedRoute>
            <Layout>
              <ReservationDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reservations/create" element={
          <ProtectedRoute>
            <Layout>
              <CreateReservation />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/payment/:reservationId" element={
          <ProtectedRoute>
            <Layout>
              <PaymentPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <UserProfile />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout>
              <NotificationList />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Not found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  )
}

export default App
