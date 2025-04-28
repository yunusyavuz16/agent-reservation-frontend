import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useReservationStore } from '../../../stores/reservationStore';
import { Reservation, Resource } from '../../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    fetchUpcomingReservations,
    upcomingReservations = [],
    loading,
    error
  } = useReservationStore();

  const [recentActivity, setRecentActivity] = useState<Reservation[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const loadDashboardData = async () => {
    try {
      await fetchUpcomingReservations();
    } catch (error: any) {
      console.error('Error fetching upcoming reservations:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [fetchUpcomingReservations, retryCount]);

  useEffect(() => {
    if (upcomingReservations?.length > 0) {
      setRecentActivity(upcomingReservations.slice(0, 3));
      setRecentReservations(upcomingReservations.slice(0, 5));
    }
  }, [upcomingReservations]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return '!bg-green-100 !text-green-800';
      case 'Pending':
        return '!bg-yellow-100 !text-yellow-800';
      case 'Cancelled':
        return '!bg-red-100 !text-red-800';
      default:
        return '!bg-blue-100 !text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Pending':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 !border-t-2 !border-b-2 !border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-6 p-4 !bg-red-50 !border !border-red-200 !text-red-800 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-start">
            <svg className="w-5 h-5 !text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Authentication Error</p>
              <p className="text-sm mt-1">Your session might have expired. Please try again or refresh the page.</p>
            </div>
          </div>
          <button
            className="ml-4 !bg-red-700 hover:!bg-red-800 !text-white px-4 py-2 text-sm rounded-md flex items-center transition-colors"
            onClick={handleRetry}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold !text-gray-800 mb-1.5">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="!text-gray-600">
            Here's an overview of your reservations and activity
          </p>
        </div>
        <button
          onClick={() => navigate('/reservations/create')}
          className="!bg-blue-600 hover:!bg-blue-700 !text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center whitespace-nowrap"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Reservation
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Reservations Card - Takes 2/3 of space on large screens */}
        <div className="!bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 lg:col-span-2">
          <div className="flex items-center justify-between p-5 !border-b !border-gray-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 !text-blue-600 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-semibold !text-gray-800">Upcoming Reservations</h2>
            </div>
            <Link to="/reservations" className="text-sm font-medium !text-blue-600 hover:!text-blue-800 hover:underline flex items-center">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="p-5">
            {recentReservations.length > 0 ? (
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 !bg-gray-50 rounded-lg hover:!bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-medium !text-gray-800 mb-1 flex items-center">
                          {reservation.resourceName || 'Unnamed Resource'}
                        </h3>
                        <p className="!text-gray-600 text-sm mb-1.5 flex items-center">
                          <svg className="w-4 h-4 mr-1.5 !text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(reservation.startTime)}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/reservations/${reservation.id}`}
                        className="!px-4 !py-2 !border !border-blue-600 !text-blue-600 hover:!bg-blue-50 font-medium rounded-lg text-sm inline-flex items-center transition-colors whitespace-nowrap"
                      >
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 !bg-gray-50 rounded-lg">
                <svg className="w-16 h-16 !text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="!text-gray-600 mb-4">
                  You don't have any upcoming reservations.
                </p>
                <Link to="/reservations/create" className="no-underline">
                  <button className="!bg-blue-600 hover:!bg-blue-700 !text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Create Your First Reservation
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card - Takes 1/3 of space on large screens */}
        <div className="!bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
          <div className="flex items-center p-5 !border-b !border-gray-100">
            <svg className="w-5 h-5 !text-blue-600 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-lg font-semibold !text-gray-800">Quick Actions</h2>
          </div>

          <div className="p-5 space-y-4">
            <button
              onClick={() => navigate('/reservations/create')}
              className="w-full py-3 px-4 !bg-white hover:!bg-gray-50 !border !border-gray-200 rounded-lg flex items-center transition-colors"
            >
              <div className="w-9 h-9 !bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium !text-gray-800">New Reservation</p>
                <p className="text-sm !text-gray-500">Book a resource now</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/resources')}
              className="w-full py-3 px-4 !bg-white hover:!bg-gray-50 !border !border-gray-200 rounded-lg flex items-center transition-colors"
            >
              <div className="w-9 h-9 !bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 !text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium !text-gray-800">Browse Resources</p>
                <p className="text-sm !text-gray-500">View available resources</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="w-full py-3 px-4 !bg-white hover:!bg-gray-50 !border !border-gray-200 rounded-lg flex items-center transition-colors"
            >
              <div className="w-9 h-9 !bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 !text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium !text-gray-800">My Profile</p>
                <p className="text-sm !text-gray-500">Manage your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Help & Tips Section */}
      <div className="!bg-blue-50 !border !border-blue-100 rounded-lg p-5 mb-8">
        <div className="flex items-start">
          <div className="!bg-blue-100 rounded-full p-2 mr-4">
            <svg className="w-6 h-6 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold !text-gray-800 mb-2">Need Help?</h3>
            <p className="!text-gray-700 mb-3">
              Need assistance with your reservations? Here are some useful tips:
            </p>
            <ul className="!text-gray-700 text-sm list-disc list-inside space-y-1 mb-3">
              <li>You can view all your upcoming reservations in the "My Reservations" section</li>
              <li>To modify a reservation, open it and click on the "Edit" button</li>
              <li>Contact support if you have any questions or issues</li>
            </ul>
            <button className="!text-blue-700 hover:underline text-sm font-medium flex items-center">
              Learn more
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;