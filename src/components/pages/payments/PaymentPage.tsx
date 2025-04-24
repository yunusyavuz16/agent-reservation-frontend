import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReservationStore } from '../../../stores/reservationStore'
import { usePaymentStore } from '../../../stores/paymentStore'

interface PaymentFormData {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  paymentMethod: string;
}

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>()
  const navigate = useNavigate()

  const { selectedReservation, fetchReservationById } = useReservationStore()
  const { loading: paymentLoading, error: paymentError, processPayment } = usePaymentStore()

  const [formData, setFormData] = useState<PaymentFormData>({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit'
  })

  const [formErrors, setFormErrors] = useState<Partial<PaymentFormData>>({})
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (reservationId) {
      fetchReservationById(parseInt(reservationId))
    }
  }, [reservationId, fetchReservationById])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear error when field is updated
    setFormErrors({
      ...formErrors,
      [name]: undefined
    })
  }

  const validateForm = () => {
    const errors: Partial<PaymentFormData> = {}

    if (!formData.cardName.trim()) {
      errors.cardName = 'Name on card is required'
    }

    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required'
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Please enter a valid card number'
    }

    if (!formData.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required'
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)'
    }

    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required'
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'Please enter a valid CVV'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !selectedReservation) return

    try {
      await processPayment({
        reservationId: selectedReservation.id,
        amount: selectedReservation.price || 0,
        currency: 'USD',
        paymentMethod: formData.paymentMethod
      })

      setPaymentSuccess(true)

      // After successful payment, wait 2 seconds then navigate to reservation details
      setTimeout(() => {
        navigate(`/reservations/${reservationId}`)
      }, 2000)
    } catch (error) {
      console.error('Payment processing error:', error)
    }
  }

  if (!selectedReservation && !paymentLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="p-4 !bg-red-100 !text-red-800 rounded-lg !border !border-red-200">
          Reservation not found
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="p-8 text-center !bg-white rounded-xl shadow">
          <div className="mb-6 p-4 !bg-green-100 !text-green-800 rounded-lg !border !border-green-200">
            Payment successful! Redirecting to your reservation details...
          </div>
          <div className="animate-spin rounded-full h-10 w-10 !border-t-2 !border-b-2 !border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="p-6 md:p-8 !bg-white rounded-xl shadow">
        <h1 className="text-xl font-bold !text-gray-900 mb-4">
          Complete Your Payment
        </h1>

        {paymentError && (
          <div className="mb-6 p-4 !bg-red-100 !text-red-800 rounded-lg !border !border-red-200">
            {paymentError}
          </div>
        )}

        {paymentLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 !border-t-2 !border-b-2 !border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Reservation Summary */}
            <div className="md:col-span-5">
              <div className="!border !border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold !text-gray-900 mb-4">
                  Reservation Summary
                </h2>
                <div className="mb-4">
                  <p className="text-sm !text-gray-500">
                    Resource
                  </p>
                  <p className="!text-gray-900">
                    {selectedReservation?.resourceName}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm !text-gray-500">
                    Date & Time
                  </p>
                  <p className="!text-gray-900">
                    {selectedReservation?.startTime && new Date(selectedReservation.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="my-4 !border-t !border-gray-200"></div>
                <div className="mb-2">
                  <p className="text-sm !text-gray-500">
                    Amount to Pay
                  </p>
                  <p className="text-xl font-semibold !text-blue-600">
                    ${selectedReservation?.price?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="md:col-span-7">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="paymentMethod" className="block text-sm font-medium !text-gray-700">
                    Payment Method
                  </label>
                  <div className="mt-1">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit"
                      checked={formData.paymentMethod === 'credit'}
                      onChange={handleChange}
                      className="form-radio"
                    />
                    <label htmlFor="paymentMethod" className="ml-2">
                      Credit/Debit Card
                    </label>
                  </div>
                  <div className="mt-1">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      className="form-radio"
                      disabled
                    />
                    <label htmlFor="paymentMethod" className="ml-2">
                      PayPal
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label htmlFor="cardName" className="block text-sm font-medium !text-gray-700">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md !border ${formErrors.cardName ? '!border-red-500 !bg-red-50' : '!border-gray-300 !bg-white'}`}
                    />
                    {formErrors.cardName && (
                      <p className="!text-red-500 text-xs mt-1">{formErrors.cardName}</p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="cardNumber" className="block text-sm font-medium !text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md !border ${formErrors.cardNumber ? '!border-red-500 !bg-red-50' : '!border-gray-300 !bg-white'}`}
                      placeholder="1234 5678 9012 3456"
                    />
                    {formErrors.cardNumber && (
                      <p className="!text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="expiryDate" className="block text-sm font-medium !text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md !border ${formErrors.expiryDate ? '!border-red-500 !bg-red-50' : '!border-gray-300 !bg-white'}`}
                      placeholder="MM/YY"
                    />
                    {formErrors.expiryDate && (
                      <p className="!text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="cvv" className="block text-sm font-medium !text-gray-700">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md !border ${formErrors.cvv ? '!border-red-500' : '!border-gray-300'}`}
                      placeholder="123"
                    />
                    {formErrors.cvv && (
                      <p className="!text-red-500 text-xs mt-1">{formErrors.cvv}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 !border !border-transparent text-sm font-medium rounded-md !text-white !bg-blue-600 hover:!bg-blue-700 focus:outline-none focus:ring-2 focus:!ring-blue-500"
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 !border-t-2 !border-b-2 !border-white"></div>
                    ) : (
                      `Pay $${selectedReservation?.price?.toFixed(2) || '0.00'}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentPage