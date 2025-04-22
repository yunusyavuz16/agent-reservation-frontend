import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import DateRangeIcon from '@mui/icons-material/DateRange'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { format } from 'date-fns'

import { useAuthStore } from '../../../stores/authStore'
import { useReservationStore } from '../../../stores/reservationStore'
import { useResourceStore } from '../../../stores/resourceStore'
import { useNotificationStore } from '../../../stores/notificationStore'
import { Reservation, Resource, Notification } from '../../../types'

function Dashboard() {
  const { user } = useAuthStore()
  const { userReservations, fetchUserReservations, loading: reservationsLoading } = useReservationStore()
  const { resources, fetchResources, loading: resourcesLoading } = useResourceStore()
  const { notifications, fetchNotifications, loading: notificationsLoading } = useNotificationStore()

  const [recentReservations, setRecentReservations] = useState<Reservation[]>([])
  const [availableResources, setAvailableResources] = useState<Resource[]>([])
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetchUserReservations()
    fetchResources()
    fetchNotifications()
  }, [fetchUserReservations, fetchResources, fetchNotifications])

  // Set recent items when data is loaded
  useEffect(() => {
    // Sort reservations by start date and get the most recent ones
    const sortedReservations = [...userReservations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setRecentReservations(sortedReservations.slice(0, 3))

    // Get available resources
    const availableResourceList = resources.filter(r => r.isAvailable).slice(0, 3)
    setAvailableResources(availableResourceList)

    // Sort notifications by date and get the most recent ones
    const sortedNotifications = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setRecentNotifications(sortedNotifications.slice(0, 5))
  }, [userReservations, resources, notifications])

  const isLoading = reservationsLoading || resourcesLoading || notificationsLoading

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Get status color for reservation status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Cancelled':
        return 'error'
      default:
        return 'info'
    }
  }

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's an overview of your reservations and available resources.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Recent Reservations */}
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Your Recent Reservations</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {recentReservations.length > 0 ? (
                <>
                  {recentReservations.map(reservation => (
                    <Box
                      key={reservation.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {reservation.resourceName || 'Unnamed Resource'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {format(new Date(reservation.startTime), 'MMM d, yyyy h:mm a')} -
                        {format(new Date(reservation.endTime), 'h:mm a')}
                      </Typography>
                      <Chip
                        label={reservation.status}
                        color={getStatusColor(reservation.status) as any}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                      <Box sx={{ mt: 2 }}>
                        <Link to={`/reservations/${reservation.id}`} className="text-primary hover:underline">
                          View Details
                        </Link>
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ mt: 2 }}>
                    <Link to="/reservations" className="inline-block text-primary hover:underline">
                      View All Reservations
                    </Link>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    You have no recent reservations.
                  </Typography>
                  <Link to="/reservations/create" className="no-underline">
                    <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                      Create a Reservation
                    </Button>
                  </Link>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Available Resources */}
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventAvailableIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Available Resources</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {availableResources.length > 0 ? (
                <>
                  {availableResources.map(resource => (
                    <Box
                      key={resource.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {resource.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom noWrap>
                        {resource.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="primary">
                          {resource.location}
                        </Typography>
                        <Link to={`/resources/${resource.id}`} className="no-underline">
                          <Button variant="outlined" size="small">
                            Reserve
                          </Button>
                        </Link>
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ mt: 2 }}>
                    <Link to="/resources" className="inline-block text-primary hover:underline">
                      View All Resources
                    </Link>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    No resources available.
                  </Typography>
                  <Link to="/resources" className="no-underline">
                    <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                      Check All Resources
                    </Button>
                  </Link>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Notifications</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {recentNotifications.length > 0 ? (
                <>
                  {recentNotifications.map(notification => (
                    <Box
                      key={notification.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: notification.isRead ? 'background.paper' : 'action.hover',
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </Typography>
                        {notification.reservationId && (
                          <Link to={`/reservations/${notification.reservationId}`} className="text-primary hover:underline text-sm">
                            View Reservation
                          </Link>
                        )}
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ mt: 2 }}>
                    <Link to="/notifications" className="inline-block text-primary hover:underline">
                      View All Notifications
                    </Link>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1">
                    You have no new notifications.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default Dashboard