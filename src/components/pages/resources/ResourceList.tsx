import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Slider,
  Pagination
} from '@mui/material'
import {
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material'
import { useResourceStore } from '../../../stores/resourceStore'

const ResourceList = () => {
  // State for filters and pagination
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [filteredResources, setFilteredResources] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    maxCapacity: undefined as number | undefined,
    maxHourlyRate: undefined as number | undefined,
    maxDailyRate: undefined as number | undefined,
    isAvailableNow: false
  })
  const [categories, setCategories] = useState<string[]>([])

  // Get resources data from the store
  const { resources, fetchResources, loading, error } = useResourceStore()

  // Resources per page
  const resourcesPerPage = 9

  // Fetch resources on mount
  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  // Extract unique categories from resources
  useEffect(() => {
    const uniqueCategories = [...new Set(resources.map(r => r.category))]
    setCategories(uniqueCategories)
  }, [resources])

  // Filter resources based on search, category, and other filters
  useEffect(() => {
    let result = [...resources]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        resource =>
          resource.name.toLowerCase().includes(searchLower) ||
          resource.description.toLowerCase().includes(searchLower) ||
          resource.location.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(resource => resource.category === categoryFilter)
    }

    // Apply capacity filter
    if (filters.maxCapacity !== undefined) {
      result = result.filter(resource => resource.capacity <= (filters.maxCapacity || Infinity))
    }

    // Apply price filters
    if (filters.maxHourlyRate !== undefined) {
      result = result.filter(resource =>
        resource.hourlyRate === null ||
        resource.hourlyRate <= (filters.maxHourlyRate || Infinity)
      )
    }
    if (filters.maxDailyRate !== undefined) {
      result = result.filter(resource =>
        resource.dailyRate === null ||
        resource.dailyRate <= (filters.maxDailyRate || Infinity)
      )
    }

    // Apply availability filter
    if (filters.isAvailableNow) {
      result = result.filter(resource => resource.isAvailableNow)
    }

    setFilteredResources(result)
    setPage(1)
  }, [resources, search, categoryFilter, filters])

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  // Handle category filter change
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCategoryFilter(event.target.value as string)
  }

  // Handle other filter changes
  const handleFilterChange = (filter: string, value: number | boolean) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }))
  }

  // Reset filters
  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setFilters({
      maxCapacity: undefined,
      maxHourlyRate: undefined,
      maxDailyRate: undefined,
      isAvailableNow: false
    })
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage)
  const currentResources = filteredResources.slice(
    (page - 1) * resourcesPerPage,
    page * resourcesPerPage
  )

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 4, color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <div className="resource-list">
      <Typography variant="h4" component="h1" gutterBottom>
        Available Resources
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search resources by name, description, or location..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Reset Filters Button */}
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={resetFilters}
              disabled={!search && !categoryFilter && !filters.maxCapacity && !filters.maxHourlyRate && !filters.maxDailyRate && !filters.isAvailableNow}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Advanced Filters
          </Typography>

          <Grid container spacing={3}>
            {/* Capacity Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" gutterBottom>
                Max Capacity
              </Typography>
              <Slider
                value={filters.maxCapacity || 50}
                onChange={(e, value) => handleFilterChange('maxCapacity', value as number)}
                min={1}
                max={100}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: '1' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100+' }
                ]}
              />
            </Grid>

            {/* Hourly Rate Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" gutterBottom>
                Max Hourly Rate ($)
              </Typography>
              <Slider
                value={filters.maxHourlyRate || 100}
                onChange={(e, value) => handleFilterChange('maxHourlyRate', value as number)}
                min={0}
                max={200}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '$0' },
                  { value: 100, label: '$100' },
                  { value: 200, label: '$200+' }
                ]}
              />
            </Grid>

            {/* Daily Rate Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" gutterBottom>
                Max Daily Rate ($)
              </Typography>
              <Slider
                value={filters.maxDailyRate || 500}
                onChange={(e, value) => handleFilterChange('maxDailyRate', value as number)}
                min={0}
                max={1000}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '$0' },
                  { value: 500, label: '$500' },
                  { value: 1000, label: '$1000+' }
                ]}
              />
            </Grid>

            {/* Availability Now Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <Button
                  variant={filters.isAvailableNow ? "contained" : "outlined"}
                  color={filters.isAvailableNow ? "primary" : "secondary"}
                  onClick={() => handleFilterChange('isAvailableNow', !filters.isAvailableNow)}
                  startIcon={<EventAvailableIcon />}
                >
                  {filters.isAvailableNow ? 'Available Now' : 'Show All'}
                </Button>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Resource Cards */}
      {currentResources.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {currentResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: '0.3s',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={resource.imageUrl || 'https://via.placeholder.com/300x140?text=Resource'}
                    alt={resource.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {resource.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {resource.location}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {resource.description?.length > 100
                        ? `${resource.description.substring(0, 100)}...`
                        : resource.description}
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={resource.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<EventAvailableIcon />}
                        label={resource.isAvailableNow ? 'Available' : 'Unavailable'}
                        size="small"
                        color={resource.isAvailableNow ? 'success' : 'error'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to={`/resources/${resource.id}`}
                      color="primary"
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      component={Link}
                      to={`/reservations/create?resourceId=${resource.id}`}
                      disabled={!resource.isAvailableNow}
                    >
                      Reserve
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            No resources found matching your search criteria.
          </Typography>
          <Button variant="outlined" color="primary" onClick={resetFilters}>
            Clear Filters
          </Button>
        </Box>
      )}
    </div>
  )
}

export default ResourceList