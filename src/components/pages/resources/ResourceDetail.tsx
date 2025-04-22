import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  Rating,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { format, addHours, isBefore, parseISO } from 'date-fns'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useResourceStore } from '../../../stores/resourceStore'
import { useReservationStore } from '../../../stores/reservationStore'
import { CreateReservationFormValues } from '../../../types'

function ResourceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedResource, loading, error, fetchResourceById } = useResourceStore()
  const { createReservation, loading: creatingReservation, error: reservationError } = useReservationStore()
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)

  useEffect(() => {
    if (id) {
      fetchResourceById(parseInt(id))
    }
  }, [fetchResourceById, id])

  const validationSchema = Yup.object({
    startTime: Yup.date()
      .required('Start time is required')
      .min(new Date(), 'Start time must be in the future'),
    endTime: Yup.date()
      .required('End time is required')
      .min(
        Yup.ref('startTime'),
        'End time must be after start time'
      ),
    description: Yup.string(),
    attendees: Yup.number()
      .required('Number of attendees is required')
      .min(1, 'At least 1 attendee is required')
      .max(selectedResource?.capacity || 1, `Maximum capacity is ${selectedResource?.capacity || 1}`),
    isRecurring: Yup.boolean(),
    recurrencePattern: Yup.string()
      .when('isRecurring', {
        is: true,
        then: (schema) => schema.required('Pattern is required when recurring'),
      }),
    recurrenceInterval: Yup.number()
      .when('isRecurring', {
        is: true,
        then: (schema) => schema.required('Interval is required when recurring').min(1, 'Interval must be at least 1'),
      }),
    recurrenceEndDate: Yup.date()
      .when('isRecurring', {
        is: true,
        then: (schema) =>
          schema.required('End date is required when recurring')
            .min(Yup.ref('startTime'), 'Recurrence end date must be after start time'),
      })
  })

  const initialValues: CreateReservationFormValues = {
    startTime: addHours(new Date(), 1),
    endTime: addHours(new Date(), 2),
    description: '',
    resourceId: parseInt(id || '0'),
    attendees: 1,
    isRecurring: false,
    recurrencePattern: '',
    recurrenceInterval: 1,
    recurrenceEndDate: addHours(new Date(), 24 * 7) // 1 week from now
  }

  const handleSubmit = async (values: CreateReservationFormValues) => {
    try {
      // Format dates to ISO strings
      const formattedValues = {
        ...values,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        recurrenceEndDate: values.recurrenceEndDate ? values.recurrenceEndDate.toISOString() : undefined
      }

      const reservationId = await createReservation(formattedValues)
      if (reservationId) {
        setReservationSuccess(true)
        // Navigate to reservation details after a delay
        setTimeout(() => {
          navigate(`/reservations/${reservationId}`)
        }, 2000)
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={300} />
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={30} sx={{ mt: 1 }} />
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rectangular" width="100%" height={200} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" width="100%" height={200} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    )
  }

  // Error state
  if (error || !selectedResource) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Resource
          </Typography>
          <Typography variant="body1" paragraph>
            {error || 'Resource not found'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/resources')}
          >
            Back to Resources
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Resource Image and Basic Info */}
        <Paper sx={{ overflow: 'hidden', mb: 4 }}>
          <Box
            sx={{
              height: 300,
              backgroundImage: `url(${selectedResource.imageUrl || "https://via.placeholder.com/1200x300?text=No+Image"})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                p: 2
              }}
            >
              <Typography variant="h4" component="h1">
                {selectedResource.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Rating value={selectedResource.averageRating || 0} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {selectedResource.averageRating ? selectedResource.averageRating.toFixed(1) : 'No ratings yet'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    Location: {selectedResource.location || 'Not specified'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    Capacity: {selectedResource.capacity} {selectedResource.capacity === 1 ? 'person' : 'people'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventAvailableIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    Status:
                    <Chip
                      size="small"
                      label={selectedResource.isAvailableNow ? "Available Now" : "Currently Unavailable"}
                      color={selectedResource.isAvailableNow ? "success" : "error"}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {selectedResource.hourlyRate ? `$${selectedResource.hourlyRate}/hour` : ''}
                    {selectedResource.hourlyRate && selectedResource.dailyRate ? ' or ' : ''}
                    {selectedResource.dailyRate ? `$${selectedResource.dailyRate}/day` : ''}
                    {!selectedResource.hourlyRate && !selectedResource.dailyRate ? 'Free' : ''}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedResource.description || 'No description available.'}
                </Typography>
                <Box sx={{ display: 'flex', mt: 1 }}>
                  {selectedResource.category && (
                    <Chip
                      label={selectedResource.category}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Reservation Form */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h5" gutterBottom>
              Make a Reservation
            </Typography>

            {reservationSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Reservation created successfully! Redirecting to your reservation details...
              </Alert>
            )}

            {reservationError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {reservationError}
              </Alert>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        name="startTime"
                        render={({ field, form }: any) => (
                          <DateTimePicker
                            label="Start Time"
                            value={field.value}
                            onChange={(newValue) => {
                              form.setFieldValue(field.name, newValue)

                              // If end time is before the new start time, adjust it
                              if (isBefore(form.values.endTime, newValue)) {
                                form.setFieldValue('endTime', addHours(newValue, 1))
                              }
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: 'outlined',
                                error: touched.startTime && Boolean(errors.startTime),
                                helperText: touched.startTime && errors.startTime
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        name="endTime"
                        render={({ field, form }: any) => (
                          <DateTimePicker
                            label="End Time"
                            value={field.value}
                            onChange={(newValue) => {
                              form.setFieldValue(field.name, newValue)
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: 'outlined',
                                error: touched.endTime && Boolean(errors.endTime),
                                helperText: touched.endTime && errors.endTime
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="attendees"
                        label="Number of Attendees"
                        type="number"
                        InputProps={{ inputProps: { min: 1, max: selectedResource.capacity } }}
                        error={touched.attendees && Boolean(errors.attendees)}
                        helperText={
                          (touched.attendees && errors.attendees) ||
                          `Maximum capacity: ${selectedResource.capacity}`
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="description"
                        label="Description (Optional)"
                        multiline
                        rows={1}
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                      />
                    </Grid>

                    {/* Recurring reservation options */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.isRecurring}
                            onChange={(e) => {
                              setFieldValue('isRecurring', e.target.checked)
                              setIsRecurring(e.target.checked)
                            }}
                            name="isRecurring"
                            color="primary"
                          />
                        }
                        label="Create recurring reservation"
                      />
                    </Grid>

                    {values.isRecurring && (
                      <>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth error={touched.recurrencePattern && Boolean(errors.recurrencePattern)}>
                            <InputLabel id="recurrence-pattern-label">Repeat</InputLabel>
                            <Field
                              as={Select}
                              labelId="recurrence-pattern-label"
                              name="recurrencePattern"
                              label="Repeat"
                            >
                              <MenuItem value="">Select a pattern</MenuItem>
                              <MenuItem value="daily">Daily</MenuItem>
                              <MenuItem value="weekly">Weekly</MenuItem>
                              <MenuItem value="monthly">Monthly</MenuItem>
                            </Field>
                            {touched.recurrencePattern && errors.recurrencePattern && (
                              <Typography variant="caption" color="error">
                                {errors.recurrencePattern}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <Field
                            as={TextField}
                            fullWidth
                            name="recurrenceInterval"
                            label="Every"
                            type="number"
                            InputProps={{ inputProps: { min: 1 } }}
                            error={touched.recurrenceInterval && Boolean(errors.recurrenceInterval)}
                            helperText={touched.recurrenceInterval && errors.recurrenceInterval}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <Field
                            name="recurrenceEndDate"
                            render={({ field, form }: any) => (
                              <DateTimePicker
                                label="Until"
                                value={field.value}
                                onChange={(newValue) => {
                                  form.setFieldValue(field.name, newValue)
                                }}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    variant: 'outlined',
                                    error: touched.recurrenceEndDate && Boolean(errors.recurrenceEndDate),
                                    helperText: touched.recurrenceEndDate && errors.recurrenceEndDate
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        disabled={creatingReservation}
                      >
                        {creatingReservation ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Make Reservation'
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Grid>

          {/* Reservation Summary */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reservation Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resource
                  </Typography>
                  <Typography variant="body1">
                    {selectedResource.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {selectedResource.location || 'Not specified'}
                  </Typography>
                </Box>

                {selectedResource.nextAvailableTime && !selectedResource.isAvailableNow && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Next Available
                    </Typography>
                    <Typography variant="body1">
                      {format(parseISO(selectedResource.nextAvailableTime.toString()), 'PPpp')}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ my: 3 }}>
                  <Alert severity="info" icon={<AccessTimeIcon />}>
                    <Typography variant="body2">
                      This resource {selectedResource.hourlyRate ? `costs $${selectedResource.hourlyRate} per hour` : ''}
                      {selectedResource.hourlyRate && selectedResource.dailyRate ? ' or ' : ''}
                      {selectedResource.dailyRate ? `$${selectedResource.dailyRate} per day` : ''}
                      {!selectedResource.hourlyRate && !selectedResource.dailyRate ? 'has no associated cost' : ''}
                    </Typography>
                  </Alert>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Note:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All reservations are subject to approval. You will receive a notification when your reservation is confirmed.
                  {selectedResource.isAvailableNow ? '' : ' This resource is currently unavailable, but you can still submit a reservation request for when it becomes available.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  )
}

export default ResourceDetail