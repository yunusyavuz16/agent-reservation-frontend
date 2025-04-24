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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await fetchUpcomingReservations();
      } catch (error) {
        console.error('Error fetching upcoming reservations:', error);
      }
    };

    loadDashboardData();
  }, [fetchUpcomingReservations]);

  useEffect(() => {
    if (upcomingReservations?.length > 0) {
      setRecentActivity(upcomingReservations.slice(0, 3));
      setRecentReservations(upcomingReservations.slice(0, 5));
    }
  }, [upcomingReservations]);

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

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 !border-t-2 !border-b-2 !border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-4 !bg-red-100 !text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold !text-gray-800 mb-1">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="!text-gray-600">
            Here's an overview of your reservations and recent activity
          </p>
        </div>
        <button
          onClick={() => navigate('/resources')}
          className="!bg-blue-600 hover:!bg-blue-700 !text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Make New Reservation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="!bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 !text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold">Recent Reservations</h2>
          </div>
          <div className="!border-t !border-gray-200 mb-4"></div>

          {recentReservations.length > 0 ? (
            <>
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="mb-4 p-4 !bg-gray-50 rounded-lg"
                >
                  <h3 className="text-lg font-medium mb-1">
                    {reservation.resourceName || 'Unnamed Resource'}
                  </h3>
                  <p className="!text-gray-600 text-sm mb-2">
                    {formatDate(reservation.startTime)}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                  <div className="mt-3">
                    <Link
                      to={`/reservations/${reservation.id}`}
                      className="!text-blue-600 hover:!text-blue-800 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <Link
                  to="/reservations"
                  className="!text-blue-600 hover:!text-blue-800 hover:underline"
                >
                  View All Reservations
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="!text-gray-600 mb-4">
                You have no recent reservations.
              </p>
              <Link to="/reservations/create" className="no-underline">
                <button className="!bg-blue-600 hover:!bg-blue-700 !text-white font-medium py-2 px-4 rounded-lg">
                  Create a Reservation
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Available Resources */}
        <div className="!bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 !text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-lg font-semibold">Available Resources</h2>
          </div>
          <div className="!border-t !border-gray-200 mb-4"></div>

          {availableResources.length > 0 ? (
            <>
              {availableResources.map((resource) => (
                <div
                  key={resource.id}
                  className="mb-4 p-4 !bg-gray-50 rounded-lg"
                >
                  <h3 className="text-lg font-medium mb-1">
                    {resource.name}
                  </h3>
                  <p className="!text-gray-600 text-sm mb-2 truncate">
                    {resource.description}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="!text-blue-600">{resource.location}</span>
                    <Link to={`/resources/${resource.id}`} className="no-underline">
                      <button className="!border !border-blue-600 !text-blue-600 hover:!bg-blue-50 font-medium py-1 px-3 rounded-lg text-sm">
                        Reserve
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="!text-gray-600">
                No resources available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;