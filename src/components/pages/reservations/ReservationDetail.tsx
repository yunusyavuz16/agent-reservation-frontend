import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Rating
} from '@mui/material'
import { format } from 'date-fns'
import { useReservationStore } from '../../../stores/reservationStore'
import { useReviewStore } from '../../../stores/reviewStore'
import { ReviewFormValues } from '../../../types'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

// Review form validation schema
const reviewValidationSchema = Yup.object({
  rating: Yup.number()
    .required('Rating is required')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating must be at most 5 stars'),
  comment: Yup.string()
    .required('Comment is required')
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be at most 500 characters')
})

function ReservationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedReservation, fetchReservationById, updateReservation, cancelReservation, loading, error } = useReservationStore()
  const { createReview, loading: reviewLoading } = useReviewStore()

  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Fetch reservation details when component mounts or ID changes
  useEffect(() => {
    if (id) {
      fetchReservationById(parseInt(id))
    }
  }, [id, fetchReservationById])

  // Reset messages when dialog closes
  useEffect(() => {
    if (!cancelDialogOpen && !reviewDialogOpen) {
      setActionSuccess(null)
      setActionError(null)
    }
  }, [cancelDialogOpen, reviewDialogOpen])

  // Handle cancel reservation
  const handleCancelReservation = async () => {
    try {
      if (id) {
        await cancelReservation(parseInt(id))
        setActionSuccess('Reservation cancelled successfully')
        setTimeout(() => {
          setCancelDialogOpen(false)
        }, 1500)
      }
    } catch (error) {
      setActionError('Failed to cancel reservation. Please try again.')
    }
  }

  // Handle submit review
  const handleSubmitReview = async (values: ReviewFormValues) => {
    try {
      if (selectedReservation) {
        await createReview({
          ...values,
          reservationId: selectedReservation.id
        })
        setActionSuccess('Review submitted successfully')
        setTimeout(() => {
          setReviewDialogOpen(false)
        }, 1500)
      }
    } catch (error) {
      setActionError('Failed to submit review. Please try again.')
    }
  }

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Cancelled':
        return 'error'
      case 'Completed':
        return 'info'
      default:
        return 'default'
    }
  }

  // Check if reservation can be cancelled (not cancelled and not completed)
  const canBeCancelled = selectedReservation &&
    !['Cancelled', 'Completed'].includes(selectedReservation.status) &&
    new Date(selectedReservation.startTime) > new Date()

  // Check if reservation can be reviewed (completed and not cancelled)
  const canBeReviewed = selectedReservation &&
    selectedReservation.status === 'Completed' &&
    new Date(selectedReservation.endTime) < new Date()

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  // Error state
  if (error || !selectedReservation) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Reservation not found'}
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={() => id && fetchReservationById(parseInt(id))}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Reservation #{selectedReservation.id}
          </Typography>
          <Chip
            label={selectedReservation.status}
            color={getStatusColor(selectedReservation.status) as any}
            sx={{ mt: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          {/* Conditional buttons based on reservation state */}
          {canBeCancelled && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Reservation
            </Button>
          )}

          {canBeReviewed && (
            <Button
              variant="contained"
              onClick={() => setReviewDialogOpen(true)}
            >
              Write Review
            </Button>
          )}

          {/* Payment button if reservation is confirmed but not paid */}
          {selectedReservation.status === 'Confirmed' && !selectedReservation.isPaid && (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/payment/${selectedReservation.id}`}
            >
              Make Payment
            </Button>
          )}
        </Box>
      </Box>

      {/* Reservation details */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Resource Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Resource Name</Typography>
            <Typography variant="body1">{selectedReservation.resourceName || 'Unknown Resource'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Resource ID</Typography>
            <Typography variant="body1">#{selectedReservation.resourceId}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Link to={`/resources/${selectedReservation.resourceId}`}>
              <Button variant="text" color="primary" size="small">
                View Resource Details
              </Button>
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Booking Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Start Time</Typography>
            <Typography variant="body1">
              {format(new Date(selectedReservation.startTime), 'MMM d, yyyy h:mm a')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">End Time</Typography>
            <Typography variant="body1">
              {format(new Date(selectedReservation.endTime), 'MMM d, yyyy h:mm a')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Creation Date</Typography>
            <Typography variant="body1">
              {format(new Date(selectedReservation.createdAt), 'MMM d, yyyy h:mm a')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Payment Status</Typography>
            <Typography variant="body1">
              <Chip
                label={selectedReservation.isPaid ? 'Paid' : 'Unpaid'}
                color={selectedReservation.isPaid ? 'success' : 'warning'}
                size="small"
              />
            </Typography>
          </Grid>
        </Grid>

        {selectedReservation.notes && (
          <>
            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body1" paragraph>
              {selectedReservation.notes}
            </Typography>
          </>
        )}
      </Paper>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !actionSuccess && setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Reservation</DialogTitle>
        <DialogContent>
          {actionSuccess ? (
            <Alert severity="success">{actionSuccess}</Alert>
          ) : actionError ? (
            <Alert severity="error">{actionError}</Alert>
          ) : (
            <DialogContentText>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </DialogContentText>
          )}
        </DialogContent>
        {!actionSuccess && !actionError && (
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
            <Button onClick={handleCancelReservation} color="error" autoFocus>
              Yes, Cancel Reservation
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => !actionSuccess && !reviewLoading && setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          {actionSuccess ? (
            <Alert severity="success">{actionSuccess}</Alert>
          ) : actionError ? (
            <Alert severity="error">{actionError}</Alert>
          ) : (
            <Formik
              initialValues={{ rating: 0, comment: '' }}
              validationSchema={reviewValidationSchema}
              onSubmit={handleSubmitReview}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form>
                  <Box sx={{ my: 2 }}>
                    <Typography component="legend">Your Rating</Typography>
                    <Rating
                      name="rating"
                      value={values.rating}
                      onChange={(_, newValue) => {
                        setFieldValue('rating', newValue || 0);
                      }}
                      size="large"
                      sx={{ mt: 1 }}
                    />
                    {errors.rating && touched.rating && (
                      <Typography color="error" variant="caption">
                        {errors.rating}
                      </Typography>
                    )}
                  </Box>

                  <Field
                    as={TextField}
                    name="comment"
                    label="Your Review"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    error={errors.comment && touched.comment}
                    helperText={touched.comment && errors.comment}
                  />

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      onClick={() => setReviewDialogOpen(false)}
                      disabled={isSubmitting || reviewLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || reviewLoading}
                    >
                      {reviewLoading ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default ReservationDetail