import React, { useEffect, useState } from 'react'
import { useNotificationStore } from '../../../stores/notificationStore'
import { formatDistanceToNow } from 'date-fns'

// Define Notification interface
interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

const NotificationList: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore()

  const [isMarkingAll, setIsMarkingAll] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true)
    try {
      await markAllAsRead()
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id)
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Reservation':
        return (
          <svg className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'Confirmation':
        return (
          <svg className="w-5 h-5 !text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'Payment':
        return (
          <svg className="w-5 h-5 !text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 !border-t-2 !border-b-2 !border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      <div className="!bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="relative">
              <svg className="w-6 h-6 !text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 !bg-red-500 !text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold ml-2">
              Notifications
            </h1>
          </div>

          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll || notifications.every(n => n.isRead)}
            className="px-3 py-1 text-sm !border !border-blue-600 !text-blue-600 rounded-md hover:!bg-blue-50 transition-colors duration-200 focus:outline-none disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 !bg-red-100 !text-red-800 rounded-lg !border !border-red-200">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-16 h-16 !text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-xl font-semibold !text-gray-700 mb-2">
              No notifications yet
            </h2>
            <p className="!text-gray-500">
              You don't have any notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="!bg-white rounded-lg">
            {notifications.map((notification: Notification, index: number) => (
              <React.Fragment key={notification.id}>
                <div className={`p-4 flex items-start ${notification.isRead ? '!bg-white' : '!bg-blue-50'} rounded-lg mb-1`}>
                  <div className="mr-4 relative">
                    <div className="w-10 h-10 rounded-full !bg-gray-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className={`text-base ${notification.isRead ? 'font-medium' : 'font-bold'} !text-gray-800`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm !text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 !text-gray-600">
                      {notification.message}
                    </p>
                    {notification.actionUrl && (
                      <a href={notification.actionUrl} className="text-sm !text-blue-600 hover:underline mt-2 inline-block">
                        View details
                      </a>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`ml-4 text-sm hover:underline ${
                          notification.isRead
                            ? '!text-green-500 cursor-default'
                            : '!text-gray-400 hover:!text-gray-600'
                        }`}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                {index < notifications.length - 1 && <div className="!border-b !border-gray-100 mx-4"></div>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationList