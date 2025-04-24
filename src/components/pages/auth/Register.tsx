import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage, FieldProps, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useAuthStore } from '../../../stores/authStore'
import { RegisterFormValues } from '../../../types'

const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required'),
  lastName: Yup.string()
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\-() ]+$/, 'Invalid phone number')
    .required('Phone number is required'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
})

export function Register() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuthStore()
  const [success, setSuccess] = useState<string | null>(null)

  const initialValues: RegisterFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    acceptTerms: false
  }

  const handleSubmit = async (values: RegisterFormValues, { setSubmitting }: FormikHelpers<RegisterFormValues>) => {
    try {
      await register(
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        values.phoneNumber,
        values.confirmPassword  // Pass confirmPassword to register function
      )

      // If we reach this point, registration was successful
      setSuccess('Registration successful! You can now login.')

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      // Error handling is done in the auth store
      console.error('Registration error:', err)
      // Don't navigate on error - the error will be displayed in the UI via the authStore error state
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50">
      <div className="max-w-xl w-full">
        <div className="p-8 sm:p-10 rounded-2xl shadow-xl bg-white border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Join our reservation platform to start booking resources
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-800 shadow-sm border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-100 p-4 text-sm text-green-800 shadow-sm border border-green-100">
              {success}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors, values }) => (
              <Form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      First Name
                    </label>
                    <Field name="firstName">
                      {({ field }: FieldProps) => (
                        <div>
                          <input
                            {...field}
                            type="text"
                            id="firstName"
                            placeholder="First name"
                            className={`w-full px-4 py-2 border ${
                              touched.firstName && errors.firstName
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                          />
                          {touched.firstName && errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Last Name
                    </label>
                    <Field name="lastName">
                      {({ field }: FieldProps) => (
                        <div>
                          <input
                            {...field}
                            type="text"
                            id="lastName"
                            placeholder="Last name"
                            className={`w-full px-4 py-2 border ${
                              touched.lastName && errors.lastName
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                          />
                          {touched.lastName && errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Email Address
                    </label>
                    <Field name="email">
                      {({ field }: FieldProps) => (
                        <div>
                          <input
                            {...field}
                            type="email"
                            id="email"
                            placeholder="Email address"
                            className={`w-full px-4 py-2 border ${
                              touched.email && errors.email
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                          />
                          {touched.email && errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Phone Number
                    </label>
                    <Field name="phoneNumber">
                      {({ field }: FieldProps) => (
                        <div>
                          <input
                            {...field}
                            type="tel"
                            id="phoneNumber"
                            placeholder="Phone number"
                            className={`w-full px-4 py-2 border ${
                              touched.phoneNumber && errors.phoneNumber
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                          />
                          {touched.phoneNumber && errors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Password
                    </label>
                    <Field name="password">
                      {({ field }: FieldProps) => (
                        <div>
                          <input
                            {...field}
                            type="password"
                            id="password"
                            placeholder="Password"
                            className={`w-full px-4 py-2 border ${
                              touched.password && errors.password
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                          />
                          {touched.password && errors.password ? (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                          ) : (
                            <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Confirm Password
                    </label>
                    <Field name="confirmPassword">
                      {({ field }: FieldProps) => (
                        <div>
                          <input
                            {...field}
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm password"
                            className={`w-full px-4 py-2 border ${
                              touched.confirmPassword && errors.confirmPassword
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                          />
                          {touched.confirmPassword && errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center">
                    <Field name="acceptTerms">
                      {({ field }: FieldProps) => (
                        <input
                          type="checkbox"
                          {...field}
                          id="acceptTerms"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    </Field>
                    <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                      I accept the <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">terms and conditions</Link>
                    </label>
                  </div>
                  {touched.acceptTerms && errors.acceptTerms && (
                    <p className="mt-1 text-xs text-red-600 ml-2">
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={`w-full py-3 mt-8 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg ${
                    isSubmitting || loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {(isSubmitting || loading) ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 no-underline transition-colors duration-200 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}