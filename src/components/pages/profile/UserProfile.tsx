import React, { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <div className="p-6">{children}</div>}
    </div>
  )
}

const UserProfile: React.FC = () => {
  const { user, loading, error } = useAuthStore()

  const [tabValue, setTabValue] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  })
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm({
      ...profileForm,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Here you would call an API to update the user profile
      // await updateUserProfile(profileForm)

      setUpdateSuccess(true)
      setEditMode(false)

      setTimeout(() => {
        setUpdateSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || ''
    })
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
          {error || 'Failed to load user profile. Please try again later.'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-600 mr-4 flex items-center justify-center text-white text-xl font-bold">
            {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">
              {user.email}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => handleTabChange(0)}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                tabValue === 0
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                tabValue === 1
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => handleTabChange(2)}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                tabValue === 2
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferences
            </button>
          </nav>
        </div>

        {/* Profile Information Tab */}
        <TabPanel value={tabValue} index={0}>
          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
              Profile successfully updated!
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 relative"
          >
            {!editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="absolute right-0 top-0 flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border ${
                    !editMode ? 'bg-gray-100 border-gray-200' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border ${
                    !editMode ? 'bg-gray-100 border-gray-200' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileForm.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border ${
                    !editMode ? 'bg-gray-100 border-gray-200' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border ${
                    !editMode ? 'bg-gray-100 border-gray-200' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>

              {editMode && (
                <div className="sm:col-span-2 flex justify-end gap-4 mt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Security Settings
          </h2>

          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-800 mb-2">
              Change Password
            </h3>
            <div className="border-t border-gray-200 mb-4"></div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <button className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Update Password
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-800 mb-2">
              Two-Factor Authentication
            </h3>
            <div className="border-t border-gray-200 mb-4"></div>
            <p className="text-gray-600 mb-4">
              Two-factor authentication is currently disabled.
            </p>
            <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Enable Two-Factor Authentication
            </button>
          </div>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={2}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preferences
          </h2>

          <div>
            <h3 className="text-md font-medium text-gray-800 mb-2">
              Notification Settings
            </h3>
            <div className="border-t border-gray-200 mb-4"></div>
            <p className="text-gray-600">
              Notification settings coming soon...
            </p>
          </div>
        </TabPanel>
      </div>
    </div>
  )
}

export default UserProfile