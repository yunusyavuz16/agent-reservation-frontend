import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useAuthStore } from '../../../stores/authStore'

interface RegisterFormValues {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export function Register() {
  const navigate = useNavigate()
  const { register, loading, error: authError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Passwords must match')
      .required('Confirm password is required'),
    acceptTerms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
      .required('You must accept the terms and conditions')
  })

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phoneNumber,
          password: values.password
        })
        setRegistrationSuccess(true)
        // Redirect to login after success
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } catch (error) {
        console.error('Registration error:', error)
      }
    }
  })

  const { handleSubmit, handleChange, handleBlur, values, errors, touched } = formik

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 !bg-gradient-to-br !from-blue-50 !via-gray-50 !to-indigo-50">
      <div className="w-full max-w-lg">
        <div className="p-8 sm:p-10 rounded-2xl shadow-xl !bg-white !border !border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold !text-gray-900 tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-sm !text-gray-600 mt-2">
              Join our platform and start making reservations
            </p>
          </div>

          {authError && (
            <div className="mb-6 rounded-lg !bg-red-100 p-4 text-sm !text-red-800 shadow-sm !border !border-red-100">
              {authError}
            </div>
          )}

          {registrationSuccess && (
            <div className="mb-6 rounded-lg !bg-green-100 p-4 text-sm !text-green-800 shadow-sm !border !border-green-100">
              Registration successful! Redirecting to login page...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 !border ${
                    touched.firstName && errors.firstName
                    ? '!border-red-500 !bg-red-50'
                    : '!border-gray-300 !bg-white'
                  } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
                />
                {touched.firstName && errors.firstName && (
                  <p className="mt-1 text-sm !text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 !border ${
                    touched.lastName && errors.lastName
                    ? '!border-red-500 !bg-red-50'
                    : '!border-gray-300 !bg-white'
                  } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
                />
                {touched.lastName && errors.lastName && (
                  <p className="mt-1 text-sm !text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full px-4 py-3 !border ${
                  touched.email && errors.email
                  ? '!border-red-500 !bg-red-50'
                  : '!border-gray-300 !bg-white'
                } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-sm !text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={values.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full px-4 py-3 !border ${
                  touched.phoneNumber && errors.phoneNumber
                  ? '!border-red-500 !bg-red-50'
                  : '!border-gray-300 !bg-white'
                } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="mt-1 text-sm !text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="password" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 !border ${
                    touched.password && errors.password
                    ? '!border-red-500 !bg-red-50'
                    : '!border-gray-300 !bg-white'
                  } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
                />
                {touched.password && errors.password && (
                  <p className="mt-1 text-sm !text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs !text-gray-500">Password must be at least 6 characters</p>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 !border ${
                    touched.confirmPassword && errors.confirmPassword
                    ? '!border-red-500 !bg-red-50'
                    : '!border-gray-300 !bg-white'
                  } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-sm !text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="mt-4 !bg-gray-50 p-4 rounded-lg !border !border-gray-100 shadow-sm">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={values.acceptTerms}
                    onChange={handleChange}
                    className="h-4 w-4 !text-blue-600 focus:!ring-blue-500 !border-gray-300 rounded"
                  />
                </div>
                <div className="ml-2">
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm !text-gray-700">
                    I accept the <Link to="/terms" className="!text-blue-600 hover:!text-blue-800 font-medium transition-colors duration-200">terms and conditions</Link>
                  </label>
                  {touched.acceptTerms && errors.acceptTerms && (
                    <p className="mt-1 text-xs !text-red-600 ml-2">
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  loading
                  ? '!bg-blue-400 cursor-not-allowed'
                  : '!bg-blue-600 hover:!bg-blue-700 !text-white'
                }`}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 !border-t-2 !border-b-2 !border-white"></div>
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 !border-t !border-gray-200 text-center">
            <p className="!text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium !text-blue-600 hover:!text-blue-500 no-underline transition-colors duration-200 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}