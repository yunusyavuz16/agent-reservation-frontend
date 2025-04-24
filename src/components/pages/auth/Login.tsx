import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik'
import * as Yup from 'yup'
import { useAuthStore } from '../../../stores/authStore'
import { LoginFormValues } from '../../../types'
import { useNotificationStore } from '../../../stores/notificationStore'

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
})

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading, error } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const [showPassword, setShowPassword] = useState(false)

  // If user is already authenticated, redirect to homepage
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const initialValues: LoginFormValues = {
    email: '',
    password: ''
  }

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password)
      addNotification({
        id: Date.now().toString(),
        title: 'Login Successful',
        message: 'You have been logged in successfully.',
        type: 'success',
        duration: 5000
      })
      // Redirect happens in useEffect when isAuthenticated changes
    } catch (err) {
      // Error handling is done in the auth store
      console.error('Login error:', err)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 !bg-gradient-to-br !from-blue-50 !via-gray-50 !to-indigo-50">
      <div className="max-w-md w-full">
        <div className="!bg-white p-8 sm:p-10 rounded-2xl shadow-xl !border !border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold !text-gray-900 tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm !text-gray-600">
              Sign in to access your reservations
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg !bg-red-100 p-4 text-sm !text-red-800 shadow-sm !border !border-red-100">
              {error}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                    Email Address
                  </label>
                  <Field name="email">
                    {({ field }: FieldProps) => (
                      <div>
                        <input
                          {...field}
                          type="email"
                          id="email"
                          placeholder="Your email address"
                          className={`w-full px-4 py-2 !border ${
                            touched.email && errors.email
                              ? '!border-red-500 !bg-red-50'
                              : '!border-gray-300 !bg-white'
                          } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
                        />
                        {touched.email && errors.email && (
                          <p className="mt-1 text-sm !text-red-600">{errors.email}</p>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium !text-gray-700 mb-1 ml-1">
                    Password
                  </label>
                  <Field name="password">
                    {({ field }: FieldProps) => (
                      <div className="relative">
                        <input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          placeholder="Your password"
                          className={`w-full px-4 py-2 !border ${
                            touched.password && errors.password
                              ? '!border-red-500 !bg-red-50'
                              : '!border-gray-300 !bg-white'
                          } rounded-lg shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:outline-none`}
                        />
                        <button
                          type="button"
                          onClick={handleTogglePassword}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center !text-gray-500 hover:!text-gray-700"
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        {touched.password && errors.password && (
                          <p className="mt-1 text-sm !text-red-600">{errors.password}</p>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={`w-full py-3 mt-4 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg ${
                    isSubmitting || loading
                      ? '!bg-blue-400 cursor-not-allowed'
                      : '!bg-blue-600 hover:!bg-blue-700 !text-white'
                  }`}
                >
                  {(isSubmitting || loading) ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 !border-t-2 !border-b-2 !border-white"></div>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Add forgot password link */}
                <div className="text-center mt-2">
                  <Link to="/forgot-password" className="text-sm !text-gray-600 hover:!text-blue-600 transition-colors duration-200 no-underline hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <p className="!text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium !text-blue-600 hover:!text-blue-500 no-underline transition-colors duration-200 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}