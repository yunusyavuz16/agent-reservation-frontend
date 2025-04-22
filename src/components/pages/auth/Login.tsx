import React, { useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuthStore } from '../../../stores/authStore'
import { LoginFormValues } from '../../../types'

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
  const [showPassword, setShowPassword] = React.useState(false)

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
    <Container maxWidth="sm" className="min-h-screen flex items-center justify-center">
      <Paper elevation={3} className="p-8 w-full">
        <Box className="text-center mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-primary">
            Sign In
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mt-2">
            Access your reservation account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <Box className="mb-4">
                <Field
                  as={TextField}
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  variant="outlined"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Box>

              <Box className="mb-6">
                <Field
                  as={TextField}
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting || loading}
                className="mb-4"
              >
                {(isSubmitting || loading) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>
          )}
        </Formik>

        <Box className="text-center mt-4">
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create Account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}