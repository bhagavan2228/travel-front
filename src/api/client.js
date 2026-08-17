import axios from 'axios'

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
          const { data } = await axios.post(
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

export async function getData(url) {
  const { data } = await api.get(url)
  return data.data
}

export async function postData(url, body) {
  const { data } = await api.post(url, body)
  return data.data
}
