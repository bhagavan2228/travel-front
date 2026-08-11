import axios from 'axios'
import type { ApiResponse } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refreshToken')
      if (refresh && !error.config._retry) {
        error.config._retry = true
        try {
          const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
            `${API_BASE}/auth/refresh`,
            { refreshToken: refresh }
          )
          if (data.success && data.data.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken)
            error.config.headers.Authorization = `Bearer ${data.data.accessToken}`
            return api(error.config)
          }
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
    }
    return Promise.reject(error)
  }
)

export async function getData<T>(url: string): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url)
  return data.data
}

export async function postData<T, B>(url: string, body: B): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body)
  return data.data
}
