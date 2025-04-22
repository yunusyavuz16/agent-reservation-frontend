// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  profileImageUrl?: string | null
  role: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

// Resource types
export interface Resource {
  id: number
  name: string
  description: string
  location: string
  category: string
  imageUrl?: string
  isAvailable: boolean
  hourlyRate?: number
  dailyRate?: number
  capacity: number
  maxReservationHours?: number
  rules?: string
  createdAt: string
  updatedAt?: string
  isActive: boolean
  isAvailableNow?: boolean
  nextAvailableTime?: string
  averageRating?: number
}

// Reservation types
export interface Reservation {
  id: number
  resourceId: number
  resourceName?: string
  userId: string
  userName?: string
  startTime: string
  endTime: string
  description?: string
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
  notes?: string
  isPaid: boolean
  price?: number
  createdAt: string
  updatedAt?: string
  attendees: number
  isRecurring: boolean
  recurrencePattern?: string
  recurrenceInterval?: number
  recurrenceEndDate?: string
  paymentDetails?: Payment
  reviews?: Review[]
  averageRating?: number
  resourceCapacity?: number
  resourceImageUrl?: string
  resourceLocation?: string
}

// Review types
export interface Review {
  id: number
  reservationId: number
  userId: string
  userName?: string
  rating: number
  comment: string
  resourceId?: number
  resourceName?: string
  createdAt: string
  updatedAt?: string
}

// Payment types
export interface Payment {
  id: number
  reservationId: number
  amount: number
  currency: string
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
  transactionId: string
  paymentMethod: string
  createdAt: string
  updatedAt?: string
}

// Notification types
export interface Notification {
  id: number
  userId: string
  title: string
  message: string
  type: string
  reservationId?: number
  isRead: boolean
  createdAt: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

// Form submission types
export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
  acceptTerms: boolean
}

export interface ReservationFormValues {
  resourceId: number
  startTime: string
  endTime: string
  description?: string
  attendees?: number
  isRecurring?: boolean
  recurrencePattern?: string
  recurrenceInterval?: number
  recurrenceEndDate?: string
}

export interface CreateReservationFormValues {
  resourceId: number
  startTime: Date
  endTime: Date
  description?: string
  attendees: number
  isRecurring: boolean
  recurrencePattern: string
  recurrenceInterval: number
  recurrenceEndDate: Date
}

export interface ReviewFormValues {
  reservationId: number
  rating: number
  comment: string
}

export interface PaymentFormValues {
  reservationId: number
  amount: number
  currency: string
  paymentMethod: string
}

export interface DateRangeValues {
  startDate: Date
  endDate: Date
  resourceId?: number
}