import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { unreadCount, fetchUnreadCount } = useNotificationStore()

  // State for mobile menu and user menu
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Fetch unread notifications count
  useEffect(() => {
    fetchUnreadCount()

    // Set up polling interval for notifications
    const interval = setInterval(fetchUnreadCount, 60000) // Every minute

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
    // Close user menu when mobile menu is toggled
    if (userMenuOpen) setUserMenuOpen(false)
  }

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
    navigate('/login')
  }

  // Check if a nav link is active
  const isActiveLink = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  // Navigation items for reuse
  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/resources',
      label: 'Resources',
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      path: '/reservations',
      label: 'My Reservations',
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  return (
    <div className="flex min-h-screen !bg-gray-50">
      {/* Header/AppBar */}
      <header className="fixed top-0 left-0 right-0 !bg-blue-600 !text-white shadow-md z-50">
        <div className="flex items-center justify-between px-4 py-2 h-16">
          <div className="flex items-center">
            <button
              onClick={handleDrawerToggle}
              className="md:hidden p-2 rounded-md hover:!bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <Link to="/" className="flex items-center no-underline text-white">
              <svg className="h-8 w-8 !text-white hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h1 className="text-xl font-semibold whitespace-nowrap ml-2 !text-white">
                Reservation System
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={() => navigate('/reservations/create')}
              className="hidden sm:flex items-center p-2 !bg-blue-500 hover:!bg-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Create a new reservation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="ml-2 hidden md:inline">New Reservation</span>
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full hover:!bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 relative"
              aria-label="Notifications"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full !bg-red-500 !text-white text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.firstName || 'User'}
                    className="w-8 h-8 rounded-full object-cover !border-2 !border-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full !bg-blue-500 !text-white font-medium !border-2 !border-white flex items-center justify-center">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="ml-2 hidden sm:inline-block !text-white font-medium">{user?.firstName || 'User'}</span>
                <svg className="h-5 w-5 ml-1 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 !bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-3 !border-b !border-gray-100">
                    <p className="text-sm !text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium !text-gray-800 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    className="block px-4 py-2 !text-gray-800 hover:!bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Your Profile
                    </div>
                  </Link>

                  <Link
                    to="/reservations"
                    className="block px-4 py-2 !text-gray-800 hover:!bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-3 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Your Reservations
                    </div>
                  </Link>

                  <div className="!border-t !border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 !text-gray-800 hover:!bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center !text-red-600">
                      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 !bg-black !bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDrawerToggle}
        aria-hidden="true"
      ></div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 !bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile menu"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 flex items-center justify-between !border-b">
          <h2 className="text-xl font-semibold !text-gray-800">Reservation System</h2>
          <button
            onClick={handleDrawerToggle}
            className="p-2 rounded-md hover:!bg-gray-100 focus:outline-none"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info in mobile menu */}
        <div className="px-4 py-4 !border-b !border-gray-100">
          <div className="flex items-center">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full !bg-blue-600 !text-white font-medium flex items-center justify-center">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="ml-3">
              <p className="font-medium !text-gray-800">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm !text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="mt-2 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 ${
                isActiveLink(item.path)
                  ? '!bg-blue-50 !text-blue-700 font-medium'
                  : '!text-gray-700 hover:!bg-gray-100'
              } transition-colors`}
              onClick={() => setMobileOpen(false)}
              aria-current={isActiveLink(item.path) ? 'page' : undefined}
            >
              {React.cloneElement(item.icon, {
                className: `h-5 w-5 mr-3 ${isActiveLink(item.path) ? '!text-blue-600' : '!text-gray-500'}`
              })}
              {item.label}
            </Link>
          ))}

          {/* Quick action in mobile menu */}
          <div className="!border-t !border-gray-100 my-2 px-4 py-4">
            <button
              onClick={() => {
                navigate('/reservations/create');
                setMobileOpen(false);
              }}
              className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Reservation
            </button>
          </div>
        </nav>

        {/* Logout option in mobile menu */}
        <div className="absolute bottom-0 left-0 right-0 !border-t !border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 !text-red-600 hover:!bg-red-50 rounded-lg transition-colors"
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Permanent Drawer for larger screens */}
      <div className="hidden md:block w-64 !bg-white shadow-lg fixed top-0 left-0 bottom-0 z-30">
        <div className="p-4 h-16 flex items-center justify-center !border-b">
          {/* Empty space to match the app bar height */}
        </div>

        <nav className="mt-2 pt-2 overflow-y-auto max-h-[calc(100vh-72px)]">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 ${
                isActiveLink(item.path)
                  ? '!bg-blue-50 !text-blue-700 font-medium'
                  : '!text-gray-700 hover:!bg-gray-100'
              } transition-colors`}
              aria-current={isActiveLink(item.path) ? 'page' : undefined}
            >
              {React.cloneElement(item.icon, {
                className: `h-5 w-5 mr-3 ${isActiveLink(item.path) ? '!text-blue-600' : '!text-gray-500'}`
              })}
              {item.label}
            </Link>
          ))}

          {/* Create Reservation Button */}
          <div className="px-4 pt-6 pb-4">
            <button
              onClick={() => navigate('/reservations/create')}
              className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Reservation
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}