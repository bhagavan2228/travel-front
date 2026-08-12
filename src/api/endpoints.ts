import { api, getData, postData } from './client'
import type {
  AuthResponse,
  Destination,
  Trip,
  Review,
  EventItem,
  CredibilityItem,
  Notification,
  ChatMessage,
  PageResponse,
  Restaurant,
  MenuItem,
  Booking,
  Hotel,
} from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const authApi = {
  register: (body: { email: string; password: string; fullName: string }) =>
    postData<AuthResponse, typeof body>('/auth/register', body),
  login: (body: { email: string; password: string }) =>
    postData<AuthResponse, typeof body>('/auth/login', body),
}

export const destinationApi = {
  getAll: () => getData<Destination[]>('/destinations'),
  getById: (id: number) => getData<Destination>(`/destinations/${id}`),
  search: (q: string) => getData<Destination[]>(`/destinations/search?q=${encodeURIComponent(q)}`),
  getRestaurants: (id: number, page = 0) =>
    getData<PageResponse<Restaurant>>(`/destinations/${id}/restaurants?page=${page}`),
  getEvents: (id: number) => getData<EventItem[]>(`/destinations/${id}/events`),
  getHotels: (id: number) => getData<Hotel[]>(`/destinations/${id}/hotels`),
  getReviews: (id: number) => getData<Review[]>(`/destinations/${id}/reviews`),
  createReview: (id: number, body: { rating: number; title: string; body: string }) =>
    postData<Review, typeof body>(`/destinations/${id}/reviews`, body),
}

export const weatherApi = {
  getByDestination: (id: number) => getData<any>(`/weather/destination/${id}`),
  getByTrip: (id: number) => getData<any>(`/weather/trip/${id}`),
}

export const commentApi = {
  report: (id: number, body: { reason: string; description: string }) =>
    postData<unknown, typeof body>(`/comments/${id}/report`, body),
}

export const tripApi = {
  getAll: () => getData<Trip[]>('/trips'),
  create: (body: {
    title: string
    destinationId: number
    startDate: string
    endDate: string
    notes?: string
  }) => postData<Trip, typeof body>('/trips', body),
  delete: async (id: number) => {
    await api.delete(`/trips/${id}`)
  },
}

export const credibilityApi = {
  leaderboard: () => getData<CredibilityItem[]>('/credibility/leaderboard'),
}

export const notificationApi = {
  getAll: () => getData<Notification[]>('/notifications'),
  markRead: async (id: number) => {
    await api.patch(`/notifications/${id}/read`)
  },
}

export const assistantApi = {
  chat: (body: { message: string; sessionId?: string; destinationId?: number }) =>
    postData<ChatMessage, typeof body>('/assistant/chat', body),
  chatStream: async (body: { message: string; sessionId?: string; destinationId?: number }, token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Stream failed')
    return res.body
  }
}

export const toxicityApi = {
  check: (text: string) =>
    postData<{ score: number; blocked: boolean; warning: boolean }, { text: string }>(
      '/toxicity/check',
      { text }
    ),
}

export const bookingApi = {
  getByTrip: (tripId: number) => getData<Booking[]>(`/bookings/trip/${tripId}`),
  create: (body: {
    tripId: number
    type: 'FLIGHT' | 'HOTEL' | 'CAR_RENTAL' | 'ACTIVITY' | 'TRAIN'
    provider?: string
    price?: number
    details?: string
  }) => postData<Booking, typeof body>('/bookings', body),
}
