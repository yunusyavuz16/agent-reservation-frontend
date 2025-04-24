import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useResourceStore } from '../../../stores/resourceStore'
import { Resource } from '../../../types'

// Extend Resource type with the missing properties
interface ExtendedResource extends Resource {
  type?: string;
  averageRating?: number;
  numberOfReviews?: number;
  availability?: string;
}

function ResourceList() {
  const { resources, fetchResources, loading, error } = useResourceStore()
  const [filteredResources, setFilteredResources] = useState<ExtendedResource[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(8)

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  // Filter resources based on search term and type filter
  useEffect(() => {
    let result = [...resources] as ExtendedResource[]

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(resource => resource.type === typeFilter)
    }

    // Apply search term (search in name or description)
    if (searchTerm) {
      result = result.filter(
        resource =>
          resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredResources(result)
  }, [resources, searchTerm, typeFilter])

  // Get all unique resource types
  const resourceTypes = Array.from(new Set((resources as ExtendedResource[]).map(resource => resource.type).filter(Boolean)))

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(1)
  }

  // Handle type filter change
  const handleTypeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(event.target.value)
    setPage(1)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const paginatedResources = filteredResources.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  // Helper function for rendering star ratings
  const renderStarRating = (rating?: number) => {
    const ratingValue = rating ? Math.round(rating) : 0;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${
              star <= ratingValue
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
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
          {error}
        </div>
        <button
          onClick={() => fetchResources()}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Available Resources
        </h1>
        <p className="text-gray-600">
          Browse and reserve resources for your needs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
        <div className="relative w-full sm:w-auto sm:flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search resources"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-44">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="w-full py-2 pl-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Types</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {paginatedResources.length > 0 ? (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {paginatedResources.map(resource => (
              <div key={resource.id} className="bg-white rounded-xl overflow-hidden shadow transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 flex flex-col h-full">
                <div className="relative">
                  <img
                    src={resource.imageUrl || "https://via.placeholder.com/300x160?text=Resource"}
                    alt={resource.name}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white bg-opacity-90 px-2 py-1 rounded-md shadow-sm text-xs font-medium">
                      {resource.type || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="flex-grow px-6 py-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 truncate">
                    {resource.name}
                  </h2>

                  {resource.averageRating !== undefined && (
                    <div className="flex items-center gap-1 mb-3">
                      {renderStarRating(resource.averageRating)}
                      <span className="text-gray-500 text-sm">
                        {resource.averageRating.toFixed(1)} ({resource.numberOfReviews || 0})
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 mb-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600 truncate">
                      {resource.location || "Location not specified"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {resource.availability === 'Available' ? (
                      <span className="text-green-600">Available Now</span>
                    ) : (
                      <span className="text-amber-600">Limited Availability</span>
                    )}
                  </div>

                  <p className="text-gray-500 line-clamp-2">
                    {resource.description || "No description available"}
                  </p>
                </div>

                <div className="px-6 py-4 border-t border-gray-100">
                  <Link to={`/resources/${resource.id}`} className="w-full no-underline">
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center my-6">
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    page === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">First</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Show current page, first and last page, and one page before and after current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= page - 1 && pageNumber <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                          page === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } border`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === page - 2 ||
                    pageNumber === page + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    page === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Last</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl shadow-sm bg-white mt-4">
          <div className="max-w-md mx-auto">
            <h2 className="font-bold text-xl text-gray-800 mb-2">
              No resources found
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'There are no resources available at the moment.'}
            </p>
            {(searchTerm || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceList