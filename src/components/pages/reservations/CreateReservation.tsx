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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-center text-3xl font-bold mb-8 text-gray-800">
          Create Reservation
        </h1>

        {/* Enhanced Stepper */}
        <div className="flex justify-between items-center mb-10 relative">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-col items-center relative z-10">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${index <= activeStep
                    ? 'bg-blue-600 border-blue-700 text-white'
                    : 'bg-white border-gray-300 text-gray-500'}`}>
                {index < activeStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${index <= activeStep ? 'text-blue-600' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          ))}

          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
          <div
            className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all -z-10"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Card for step content */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 min-h-80">
          {getStepContent(activeStep)}
        </div>

        {/* Navigation buttons - only show if not on success screen */}
        {!(activeStep === 2 && reservationSuccess) && (
          <div className="flex justify-between mt-6">
            <div>
              {activeStep !== 0 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}
            </div>
            <div>
              {activeStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmitReservation}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
                  disabled={reservationLoading || reservationSuccess}
                >
                  {reservationLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <span>Create Reservation</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
                >
                  <span>Next</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
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
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  if (!resources.length) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="mt-4 text-lg text-gray-600">No resources available</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Select a Resource</h2>
      <div className="grid grid-cols-1 gap-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-start"
            onClick={() => onSelect(resource)}
          >
            <div className="flex-shrink-0 mr-4">
              {resource.imageUrl ? (
                <img
                  src={resource.imageUrl}
                  alt={resource.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-gray-900">{resource.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{resource.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Capacity: {resource.capacity}
                </span>
                {resource.hourlyRate && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ${resource.hourlyRate}/hour
                  </span>
                )}
                {resource.location && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {resource.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 2: Time Selection Component
interface TimeSelectionStepProps {
  formik: any
  resource: any
}

function TimeSelectionStep({ formik, resource }: TimeSelectionStepProps) {
  if (!resource) {
    return <div>Please select a resource first</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Choose Reservation Time</h2>

      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-medium text-blue-800 mb-1">Selected Resource: {resource.name}</h3>
        <p className="text-blue-700 text-sm">{resource.description}</p>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <DatePicker
              selected={formik.values.startTime}
              onChange={(date) => formik.setFieldValue('startTime', date)}
              showTimeSelect
              dateFormat="MMM d, yyyy h:mm aa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formik.errors.startTime && formik.touched.startTime && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.startTime.toString()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <DatePicker
              selected={formik.values.endTime}
              onChange={(date) => formik.setFieldValue('endTime', date)}
              showTimeSelect
              dateFormat="MMM d, yyyy h:mm aa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formik.errors.endTime && formik.touched.endTime && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.endTime.toString()}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Optional: Add details about your reservation"
            />
            {formik.errors.description && formik.touched.description && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.description.toString()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees</label>
            <div className="flex items-center">
              <input
                type="number"
                name="attendees"
                value={formik.values.attendees}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min={1}
                max={resource.capacity}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="ml-3 text-gray-500 text-sm">/ {resource.capacity} max</span>
            </div>
            {formik.errors.attendees && formik.touched.attendees && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.attendees.toString()}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formik.values.isRecurring}
              onChange={formik.handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
              Make this a recurring reservation
            </label>
          </div>

          {formik.values.isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pl-6 border-l-2 border-blue-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Pattern</label>
                <select
                  name="recurrencePattern"
                  value={formik.values.recurrencePattern}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Pattern</option>
                  {recurrencePatterns.map(pattern => (
                    <option key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </option>
                  ))}
                </select>
                {formik.errors.recurrencePattern && formik.touched.recurrencePattern && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.recurrencePattern.toString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                <input
                  type="number"
                  name="recurrenceInterval"
                  value={formik.values.recurrenceInterval}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.errors.recurrenceInterval && formik.touched.recurrenceInterval && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.recurrenceInterval.toString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <DatePicker
                  selected={formik.values.recurrenceEndDate}
                  onChange={(date) => formik.setFieldValue('recurrenceEndDate', date)}
                  dateFormat="MMM d, yyyy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.errors.recurrenceEndDate && formik.touched.recurrenceEndDate && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.recurrenceEndDate.toString()}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
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
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-green-700">Reservation Created!</h3>
          <p className="mt-2 text-gray-600">Your reservation has been successfully created and is awaiting confirmation.</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate(`/reservations/${newReservationId}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            View Reservation Details
          </button>
          <button
            onClick={() => navigate('/reservations')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Confirm Reservation Details</h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900">Resource Information</h3>
          <div className="mt-3 flex items-start">
            {resource.imageUrl ? (
              <img src={resource.imageUrl} alt={resource.name} className="w-20 h-20 object-cover rounded-md mr-4" />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
            <div>
              <h4 className="text-lg font-medium text-gray-900">{resource.name}</h4>
              <p className="text-gray-600 text-sm">{resource.description}</p>
              {resource.location && (
                <p className="text-gray-500 text-sm mt-1">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {resource.location}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900">Reservation Details</h3>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(formValues.startTime, 'MMM d, yyyy h:mm aa')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(formValues.endTime, 'MMM d, yyyy h:mm aa')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">{durationHours} hours</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Attendees</dt>
              <dd className="mt-1 text-sm text-gray-900">{formValues.attendees} people</dd>
            </div>
            {formValues.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{formValues.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {formValues.isRecurring && (
          <div className="px-6 py-5">
            <h3 className="text-lg font-medium text-gray-900">Recurrence Information</h3>
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Pattern</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {formValues.recurrencePattern}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Interval</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Every {formValues.recurrenceInterval} {formValues.recurrencePattern}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Until</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(formValues.recurrenceEndDate, 'MMM d, yyyy')}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="px-6 py-5 flex justify-between items-center bg-gray-50">
          <div>
            <span className="text-sm font-medium text-gray-500">Estimated Price:</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">{calculateEstimatedPrice()}</span>
          </div>
          <button
            onClick={onSubmit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : 'Confirm Reservation'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateReservation