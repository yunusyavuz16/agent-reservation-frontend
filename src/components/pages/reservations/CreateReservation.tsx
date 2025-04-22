import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, addHours, isAfter, isBefore, addDays } from 'date-fns'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useResourceStore } from '../../../stores/resourceStore'
import { useReservationStore } from '../../../stores/reservationStore'
import { CreateReservationFormValues } from '../../../types'

// Steps for the reservation process
const steps = ['Select Resource', 'Choose Time', 'Confirm Details']

// Recurrence patterns
const recurrencePatterns = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

function CreateReservation() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const preSelectedResourceId = searchParams.get('resourceId')
  const { id } = useParams<{ id?: string }>()

  // State for the stepper
  const [activeStep, setActiveStep] = useState(preSelectedResourceId ? 1 : 0)
  const [selectedResource, setSelectedResource] = useState<any | null>(null)

  // Get data from stores
  const {
    resources,
    selectedResource: resourceDetail,
    fetchResources,
    fetchResourceById,
    loading: resourceLoading,
    error: resourceError
  } = useResourceStore()

  const {
    createReservation,
    loading: reservationLoading,
    error: reservationError
  } = useReservationStore()

  // Reservation success state
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [newReservationId, setNewReservationId] = useState<number | null>(null)

  // Load resources on component mount
  useEffect(() => {
    fetchResources()

    // If resource ID is provided in the URL, fetch that resource and select it
    if (preSelectedResourceId) {
      fetchResourceById(parseInt(preSelectedResourceId))
    }
  }, [fetchResources, fetchResourceById, preSelectedResourceId])

  // When resource detail is loaded, set it as selected resource
  useEffect(() => {
    if (preSelectedResourceId && resourceDetail) {
      setSelectedResource(resourceDetail)
    }
  }, [preSelectedResourceId, resourceDetail])

  // Handle resource selection
  const handleResourceSelect = (resource: any) => {
    setSelectedResource(resource)
    setActiveStep(1) // Move to next step
  }

  // Form validation schema for time selection
  const timeSelectionSchema = Yup.object({
    startTime: Yup.date()
      .required('Start time is required')
      .test('is-future', 'Start time must be in the future',
        function(value) {
          return value ? isAfter(new Date(value), new Date()) : false
        }),
    endTime: Yup.date()
      .required('End time is required')
      .test('is-after-start', 'End time must be after start time',
        function(value) {
          const { startTime } = this.parent
          return startTime && value ? isAfter(new Date(value), new Date(startTime)) : false
        }),
    description: Yup.string().max(500, 'Description must be less than 500 characters'),
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

  // Form for time selection
  const timeForm = useFormik({
    initialValues: {
      startTime: addHours(new Date(), 1),
      endTime: addHours(new Date(), 2),
      description: '',
      attendees: 1,
      isRecurring: false,
      recurrencePattern: '',
      recurrenceInterval: 1,
      recurrenceEndDate: addDays(new Date(), 7) // 1 week from now
    },
    validationSchema: timeSelectionSchema,
    onSubmit: (values) => {
      // Proceed to confirmation step
      setActiveStep(2)
    }
  })

  // Handle final submission
  const handleSubmitReservation = async () => {
    if (!selectedResource) return

    try {
      const formData: CreateReservationFormValues = {
        resourceId: selectedResource.id,
        startTime: timeForm.values.startTime,
        endTime: timeForm.values.endTime,
        description: timeForm.values.description,
        attendees: timeForm.values.attendees,
        isRecurring: timeForm.values.isRecurring,
        recurrencePattern: timeForm.values.recurrencePattern,
        recurrenceInterval: timeForm.values.recurrenceInterval,
        recurrenceEndDate: timeForm.values.recurrenceEndDate
      }

      const reservationId = await createReservation(formData)

      if (reservationId) {
        setReservationSuccess(true)
        setNewReservationId(reservationId)
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
    }
  }

  // Handle navigation between steps
  const handleNext = () => {
    if (activeStep === 1) {
      timeForm.handleSubmit()
    } else {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  // Render content based on current step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ResourceSelectionStep
            resources={resources}
            onSelect={handleResourceSelect}
            loading={resourceLoading}
            error={resourceError}
          />
        )
      case 1:
        return (
          <TimeSelectionStep
            formik={timeForm}
            resource={selectedResource}
          />
        )
      case 2:
        return (
          <ConfirmationStep
            resource={selectedResource}
            formValues={timeForm.values}
            onSubmit={handleSubmitReservation}
            loading={reservationLoading}
            error={reservationError}
            success={reservationSuccess}
            newReservationId={newReservationId}
          />
        )
      default:
        return 'Unknown step'
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Create Reservation
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step content */}
        {getStepContent(activeStep)}

        {/* Navigation buttons - only show if not on success screen */}
        {!(activeStep === 2 && reservationSuccess) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitReservation}
                disabled={reservationLoading || reservationSuccess}
              >
                {reservationLoading ? <CircularProgress size={24} /> : 'Create Reservation'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  )
}

// Step 1: Resource Selection Component
interface ResourceSelectionStepProps {
  resources: any[]
  onSelect: (resource: any) => void
  loading: boolean
  error: string | null
}

function ResourceSelectionStep({ resources, onSelect, loading, error }: ResourceSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter resources based on search term and availability
  const availableResources = resources.filter(resource => resource.isActive)

  const filteredResources = availableResources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a resource to reserve
      </Typography>

      <TextField
        label="Search resources"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredResources.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => onSelect(resource)}
              >
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {resource.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {resource.description && resource.description.length > 100
                      ? `${resource.description.substring(0, 100)}...`
                      : resource.description}
                  </Typography>
                  <Typography variant="body2">
                    Capacity: {resource.capacity || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Location: {resource.location}
                  </Typography>
                  {resource.hourlyRate && (
                    <Typography variant="body2">
                      Rate: ${resource.hourlyRate}/hour
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">Select</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No resources found matching "{searchTerm}".
        </Alert>
      )}
    </Box>
  )
}

// Step 2: Time Selection Component
interface TimeSelectionStepProps {
  formik: any
  resource: any
}

function TimeSelectionStep({ formik, resource }: TimeSelectionStepProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Reservation Details
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Resource: {resource?.name}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Start Time"
              value={formik.values.startTime}
              onChange={(newValue) => {
                formik.setFieldValue('startTime', newValue)
              }}
              disablePast
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  error: formik.touched.startTime && Boolean(formik.errors.startTime),
                  helperText: formik.touched.startTime && formik.errors.startTime
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="End Time"
              value={formik.values.endTime}
              onChange={(newValue) => {
                formik.setFieldValue('endTime', newValue)
              }}
              disablePast
              minDateTime={formik.values.startTime}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  error: formik.touched.endTime && Boolean(formik.errors.endTime),
                  helperText: formik.touched.endTime && formik.errors.endTime
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description (Optional)"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              placeholder="Any special requests or information about your reservation"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Number of Attendees"
              type="number"
              fullWidth
              name="attendees"
              value={formik.values.attendees}
              onChange={formik.handleChange}
              error={formik.touched.attendees && Boolean(formik.errors.attendees)}
              helperText={formik.touched.attendees && formik.errors.attendees}
              InputProps={{
                inputProps: { min: 1, max: resource?.capacity || 1 }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Recurring Reservation Options
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.isRecurring}
                  onChange={(e) => {
                    formik.setFieldValue('isRecurring', e.target.checked);
                  }}
                  name="isRecurring"
                />
              }
              label="Make this a recurring reservation"
            />
          </Grid>

          {formik.values.isRecurring && (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={formik.touched.recurrencePattern && Boolean(formik.errors.recurrencePattern)}>
                  <InputLabel>Recurrence Pattern</InputLabel>
                  <Select
                    value={formik.values.recurrencePattern}
                    onChange={formik.handleChange}
                    label="Recurrence Pattern"
                    name="recurrencePattern"
                  >
                    {recurrencePatterns.map((pattern) => (
                      <MenuItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Repeat Every"
                  type="number"
                  fullWidth
                  name="recurrenceInterval"
                  value={formik.values.recurrenceInterval}
                  onChange={formik.handleChange}
                  error={formik.touched.recurrenceInterval && Boolean(formik.errors.recurrenceInterval)}
                  helperText={
                    (formik.touched.recurrenceInterval && formik.errors.recurrenceInterval) ||
                    `${formik.values.recurrencePattern ? `Every ${formik.values.recurrenceInterval} ${formik.values.recurrencePattern}` : ''}`
                  }
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                  disabled={!formik.values.recurrencePattern}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Recurrence End Date"
                  value={formik.values.recurrenceEndDate}
                  onChange={(newValue) => {
                    formik.setFieldValue('recurrenceEndDate', newValue);
                  }}
                  disablePast
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                      error: formik.touched.recurrenceEndDate && Boolean(formik.errors.recurrenceEndDate),
                      helperText: formik.touched.recurrenceEndDate && formik.errors.recurrenceEndDate
                    }
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </LocalizationProvider>
    </Box>
  )
}

// Step 3: Confirmation Component
interface ConfirmationStepProps {
  resource: any
  formValues: any
  onSubmit: () => void
  loading: boolean
  error: string | null
  success: boolean
  newReservationId: number | null
}

function ConfirmationStep({
  resource,
  formValues,
  onSubmit,
  loading,
  error,
  success,
  newReservationId
}: ConfirmationStepProps) {
  const navigate = useNavigate()

  // Format the duration for display
  const durationHours = Math.round((formValues.endTime.getTime() - formValues.startTime.getTime()) / (1000 * 60 * 60) * 10) / 10

  // If reservation was successfully created
  if (success && newReservationId) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Reservation created successfully!
        </Alert>
        <Typography variant="h6" gutterBottom>
          Your reservation has been confirmed.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/reservations/${newReservationId}`)}
          >
            View Reservation Details
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/reservations')}
          >
            Go to My Reservations
          </Button>
        </Box>
      </Box>
    )
  }

  const calculateEstimatedPrice = () => {
    if (!resource.hourlyRate && !resource.dailyRate) return 'Free'

    const hours = durationHours
    const days = Math.ceil(hours / 24)

    if (resource.hourlyRate && hours <= 24) {
      return `$${(resource.hourlyRate * Math.ceil(hours)).toFixed(2)}`
    } else if (resource.dailyRate) {
      return `$${(resource.dailyRate * days).toFixed(2)}`
    }

    return 'Price not available'
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Confirm Reservation Details
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Resource</Typography>
            <Typography variant="body1">{resource?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Location</Typography>
            <Typography variant="body1">{resource?.location}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Attendees</Typography>
            <Typography variant="body1">{formValues.attendees}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
            <Typography variant="body1">{durationHours} hours</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Start Time</Typography>
            <Typography variant="body1">{format(formValues.startTime, 'MMM d, yyyy h:mm a')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">End Time</Typography>
            <Typography variant="body1">{format(formValues.endTime, 'MMM d, yyyy h:mm a')}</Typography>
          </Grid>

          {formValues.isRecurring && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Recurring Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Pattern</Typography>
                <Typography variant="body1">
                  Every {formValues.recurrenceInterval} {formValues.recurrencePattern}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Until</Typography>
                <Typography variant="body1">
                  {format(formValues.recurrenceEndDate, 'MMM d, yyyy')}
                </Typography>
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Estimated Price</Typography>
            <Typography variant="body1">{calculateEstimatedPrice()}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {formValues.description && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Description</Typography>
              <Typography variant="body1">{formValues.description}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Typography variant="body2" color="text.secondary" paragraph>
        By creating this reservation, you agree to the reservation terms and conditions.
        Cancellation may be subject to fees depending on how close to the reservation time you cancel.
      </Typography>
    </Box>
  )
}

export default CreateReservation