import React from 'react'
import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center py-16">
        <div className="!text-blue-500 mb-6">
          <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-6xl font-bold !text-gray-900 mb-2">404</h1>

        <h2 className="text-3xl font-semibold !text-gray-800 mb-4">Page Not Found</h2>

        <p className="text-lg !text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/" className="no-underline">
          <button className="px-6 py-3 !bg-blue-600 hover:!bg-blue-700 !text-white font-medium rounded-lg shadow-md transition-colors duration-300">
            Go to Home
          </button>
        </Link>
      </div>
    </div>
  )
}