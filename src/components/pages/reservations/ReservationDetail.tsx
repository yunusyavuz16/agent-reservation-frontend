import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  const { submitReview, loading: reviewLoading } = useReviewStore()

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
        await submitReview({
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
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !selectedReservation) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
          </div>
          <div>
            <p className="text-red-500">{error || 'Reservation not found'}</p>
            <div className="mt-2 flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg normal-case text-sm hover:bg-gray-300"
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg normal-case text-sm hover:bg-blue-700"
                onClick={() => id && fetchReservationById(parseInt(id))}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold !text-gray-900">Reservation #{selectedReservation.id}</h1>
          <span className={`px-3 py-1 mt-2 inline-flex text-sm font-medium rounded-full
            ${selectedReservation.status === 'Confirmed' ? '!bg-green-100 !text-green-800' :
              selectedReservation.status === 'Pending' ? '!bg-yellow-100 !text-yellow-800' :
              selectedReservation.status === 'Cancelled' ? '!bg-red-100 !text-red-800' :
              selectedReservation.status === 'Completed' ? '!bg-blue-100 !text-blue-800' :
              '!bg-gray-100 !text-gray-800'}`}
          >
            {selectedReservation.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            className="rounded-lg normal-case !text-gray-700 !border-gray-300 hover:!bg-gray-50"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          {/* Conditional buttons based on reservation state */}
          {canBeCancelled && (
            <button
              className="rounded-lg normal-case !text-red-600 !border-red-300 hover:!bg-red-50"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Reservation
            </button>
          )}

          {canBeReviewed && (
            <button
              className="rounded-lg normal-case !bg-blue-600 hover:!bg-blue-700 !text-white"
              onClick={() => setReviewDialogOpen(true)}
            >
              Write Review
            </button>
          )}

          {/* Payment button if reservation is confirmed but not paid */}
          {selectedReservation.status === 'Confirmed' && !selectedReservation.isPaid && (
            <button
              className="rounded-lg normal-case !bg-blue-600 hover:!bg-blue-700 !text-white"
              onClick={() => navigate(`/payment/${selectedReservation.id}`)}
            >
              Make Payment
            </button>
          )}
        </div>
      </div>

      {/* Reservation details */}
      <div className="p-6 mb-6 rounded-xl shadow-sm bg-white">
        <h2 className="text-lg font-semibold !text-gray-900 mb-4">Resource Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p className="text-sm !text-gray-500 mb-1">Resource Name</p>
            <p className="!text-gray-900">{selectedReservation.resourceName || 'Unknown Resource'}</p>
          </div>
          <div>
            <p className="text-sm !text-gray-500 mb-1">Resource ID</p>
            <p className="!text-gray-900">#{selectedReservation.resourceId}</p>
          </div>
          <div className="sm:col-span-2 mt-2">
            <button
              className="no-underline text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md normal-case p-2"
              onClick={() => navigate(`/resources/${selectedReservation.resourceId}`)}
            >
              View Resource Details
            </button>
          </div>
        </div>

        <div className="my-6">
          <h2 className="text-lg font-semibold !text-gray-900 mb-4">Booking Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm !text-gray-500 mb-1">Start Time</p>
              <p className="!text-gray-900">
                {format(new Date(selectedReservation.startTime), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div>
              <p className="text-sm !text-gray-500 mb-1">End Time</p>
              <p className="!text-gray-900">
                {format(new Date(selectedReservation.endTime), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div>
              <p className="text-sm !text-gray-500 mb-1">Creation Date</p>
              <p className="!text-gray-900">
                {format(new Date(selectedReservation.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div>
              <p className="text-sm !text-gray-500 mb-1">Payment Status</p>
              <div className="mt-1">
                <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full
                  ${selectedReservation.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {selectedReservation.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {selectedReservation.notes && (
          <>
            <div className="my-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 whitespace-pre-line">{selectedReservation.notes}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cancel Dialog */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${cancelDialogOpen ? '' : 'hidden'}`}
      >
        <div className="bg-white p-8 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Cancel Reservation</h2>
          {actionSuccess ? (
            <div className="mb-2 !text-green-500">{actionSuccess}</div>
          ) : actionError ? (
            <div className="mb-2 !text-red-500">{actionError}</div>
          ) : (
            <p className="mb-4 !text-gray-600">
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-lg normal-case !text-gray-700"
              onClick={() => setCancelDialogOpen(false)}
            >
              No, Keep It
            </button>
            <button
              className="rounded-lg normal-case !bg-red-600 hover:!bg-red-700 !text-white"
              onClick={handleCancelReservation}
            >
              Yes, Cancel Reservation
            </button>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${reviewDialogOpen ? '' : 'hidden'}`}
      >
        <div className="bg-white p-8 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
          {actionSuccess ? (
            <div className="mb-2 !text-green-500">{actionSuccess}</div>
          ) : actionError ? (
            <div className="mb-2 !text-red-500">{actionError}</div>
          ) : (
            <Formik
              initialValues={{
                rating: 0,
                comment: '',
                reservationId: selectedReservation.id
              }}
              validationSchema={reviewValidationSchema}
              onSubmit={handleSubmitReview}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form className="mt-2">
                  <div className="my-4">
                    <label className="text-gray-700 mb-2">Your Rating</label>
                    <div className="flex items-center">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="rating"
                          value="1"
                          checked={values.rating === 1}
                          onChange={(e) => setFieldValue('rating', parseInt(e.target.value))}
                          className="form-radio h-4 w-4"
                        />
                      </div>
                      <div className="ml-2">
                        <span>1 star</span>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="rating"
                          value="2"
                          checked={values.rating === 2}
                          onChange={(e) => setFieldValue('rating', parseInt(e.target.value))}
                          className="form-radio h-4 w-4"
                        />
                      </div>
                      <div className="ml-2">
                        <span>2 stars</span>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="rating"
                          value="3"
                          checked={values.rating === 3}
                          onChange={(e) => setFieldValue('rating', parseInt(e.target.value))}
                          className="form-radio h-4 w-4"
                        />
                      </div>
                      <div className="ml-2">
                        <span>3 stars</span>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="rating"
                          value="4"
                          checked={values.rating === 4}
                          onChange={(e) => setFieldValue('rating', parseInt(e.target.value))}
                          className="form-radio h-4 w-4"
                        />
                      </div>
                      <div className="ml-2">
                        <span>4 stars</span>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="rating"
                          value="5"
                          checked={values.rating === 5}
                          onChange={(e) => setFieldValue('rating', parseInt(e.target.value))}
                          className="form-radio h-4 w-4"
                        />
                      </div>
                      <div className="ml-2">
                        <span>5 stars</span>
                      </div>
                    </div>
                    {errors.rating && touched.rating && (
                      <p className="!text-red-500 text-sm mt-1">{errors.rating}</p>
                    )}
                  </div>

                  <Field
                    as="textarea"
                    name="comment"
                    placeholder="Write your review here..."
                    rows={4}
                    className={`w-full p-2 border ${
                      errors.comment && touched.comment ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.comment && touched.comment && (
                    <p className="!text-red-500 text-sm mt-1">{errors.comment}</p>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      className="rounded-lg normal-case !text-gray-700"
                      onClick={() => setReviewDialogOpen(false)}
                      disabled={isSubmitting || reviewLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg normal-case !bg-blue-600 hover:!bg-blue-700 !text-white"
                      disabled={isSubmitting || reviewLoading}
                    >
                      {reviewLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 !border-t-2 !border-b-2 !border-white"></div>
                      ) : 'Submit Review'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReservationDetail