import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

// MUI Components
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';

// Icons
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DateRangeIcon from '@mui/icons-material/DateRange';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth.token) return;

      setLoading(true);
      setError(null);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        };

        // Fetch recent reservations
        const reservationsResponse = await axios.get(
          'http://localhost:5000/api/Reservation/recent',
          config
        );

        // Fetch available resources
        const resourcesResponse = await axios.get(
          'http://localhost:5000/api/Resource',
          config
        );

        // Fetch recent notifications
        const notificationsResponse = await axios.get(
          'http://localhost:5000/api/Notification',
          config
        );

        setReservations(reservationsResponse.data.slice(0, 3));
        setResources(resourcesResponse.data.slice(0, 3));
        setNotifications(notificationsResponse.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error loading dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth.token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 4, color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <div className="dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {auth.user?.firstName || 'User'}!
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

              {reservations.length > 0 ? (
                <>
                  {reservations.map(reservation => (
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
                        {new Date(reservation.startTime).toLocaleDateString()} - {new Date(reservation.endTime).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor:
                            reservation.status === 'Confirmed' ? 'success.light' :
                            reservation.status === 'Pending' ? 'warning.light' :
                            reservation.status === 'Cancelled' ? 'error.light' : 'info.light',
                          color:
                            reservation.status === 'Confirmed' ? 'success.dark' :
                            reservation.status === 'Pending' ? 'warning.dark' :
                            reservation.status === 'Cancelled' ? 'error.dark' : 'info.dark',
                        }}
                      >
                        {reservation.status}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
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
                  <Link to="/reservations/create">
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

              {resources.length > 0 ? (
                <>
                  {resources.map(resource => (
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
                        <Link to={`/resources/${resource.id}`}>
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
                  <Link to="/resources">
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

              {notifications.length > 0 ? (
                <>
                  {notifications.map(notification => (
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
                          {new Date(notification.createdAt).toLocaleString()}
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
  );
};

export default Dashboard;