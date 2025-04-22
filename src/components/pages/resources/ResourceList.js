import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

// MUI Components
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const ResourceList = () => {
  const { auth } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('http://localhost:5000/api/Resource', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        setResources(response.data);
        setFilteredResources(response.data);

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(resource => resource.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [auth.token]);

  // Filter resources based on search and category
  useEffect(() => {
    let result = resources;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        resource =>
          resource.name.toLowerCase().includes(searchLower) ||
          resource.description.toLowerCase().includes(searchLower) ||
          resource.location.toLowerCase().includes(searchLower)
      );
    }

    if (categoryFilter) {
      result = result.filter(resource => resource.category === categoryFilter);
    }

    setFilteredResources(result);
  }, [search, categoryFilter, resources]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
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
    );
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

          {/* Reset Filters */}
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={resetFilters}
              disabled={!search && !categoryFilter}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {filteredResources.length > 0 ? (
        <Grid container spacing={3}>
          {filteredResources.map(resource => (
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
                      label={resource.isAvailable ? 'Available' : 'Unavailable'}
                      size="small"
                      color={resource.isAvailable ? 'success' : 'error'}
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
                    disabled={!resource.isAvailable}
                  >
                    Reserve
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
  );
};

export default ResourceList;