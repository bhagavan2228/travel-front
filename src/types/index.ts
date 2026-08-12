export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  email: string
  fullName: string
  role: string
}

export interface Destination {
  id: number
  name: string
  city: string
  country: string
  state?: string
  latitude?: number
  longitude?: number
  description: string
  imageUrl?: string
  climate?: string
  bestSeason?: string
  tags?: string
  exploredCount?: number
}

export interface Trip {
  id: number
  title: string
  destination: Destination
  startDate: string
  endDate: string
  status: string
  notes?: string
}

export interface Review {
  id: number
  userId: number
  userName?: string
  userCredibilityScore?: number
  destinationId: number
  rating: number
  title: string
  body: string
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface Restaurant {
  id: number
  destinationId: number
  name: string
  googlePlaceId: string
  cuisine: string
  rating: number
  userRatingsTotal: number
  address: string
  latitude: number
  longitude: number
  priceLevel: string
  website: string
  googleMapsUri: string
  businessStatus: string
  imageUrl?: string
}

export interface EventItem {
  id?: number
  name: string
  description: string
  date: string
  category: string
  venue?: string
}

export interface CredibilityItem {
  userId: number
  userName: string
  score: number
  helpfulReviews: number
  reportsResolved: number
  totalReviews: number
  rank: number
}

export interface Notification {
  id: number
  type: string
  message: string
  read: boolean
  sentAt: string
}

export interface ChatMessage {
  reply: string
  sessionId?: string
  suggestions?: string[]
}

export interface Booking {
  id: number
  tripId: number
  type: 'FLIGHT' | 'HOTEL' | 'CAR_RENTAL' | 'ACTIVITY' | 'TRAIN'
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  provider: string
  confirmationCode: string
  price: number
  details: string
  createdAt: string
}

export interface Hotel {
  id: number
  name: string
  imageUrl: string
  rating: string | number
  price: number
  vacancies: number
  reviews: string[]
}
