import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { format, addHours, isBefore, parseISO } from 'date-fns'
import { useResourceStore } from '../../../stores/resourceStore'
import { useReservationStore } from '../../../stores/reservationStore'
import { CreateReservationFormValues, Resource } from '../../../types'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// Extending the Resource type to include the missing properties
declare module '../../../types' {
  interface Resource {
    type?: string;
    averageRating?: number;
    numberOfReviews?: number;
    availability?: string;
    costPerHour?: number;
  }
}

function ResourceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchResourceById, selectedResource, loading, error } = useResourceStore()
  const { createReservation } = useReservationStore()
  const [creatingReservation, setCreatingReservation] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [reservationError, setReservationError] = useState<string | null>(null)
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
      // The createReservation function expects Date objects and will format them to ISO strings
      const formattedValues = {
        ...values,
        resourceId: parseInt(id || '0')
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
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="w-full h-[300px] bg-gray-200 rounded-lg"></div>
          <div className="mt-4">
            <div className="h-10 bg-gray-200 rounded w-3/5 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/5"></div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              <div className="md:col-span-8">
                <div className="h-[200px] bg-gray-200 rounded-lg"></div>
              </div>
              <div className="md:col-span-4">
                <div className="h-[200px] bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !selectedResource) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="p-8 mt-6 text-center rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Resource
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Resource not found'}
          </p>
          <button
            onClick={() => navigate('/resources')}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200"
          >
            Back to Resources
          </button>
        </div>
      </div>
    )
  }

  // Custom DateTimePicker component
  const DateTimePicker = ({
    label,
    value,
    onChange,
    error,
    helperText
  }: {
    label: string;
    value: Date;
    onChange: (date: Date) => void;
    error?: boolean;
    helperText?: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <DatePicker
        selected={value}
        onChange={(date: Date | null) => {
          if (date) onChange(date);
        }}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MMMM d, yyyy h:mm aa"
        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && helperText && (
        <p className="mt-1 text-sm text-red-600">{helperText}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Resource Image and Basic Info */}
      <div className="overflow-hidden mb-8 rounded-xl shadow-lg bg-white">
        <div
          className="h-[200px] md:h-[300px] bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${selectedResource.imageUrl || "https://via.placeholder.com/1200x300?text=No+Image"})`
          }}
        >
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-md bg-white bg-opacity-90 text-gray-900 font-medium shadow-sm">
              {selectedResource.type}
            </span>
          </div>
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {selectedResource.name}
            </h1>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {selectedResource.location || 'Location not specified'}
              </span>
            </div>
            {selectedResource.averageRating !== undefined && (
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(selectedResource.averageRating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm">
                  {selectedResource.averageRating?.toFixed(1)} ({selectedResource.numberOfReviews || 0} reviews)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Resource Details */}
          <div className="md:col-span-8 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                About this resource
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {selectedResource.description || 'No description available for this resource.'}
              </p>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* Resource Features/Amenities */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Availability
                      </h3>
                      <p className={selectedResource.availability === 'Available' ? 'text-green-600' : 'text-amber-600'}>
                        {selectedResource.availability === 'Available' ? 'Available Now' : 'Limited Availability'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Capacity
                      </h3>
                      <p className="text-gray-600">
                        {selectedResource.capacity} {selectedResource.capacity === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Cost
                      </h3>
                      <p className="text-gray-600">
                        {selectedResource.costPerHour ? `$${selectedResource.costPerHour} per hour` : 'Free'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Type
                      </h3>
                      <p className="text-gray-600">
                        {selectedResource.type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Form */}
          <div className="md:col-span-4 bg-gray-50 p-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reserve This Resource
              </h2>

              {reservationSuccess && (
                <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                  Reservation created successfully! Redirecting to your reservation details...
                </div>
              )}

              {reservationError && (
                <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
                  {reservationError}
                </div>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                  <Form>
                    <div className="space-y-4">
                      <DateTimePicker
                        label="Start Time"
                        value={values.startTime}
                        onChange={(date) => setFieldValue('startTime', date)}
                        error={!!(touched.startTime && errors.startTime)}
                        helperText={touched.startTime && errors.startTime as string}
                      />

                      <DateTimePicker
                        label="End Time"
                        value={values.endTime}
                        onChange={(date) => setFieldValue('endTime', date)}
                        error={!!(touched.endTime && errors.endTime)}
                        helperText={touched.endTime && errors.endTime as string}
                      />

                      <div>
                        <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Attendees
                        </label>
                        <input
                          type="number"
                          id="attendees"
                          name="attendees"
                          className={`w-full p-2 !border rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 ${
                            touched.attendees && errors.attendees ? '!border-red-500 !bg-red-50' : '!border-gray-300 !bg-white'
                          }`}
                          value={values.attendees}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          min={1}
                          max={selectedResource?.capacity}
                        />
                        {touched.attendees && errors.attendees ? (
                          <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">Max: {selectedResource?.capacity}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Purpose of Reservation
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          className={`w-full p-2 !border rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 ${
                            touched.description && errors.description ? '!border-red-500 !bg-red-50' : '!border-gray-300 !bg-white'
                          }`}
                          placeholder="Briefly describe why you need this resource..."
                          value={values.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        ></textarea>
                        {touched.description && errors.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          name="isRecurring"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={values.isRecurring}
                          onChange={(e) => {
                            setFieldValue('isRecurring', e.target.checked);
                            setIsRecurring(e.target.checked);
                          }}
                        />
                        <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700">
                          Recurring Reservation
                        </label>
                      </div>

                      {values.isRecurring && (
                        <div className="ml-6 pl-2 border-l-2 border-blue-200 space-y-4 mt-2">
                          <div>
                            <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 mb-1">
                              Recurrence Pattern
                            </label>
                            <select
                              id="recurrencePattern"
                              name="recurrencePattern"
                              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                touched.recurrencePattern && errors.recurrencePattern ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={values.recurrencePattern}
                              onChange={handleChange}
                            >
                              <option value="">Select pattern</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                            {touched.recurrencePattern && errors.recurrencePattern && (
                              <p className="mt-1 text-sm text-red-600">{errors.recurrencePattern}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700 mb-1">
                              Recurrence Interval
                            </label>
                            <input
                              type="number"
                              id="recurrenceInterval"
                              name="recurrenceInterval"
                              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                touched.recurrenceInterval && errors.recurrenceInterval ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={values.recurrenceInterval}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              min={1}
                            />
                            {touched.recurrenceInterval && errors.recurrenceInterval && (
                              <p className="mt-1 text-sm text-red-600">{errors.recurrenceInterval}</p>
                            )}
                          </div>

                          <DateTimePicker
                            label="Recurrence End Date"
                            value={values.recurrenceEndDate}
                            onChange={(date) => setFieldValue('recurrenceEndDate', date)}
                            error={!!(touched.recurrenceEndDate && errors.recurrenceEndDate)}
                            helperText={touched.recurrenceEndDate && errors.recurrenceEndDate as string}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={creatingReservation}
                      className="w-full py-3 px-4 mt-6 !bg-blue-600 hover:!bg-blue-700 !text-white font-medium rounded-lg shadow-md transition-colors duration-200 flex justify-center items-center"
                    >
                      {creatingReservation ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 !border-t-2 !border-b-2 !border-white mr-3"></div>
                          Creating Reservation...
                        </>
                      ) : (
                        'Reserve Now'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetail