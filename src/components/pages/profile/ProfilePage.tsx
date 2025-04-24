import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userStore from '../../../stores/userStore'
import { User } from '../../../types/User'
import { updateUserProfile } from '../../../services/userService'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser, setCurrentUser } = userStore()

  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    setFormData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
    })
  }, [currentUser, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser?.id) {
      setErrorMessage('User not found. Please log in again.')
      return
    }

    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const updatedUser = await updateUserProfile(currentUser.id, formData)
      setCurrentUser(updatedUser)
      setSuccessMessage('Profile updated successfully!')
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.')
      console.error('Profile update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="p-4 !bg-red-100 !text-red-800 rounded-lg !border !border-red-200">
          Please log in to view your profile
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="p-6 md:p-8 !bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold !text-gray-900 mb-6">Your Profile</h1>

        {successMessage && (
          <div className="mb-6 p-4 !bg-green-100 !text-green-800 rounded-lg !border !border-green-200">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 !bg-red-100 !text-red-800 rounded-lg !border !border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="firstName"
                className="block !text-gray-700 text-sm font-medium mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 !border !border-gray-300 rounded-md shadow-sm focus:outline-none focus:!ring-blue-500 focus:!border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block !text-gray-700 text-sm font-medium mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 !border !border-gray-300 rounded-md shadow-sm focus:outline-none focus:!ring-blue-500 focus:!border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block !text-gray-700 text-sm font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 !border !border-gray-300 rounded-md shadow-sm focus:outline-none focus:!ring-blue-500 focus:!border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block !text-gray-700 text-sm font-medium mb-2"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 !border !border-gray-300 rounded-md shadow-sm focus:outline-none focus:!ring-blue-500 focus:!border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 !bg-blue-600 !text-white rounded-md hover:!bg-blue-700 focus:outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-blue-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 !border-t-2 !border-b-2 !border-white mr-2"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage