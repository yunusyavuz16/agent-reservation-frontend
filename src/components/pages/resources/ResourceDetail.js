import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { format } from 'date-fns';

// MUI Components
import {
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert
} from '@mui/material';

// MUI Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const ResourceDetail = () => {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);

  // Fetch resource and related data
  useEffect(() => {
    const fetchResourceData = async () => {
      setLoading(true);
      setError(null);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        };

        // Fetch resource details
        const resourceResponse = await axios.get(
          `http://localhost:5000/api/Resource/${id}`,
          config
        );

        setResource(resourceResponse.data);

        // Fetch resource reviews
        const reviewsResponse = await axios.get(
          `http://localhost:5000/api/Review/Resource/${id}`,
          config
        );

        setReviews(reviewsResponse.data);

        // Fetch recent reservations for this resource to show availability
        const reservationsResponse = await axios.get(
          `http://localhost:5000/api/Reservation/Resource/${id}/upcoming`,
          config
        );

        setRecentReservations(reservationsResponse.data);
      } catch (err) {
        console.error('Error fetching resource data:', err);
        setError('Failed to load resource details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [id, auth.token]);

  const handleReserve = () => {
    navigate(`/reservations/create?resourceId=${id}`);
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

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

  if (!resource) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6">Resource not found.</Typography>
        <Button
          component={Link}
          to="/resources"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          View All Resources
        </Button>
      </Box>
    );
  }

  return (
    <div className="resource-detail">
      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          component={Link}
          to="/resources"
          startIcon={<EventIcon />}
        >
          Back to Resources
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Resource details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={resource.imageUrl || 'https://via.placeholder.com/800x300?text=Resource+Image'}
              alt={resource.name}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  {resource.name}
                </Typography>
                <Chip
                  icon={<EventAvailableIcon />}
                  label={resource.isAvailable ? 'Available' : 'Unavailable'}
                  color={resource.isAvailable ? 'success' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">{resource.location}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CategoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">{resource.category}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {resource.hourlyRate
                        ? `$${resource.hourlyRate.toFixed(2)}/hour`
                        : 'Free'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {resource.maxReservationHours
                        ? `Max ${resource.maxReservationHours} hours per reservation`
                        : 'No time limit'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {resource.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Rules & Requirements
              </Typography>
              <Typography variant="body1" paragraph>
                {resource.rules || 'No special rules specified for this resource.'}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleReserve}
                  disabled={!resource.isAvailable}
                  fullWidth
                >
                  Make a Reservation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Availability and Reviews */}
        <Grid item xs={12} md={4}>
          {/* Upcoming Reservations */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Reservations
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {recentReservations.length > 0 ? (
              <List disablePadding>
                {recentReservations.map((reservation) => (
                  <ListItem
                    key={reservation.id}
                    divider
                    sx={{ px: 0 }}
                  >
                    <ListItemText
                      primary={`${format(new Date(reservation.startTime), 'MMM d, yyyy')}`}
                      secondary={`${format(new Date(reservation.startTime), 'h:mm a')} - ${format(new Date(reservation.endTime), 'h:mm a')}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No upcoming reservations for this resource.</Alert>
            )}
          </Paper>

          {/* Reviews */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reviews
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {reviews.length > 0 ? (
              <List disablePadding>
                {reviews.map((review) => (
                  <ListItem
                    key={review.id}
                    alignItems="flex-start"
                    divider
                    sx={{ px: 0 }}
                  >
                    <ListItemAvatar>
                      <Avatar alt={review.userName}>
                        {review.userName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{review.userName}</Typography>
                          <Rating value={review.rating} size="small" readOnly />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.primary">
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No reviews yet for this resource.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default ResourceDetail;