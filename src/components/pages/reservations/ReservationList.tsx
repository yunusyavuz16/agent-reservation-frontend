import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  TablePagination,
  SelectChangeEvent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import { format } from 'date-fns'
import { useReservationStore } from '../../../stores/reservationStore'
import { Reservation } from '../../../types'

function ReservationList() {
  const { userReservations, fetchUserReservations, loading, error } = useReservationStore()
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Fetch reservations on component mount
  useEffect(() => {
    fetchUserReservations()
  }, [fetchUserReservations])

  // Filter reservations based on search term and status filter
  useEffect(() => {
    let result = [...userReservations]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(reservation => reservation.status === statusFilter)
    }

    // Apply search term (search in resource name if available)
    if (searchTerm) {
      result = result.filter(
        reservation =>
          reservation.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `#${reservation.id}`.includes(searchTerm)
      )
    }

    setFilteredReservations(result)
  }, [userReservations, searchTerm, statusFilter])

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value)
    setPage(0)
  }

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Cancelled':
        return 'error'
      case 'Completed':
        return 'info'
      default:
        return 'default'
    }
  }

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => fetchUserReservations()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Reservations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your resource reservations
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            placeholder="Search by resource name or ID"
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              displayEmpty
              startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Link to="/reservations/create" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">
              New Reservation
            </Button>
          </Link>
        </Box>
      </Paper>

      {/* Reservations Table */}
      {filteredReservations.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReservations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((reservation) => (
                    <TableRow key={reservation.id} hover>
                      <TableCell>#{reservation.id}</TableCell>
                      <TableCell>{reservation.resourceName || 'Unknown Resource'}</TableCell>
                      <TableCell>
                        {format(new Date(reservation.startTime), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(reservation.endTime), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={reservation.status}
                          color={getStatusColor(reservation.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Link to={`/reservations/${reservation.id}`} style={{ textDecoration: 'none' }}>
                          <Button variant="outlined" size="small">
                            Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredReservations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No reservations found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'You have no reservations yet. Create a new one to get started.'}
          </Typography>
          <Link to="/resources" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">
              Browse Resources
            </Button>
          </Link>
        </Paper>
      )}
    </Container>
  )
}

export default ReservationList