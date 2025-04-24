import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { format, addHours, isAfter, isBefore, addDays } from 'date-fns'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useResourceStore } from '../../../stores/resourceStore'
import { useReservationStore } from '../../../stores/reservationStore'
import { CreateReservationFormValues } from '../../../types'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

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
    <div className="max-w-lg p-4">
      <div className="p-3">
        <h1 className="text-center text-2xl font-bold mb-4">
          Create Reservation
        </h1>

        {/* Stepper */}
        <div className="flex justify-center space-x-4 pt-3 pb-5">
          {steps.map((label) => (
            <div key={label} className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
              <span className="ml-2">{label}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        {getStepContent(activeStep)}

        {/* Navigation buttons - only show if not on success screen */}
        {!(activeStep === 2 && reservationSuccess) && (
          <div className="flex justify-end mt-3 space-x-2">
            {activeStep !== 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 !bg-gray-500 !text-white rounded"
              >
                Back
              </button>
            )}

            {activeStep === steps.length - 1 ? (
              <button
                onClick={handleSubmitReservation}
                className="px-4 py-2 !bg-blue-500 !text-white rounded"
                disabled={reservationLoading || reservationSuccess}
              >
                {reservationLoading ? (
                  <div className="animate-spin h-5 w-5 mx-auto"></div>
                ) : 'Create Reservation'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 !bg-blue-500 !text-white rounded"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
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
      <div className="flex justify-center py-3">
        <div className="animate-spin h-10 w-10"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-2 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">
        Select a resource to reserve
      </h2>

      <input
        type="text"
        placeholder="Search resources"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 !border !border-gray-300 !bg-white rounded"
      />

      {filteredResources.length > 0 ? (
        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:transform hover:translate-y-[-4px]"
              onClick={() => onSelect(resource)}
            >
              <div className="p-4">
                <h3 className="text-base font-semibold mb-2">
                  {resource.name}
                </h3>
                <p className="text-sm text-gray-500 mb-1.5">
                  {resource.description && resource.description.length > 100
                    ? `${resource.description.substring(0, 100)}...`
                    : resource.description}
                </p>
                <p className="text-sm">
                  Capacity: {resource.capacity || 'N/A'}
                </p>
                <p className="text-sm">
                  Location: {resource.location}
                </p>
                {resource.hourlyRate && (
                  <p className="text-sm">
                    Rate: ${resource.hourlyRate}/hour
                  </p>
                )}
              </div>
              <div className="p-2">
                <button className="text-sm text-blue-500">Select</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-500">
          No resources found matching "{searchTerm}".
        </div>
      )}
    </div>
  )
}

// Step 2: Time Selection Component
interface TimeSelectionStepProps {
  formik: any
  resource: any
}

function TimeSelectionStep({ formik, resource }: TimeSelectionStepProps) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-3">
        Select Reservation Details
      </h2>

      <p className="text-sm text-gray-500 mb-3">
        Resource: {resource?.name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-1">
          <input
            type="datetime-local"
            value={formik.values.startTime.toISOString().split('T')[0] + 'T' + formik.values.startTime.toISOString().split('T')[1]}
            onChange={(e) => {
              formik.setFieldValue('startTime', new Date(e.target.value))
            }}
            className="w-full p-2 !border !border-gray-300 !bg-white rounded"
          />
        </div>
        <div className="md:col-span-1">
          <input
            type="datetime-local"
            value={formik.values.endTime.toISOString().split('T')[0] + 'T' + formik.values.endTime.toISOString().split('T')[1]}
            onChange={(e) => {
              formik.setFieldValue('endTime', new Date(e.target.value))
            }}
            className="w-full p-2 !border !border-gray-300 !bg-white rounded"
            min={formik.values.startTime.toISOString().split('T')[0] + 'T' + formik.values.startTime.toISOString().split('T')[1]}
          />
        </div>
        <div className="md:col-span-2">
          <textarea
            placeholder="Any special requests or information about your reservation"
            value={formik.values.description}
            onChange={formik.handleChange}
            className="w-full p-2 !border !border-gray-300 !bg-white rounded"
            rows={4}
          ></textarea>
        </div>

        <div className="md:col-span-1">
          <input
            type="number"
            placeholder="Number of Attendees"
            value={formik.values.attendees}
            onChange={formik.handleChange}
            className="w-full p-2 !border !border-gray-300 !bg-white rounded"
            min="1"
            max={resource?.capacity || 1}
          />
        </div>

        <div className="md:col-span-2">
          <div className="border-t border-gray-200 my-2"></div>
          <p className="text-sm font-semibold mb-2">
            Recurring Reservation Options
          </p>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formik.values.isRecurring}
              onChange={(e) => {
                formik.setFieldValue('isRecurring', e.target.checked);
              }}
              className="mr-2"
            />
            <label>Make this a recurring reservation</label>
          </div>
        </div>

        {formik.values.isRecurring && (
          <>
            <div className="md:col-span-1">
              <select
                value={formik.values.recurrencePattern}
                onChange={formik.handleChange}
                className="w-full p-2 !border !border-gray-300 !bg-white rounded"
              >
                {recurrencePatterns.map((pattern) => (
                  <option key={pattern.value} value={pattern.value}>
                    {pattern.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <input
                type="number"
                placeholder="Repeat Every"
                value={formik.values.recurrenceInterval}
                onChange={formik.handleChange}
                className="w-full p-2 !border !border-gray-300 !bg-white rounded"
                min="1"
                disabled={!formik.values.recurrencePattern}
              />
            </div>

            <div className="md:col-span-1">
              <input
                type="datetime-local"
                value={formik.values.recurrenceEndDate.toISOString().split('T')[0] + 'T' + formik.values.recurrenceEndDate.toISOString().split('T')[1]}
                onChange={(e) => {
                  formik.setFieldValue('recurrenceEndDate', new Date(e.target.value));
                }}
                className="w-full p-2 border border-gray-300 rounded"
                min={formik.values.startTime.toISOString().split('T')[0] + 'T' + formik.values.startTime.toISOString().split('T')[1]}
              />
            </div>
          </>
        )}
      </div>
    </div>
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
      <div className="text-center py-3">
        <div className="mb-3 text-green-500">
          Reservation created successfully!
        </div>
        <p className="text-base font-semibold mb-4">
          Your reservation has been confirmed.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(`/reservations/${newReservationId}`)}
            className="px-4 py-2 !bg-blue-500 !text-white rounded"
          >
            View Reservation Details
          </button>
          <button
            onClick={() => navigate('/reservations')}
            className="px-4 py-2 !bg-gray-500 !text-white rounded"
          >
            Go to My Reservations
          </button>
        </div>
      </div>
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
    <div>
      <h2 className="text-base font-semibold mb-3">
        Confirm Reservation Details
      </h2>

      {error && (
        <div className="mb-3 text-red-500">
          {error}
        </div>
      )}

      <div className="p-3 border border-gray-200 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <p className="text-sm text-gray-500">Resource</p>
            <p className="text-base font-semibold">{resource?.name}</p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-base font-semibold">{resource?.location}</p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-sm text-gray-500">Attendees</p>
            <p className="text-base font-semibold">{formValues.attendees}</p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-base font-semibold">{durationHours} hours</p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-sm text-gray-500">Start Time</p>
            <p className="text-base font-semibold">{format(formValues.startTime, 'MMM d, yyyy h:mm a')}</p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-sm text-gray-500">End Time</p>
            <p className="text-base font-semibold">{format(formValues.endTime, 'MMM d, yyyy h:mm a')}</p>
          </div>

          {formValues.isRecurring && (
            <>
              <div className="sm:col-span-2">
                <div className="border-t border-gray-200 my-1"></div>
                <p className="text-sm text-gray-500">Recurring Details</p>
              </div>
              <div className="sm:col-span-1">
                <p className="text-sm text-gray-500">Pattern</p>
                <p className="text-base font-semibold">
                  Every {formValues.recurrenceInterval} {formValues.recurrencePattern}
                </p>
              </div>
              <div className="sm:col-span-1">
                <p className="text-sm text-gray-500">Until</p>
                <p className="text-base font-semibold">
                  {format(formValues.recurrenceEndDate, 'MMM d, yyyy')}
                </p>
              </div>
            </>
          )}

          <div className="sm:col-span-1">
            <p className="text-sm text-gray-500">Estimated Price</p>
            <p className="text-base font-semibold">{calculateEstimatedPrice()}</p>
          </div>

          <div className="sm:col-span-2">
            <div className="border-t border-gray-200 my-1"></div>
          </div>

          {formValues.description && (
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-base font-semibold">{formValues.description}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        By creating this reservation, you agree to the reservation terms and conditions.
        Cancellation may be subject to fees depending on how close to the reservation time you cancel.
      </p>
    </div>
  )
}

export default CreateReservation