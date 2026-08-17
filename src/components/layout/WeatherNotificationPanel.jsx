import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloudSun, Sun, CloudRain, CloudLightning, Wind,
  X, ChevronRight, Droplets, MapPin
} from 'lucide-react'
import { Link } from 'react-router-dom'

const DEFAULT_ALERTS = [
  {
    id: 'w-1',
    city: 'Hyderabad',
    temp: 29,
    condition: 'Sunny & Clear',
    advisory: 'Optimal sightseeing weather. Perfect for Charminar & Golconda Fort tour.',
    type: 'optimal',
    humidity: 48,
    wind: '12 km/h',
    time: 'Just now',
    read: false,
  },
  {
    id: 'w-2',
    city: 'Mumbai',
    temp: 28,
    condition: 'Pleasant Breeze',
    advisory: 'Great evening conditions along Marine Drive and Gateway of India.',
    type: 'optimal',
    humidity: 65,
    wind: '18 km/h',
    time: '15m ago',
    read: false,
  },
  {
    id: 'w-3',
    city: 'Goa',
    temp: 27,
    condition: 'Light Coastal Rain',
    advisory: 'Brief showers expected near coastal belt. Carry an umbrella or light jacket.',
    type: 'warning',
    humidity: 78,
    wind: '22 km/h',
    time: '1h ago',
    read: false,
  },
  {
    id: 'w-4',
    city: 'Warangal',
    temp: 31,
    condition: 'Warm & Sunny',
    advisory: 'Ideal morning tour timing for Thousand Pillar Temple & Warangal Fort.',
    type: 'info',
    humidity: 42,
    wind: '10 km/h',
    time: '2h ago',
    read: true,
  },
]

export function WeatherNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('voyager_weather_alerts')
      return saved ? JSON.parse(saved) : DEFAULT_ALERTS
    } catch {
      return DEFAULT_ALERTS
    }
  })
  const panelRef = useRef(null)

  const unreadCount = alerts.filter((a) => !a.read).length

  useEffect(() => {
    localStorage.setItem('voyager_weather_alerts', JSON.stringify(alerts))
  }, [alerts])

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  const markRead = (id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  const getWeatherIcon = (condition) => {
    const c = condition.toLowerCase()
    if (c.includes('rain') || c.includes('shower')) return <CloudRain className="h-5 w-5 text-blue-400" />
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="h-5 w-5 text-amber-400" />
    if (c.includes('cloud')) return <CloudSun className="h-5 w-5 text-slate-400" />
    if (c.includes('breeze') || c.includes('wind')) return <Wind className="h-5 w-5 text-cyan-400" />
    return <Sun className="h-5 w-5 text-amber-400" />
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-700 dark:text-slate-300 active:scale-95"
        aria-label="Weather notifications"
      >
        <CloudSun className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-[9px] font-black text-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute right-0 mt-3 w-[min(90vw,380px)] glass-strong rounded-3xl shadow-2xl border border-white/30 dark:border-white/10 overflow-hidden z-50 flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <CloudSun className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Weather Advisories</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Live destination atmospheric updates</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline px-2 py-1"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-white/5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => markRead(alert.id)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    alert.read
                      ? 'bg-slate-50/40 dark:bg-slate-900/20 opacity-75 hover:opacity-100'
                      : 'glass border border-brand-500/20 bg-brand-500/5 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 shadow-sm shrink-0">
                        {getWeatherIcon(alert.condition)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-brand-500" />
                            {alert.city}
                          </span>
                          {!alert.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {alert.condition}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {alert.temp}°C
                      </span>
                      <p className="text-[9px] text-slate-400">{alert.time}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                    {alert.advisory}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-400" /> Humidity {alert.humidity}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3 text-cyan-400" /> Wind {alert.wind}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 text-center">
              <Link
                to="/destinations"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                View all destination forecasts <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
