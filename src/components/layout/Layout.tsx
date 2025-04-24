import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { unreadCount, fetchUnreadCount } = useNotificationStore()

  // State for mobile menu and user menu
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const drawerWidth = 240

  // Fetch unread notifications count
  useEffect(() => {
    fetchUnreadCount()

    // Set up polling interval for notifications
    const interval = setInterval(fetchUnreadCount, 60000) // Every minute

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen !bg-gray-50">
      {/* Header/AppBar */}
      <header className="fixed top-0 left-0 right-0 !bg-blue-600 !text-white shadow-md z-50">
        <div className="flex items-center justify-between px-4 py-2 h-16">
          <div className="flex items-center">
            <button
              onClick={handleDrawerToggle}
              className="md:hidden p-2 rounded-md hover:!bg-blue-700 focus:outline-none"
              aria-label="open drawer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="hidden md:block text-xl font-semibold whitespace-nowrap ml-2 !text-white">
              Reservation System
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full hover:!bg-blue-700 focus:outline-none relative"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full !bg-red-500 !text-white text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full !bg-blue-500 !text-white font-medium !border-2 !border-white">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 !bg-white rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 !text-gray-800 hover:!bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full !bg-blue-500 !text-white font-medium mr-2">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                      Profile
                    </div>
                  </Link>

                  <div className="!border-t !border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 !text-gray-800 hover:!bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 !bg-black !bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDrawerToggle}
      ></div>

      <div
        className={`fixed top-0 left-0 bottom-0 w-64 !bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-center !border-b">
          <h2 className="text-xl font-semibold !text-gray-800">Reservation System</h2>
        </div>

        <nav className="mt-2">
          <Link
            to="/"
            className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          <Link
            to="/resources"
            className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Resources
          </Link>

          <Link
            to="/reservations"
            className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            My Reservations
          </Link>

          <Link
            to="/profile"
            className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </nav>
      </div>

      {/* Permanent Drawer for larger screens */}
      <div className="hidden md:block w-64 !bg-white shadow-lg">
        <div className="p-4 h-16 flex items-center justify-center !border-b">
          {/* Empty space to match the app bar height */}
        </div>

        <nav className="mt-2 pt-2">
          <Link to="/" className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100">
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          <Link to="/resources" className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100">
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Resources
          </Link>

          <Link to="/reservations" className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100">
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            My Reservations
          </Link>

          <Link to="/profile" className="flex items-center px-4 py-3 !text-gray-700 hover:!bg-gray-100">
            <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}