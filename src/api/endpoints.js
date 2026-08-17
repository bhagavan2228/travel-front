import { api, getData, postData } from './client'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const authApi = {
  register: (body) => postData('/auth/register', body),
  login: (body) => postData('/auth/login', body),
}

export const destinationApi = {
  getAll: () => getData('/destinations'),
  getById: (id) => getData(`/destinations/${id}`),
  search: (q) => getData(`/destinations/search?q=${encodeURIComponent(q)}`),
  getRestaurants: (id, page = 0) =>
    getData(`/destinations/${id}/restaurants?page=${page}`),
  getEvents: (id) => getData(`/destinations/${id}/events`),
  getHotels: (id) => getData(`/destinations/${id}/hotels`),
  getReviews: (id) => getData(`/destinations/${id}/reviews`),
  createReview: (id, body) =>
    postData(`/destinations/${id}/reviews`, body),
}

export const weatherApi = {
  getByDestination: (id) => getData(`/weather/destination/${id}`),
  getByTrip: (id) => getData(`/weather/trip/${id}`),
}

export const commentApi = {
  report: (id, body) =>
    postData(`/comments/${id}/report`, body),
}

export const tripApi = {
  getAll: () => getData('/trips'),
  create: (body) => postData('/trips', body),
  delete: async (id) => {
    await api.delete(`/trips/${id}`)
  },
}

export const credibilityApi = {
  leaderboard: () => getData('/credibility/leaderboard'),
}

export const notificationApi = {
  getAll: () => getData('/notifications'),
  markRead: async (id) => {
    await api.patch(`/notifications/${id}/read`)
  },
}

export const assistantApi = {
  chat: (body) =>
    postData('/assistant/chat', body),
  chatStream: async (body, token) => {
    const headers = {
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
  check: (text) =>
    postData('/toxicity/check', { text }),
}

export const bookingApi = {
  getByTrip: (tripId) => getData(`/bookings/trip/${tripId}`),
  create: (body) => postData('/bookings', body),
}

export const flightApi = {
  search: (origin, destination, date, passengers) =>
    getData(`/flights/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}&passengers=${passengers}`),
}

export const hotelSearchApi = {
  search: (cityCode, checkIn, checkOut, adults) =>
    getData(`/hotels/search?cityCode=${encodeURIComponent(cityCode)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}`),
}

export const trainSearchApi = {
  search: (origin, destination, date) =>
    getData(`/trains/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`),
}

export const carSearchApi = {
  search: (location, pickupDate, dropoffDate) =>
    getData(`/cars/search?location=${encodeURIComponent(location)}&pickupDate=${encodeURIComponent(pickupDate)}&dropoffDate=${encodeURIComponent(dropoffDate)}`),
}
