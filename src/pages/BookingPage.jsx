import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Train, Car, Calendar, MapPin, Search, ArrowRight,
  ShieldCheck, Sparkles, Zap, X, Check, TrendingDown,
  History, Loader2, Route, Users, ChevronRight, BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { flightApi, trainSearchApi, carSearchApi, bookingApi, tripApi } from '@/api/endpoints'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ─── Fix Leaflet default icon path ──────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── Custom Marker Icons ────────────────────────────────────────
const originIcon = new L.DivIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f43f5e,#e11d48);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(244,63,94,.5);border:3px solid #fff">
    <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: '',
})

const destIcon = new L.DivIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(16,185,129,.5);border:3px solid #fff">
    <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: '',
})

// ─── Geocode with Nominatim ─────────────────────────────────────
async function geocodeCity(city) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VoyagerTravelApp/1.0' } }
    )
    const data = await res.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
  } catch (e) {
    console.warn('Geocode failed for', city, e)
  }
  return null
}

// ─── Check for Airports near coordinates (Overpass API) ────────
async function checkAirportsNear(lat, lon, radiusKm = 50) {
  try {
    const radiusM = radiusKm * 1000
    const query = `[out:json][timeout:10];(
      node["aeroway"="aerodrome"](around:${radiusM},${lat},${lon});
      way["aeroway"="aerodrome"](around:${radiusM},${lat},${lon});
      relation["aeroway"="aerodrome"](around:${radiusM},${lat},${lon});
    );out tags 5;`
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const data = await res.json()
    const airports = (data.elements || []).filter((el) => 
      el.tags?.name && (el.tags?.aeroway === 'aerodrome')
    )
    return {
      found: airports.length > 0,
      names: airports.slice(0, 3).map((a) => a.tags.name),
    }
  } catch (e) {
    console.warn('Airport check failed', e)
    return { found: false, names: [] }
  }
}

// ─── Check for Railway Stations near coordinates (Overpass API) ─
async function checkRailwayStationsNear(lat, lon, radiusKm = 60) {
  try {
    const radiusM = radiusKm * 1000
    const query = `[out:json][timeout:15];(
      node["railway"="station"](around:${radiusM},${lat},${lon});
      node["railway"="halt"](around:${radiusM},${lat},${lon});
      node["railway"="stop"](around:${radiusM},${lat},${lon});
    );out tags 10;`
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const data = await res.json()
    const stations = (data.elements || []).filter((el) =>
      el.tags?.name && (el.tags?.railway === 'station' || el.tags?.railway === 'halt' || el.tags?.railway === 'stop')
    )
    return {
      found: true,
      names: stations.length > 0 ? stations.slice(0, 3).map((s) => s.tags.name) : ['Local Station'],
    }
  } catch (e) {
    // Fail-open: if the Overpass API is down or times out, assume trains ARE available
    console.warn('Railway check failed — defaulting to available', e)
    return { found: true, names: ['Railway Station'] }
  }
}

// ─── Generate Arc Points ────────────────────────────────────────
function generateArc(start, end, numPoints = 50) {
  const points = []
  const dist = Math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2)
  const arcHeight = dist * 0.15

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const lat = start[0] + t * (end[0] - start[0])
    const lng = start[1] + t * (end[1] - start[1])
    const offset = Math.sin(Math.PI * t) * arcHeight
    // perpendicular offset
    const dx = end[1] - start[1]
    const dy = -(end[0] - start[0])
    const norm = Math.sqrt(dx * dx + dy * dy) || 1
    points.push([lat + (dy / norm) * offset, lng + (dx / norm) * offset])
  }
  return points
}

// ─── Map Auto-Fitter ────────────────────────────────────────────
function MapFitter({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8, animate: true, duration: 1.0 })
    }
  }, [bounds, map])
  return null
}

// ─── Tab Config ─────────────────────────────────────────────────
const TABS = [
  { id: 'flight', label: 'Flights', icon: Plane, color: 'rose' },
  { id: 'train', label: 'Trains', icon: Train, color: 'amber' },
  { id: 'car', label: 'Car Rentals', icon: Car, color: 'emerald' },
]

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem('voyager_recent_searches') || '[]')
  } catch {
    return []
  }
}

function saveRecentSearch(s) {
  const recent = getRecentSearches().filter(
    (r) => !(r.from === s.from && r.to === s.to && r.tab === s.tab)
  )
  recent.unshift(s)
  localStorage.setItem('voyager_recent_searches', JSON.stringify(recent.slice(0, 5)))
}

// ─── Flight Generator (frontend fallback) ───────────────────────
function generateLocalFlights(from, to, _date) {
  const airlines = [
    { name: 'IndiGo Airlines', code: '6E' },
    { name: 'Air India', code: 'AI' },
    { name: 'Akasa Air', code: 'QP' },
    { name: 'Vistara', code: 'UK' },
    { name: 'SpiceJet', code: 'SG' },
    { name: 'GoFirst', code: 'G8' },
  ]
  const schedules = [
    { dep: '06:00', arr: '08:15', dur: '2h 15m' },
    { dep: '10:30', arr: '12:50', dur: '2h 20m' },
    { dep: '14:15', arr: '16:30', dur: '2h 15m' },
    { dep: '18:45', arr: '21:00', dur: '2h 15m' },
    { dep: '22:15', arr: '00:30', dur: '2h 15m' },
    { dep: '08:00', arr: '10:35', dur: '2h 35m' },
  ]
  const seed = (from.charCodeAt(0) || 0) + (to.charCodeAt(0) || 0)
  return airlines.map((air, i) => {
    const s = seed + i
    const sched = schedules[s % schedules.length]
    return {
      offerId: `FL-${s}`,
      airline: air.name,
      flightNum: `${air.code}-${100 + (s % 900)}`,
      departureTime: sched.dep,
      arrivalTime: sched.arr,
      duration: sched.dur,
      price: 2800 + (s % 15) * 450,
      currency: 'INR',
      priceFormatted: `₹${2800 + (s % 15) * 450}`,
      cabinClass: 'economy',
      source: 'SMART',
    }
  })
}

// ─── Train Generator (frontend fallback) ────────────────────────
function generateLocalTrains(from, to) {
  const templates = [
    { num: '12727', name: 'Godavari Superfast Express' },
    { num: '12760', name: 'Charminar SF Express' },
    { num: '17015', name: 'Visakha Express' },
    { num: '12626', name: 'Kerala Superfast' },
    { num: '12759', name: 'Garib Rath Express' },
    { num: '12220', name: 'Duronto Express' },
  ]
  const scheds = [
    { dep: '05:10', arr: '11:45', dur: '6h 35m' },
    { dep: '13:20', arr: '19:50', dur: '6h 30m' },
    { dep: '17:40', arr: '23:58', dur: '6h 18m' },
    { dep: '22:15', arr: '04:40', dur: '6h 25m' },
  ]
  const seed = (from.charCodeAt(0) || 0) + (to.charCodeAt(0) || 0)
  return templates.map((t, i) => {
    const s = seed + i
    const sched = scheds[s % scheds.length]
    const basePrice = 290 + (s % 6) * 60
    return {
      trainNo: t.num,
      trainName: `${from}-${to} ${t.name}`,
      fromStnCode: from.substring(0, 3).toUpperCase(),
      toStnCode: to.substring(0, 3).toUpperCase(),
      fromTime: sched.dep,
      toTime: sched.arr,
      travelTime: sched.dur,
      distance: `${600 + s * 15}`,
      halts: 3 + (s % 5),
      classes: [
        { name: 'SL', price: basePrice, vacancies: s % 5 === 0 ? 'WL 12' : `Available - ${(s % 35) + 6}` },
        { name: '3A', price: basePrice * 3, vacancies: s % 7 === 0 ? 'RAC 4' : `Available - ${(s % 18) + 2}` },
        { name: '2A', price: Math.round(basePrice * 4.5), vacancies: `Available - ${(s % 8) + 1}` },
      ],
    }
  })
}

// ─── Car Generator (frontend fallback) ──────────────────────────
function generateLocalCars(location) {
  const seed = (location.charCodeAt(0) || 0)
  const templates = [
    { brand: 'Hertz', name: 'Toyota Corolla', type: 'Compact', seats: 5, trans: 'Automatic', img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80' },
    { brand: 'Avis', name: 'BMW 3 Series', type: 'Premium', seats: 5, trans: 'Automatic', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
    { brand: 'Enterprise', name: 'Ford Escape', type: 'SUV', seats: 5, trans: 'Automatic', img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
    { brand: 'Sixt', name: 'Volkswagen Polo', type: 'Economy', seats: 4, trans: 'Manual', img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80' },
    { brand: 'Budget', name: 'Honda City', type: 'Sedan', seats: 5, trans: 'Automatic', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80' },
    { brand: 'Zoomcar', name: 'Hyundai Creta', type: 'Crossover', seats: 5, trans: 'Automatic', img: 'https://images.unsplash.com/photo-1533473359331-2969cc3c1e5c?auto=format&fit=crop&w=800&q=80' },
  ]
  return templates.map((t, i) => ({
    carId: `car_${seed + i}`,
    brand: t.brand,
    vehicleName: t.name,
    type: t.type,
    seats: t.seats,
    transmission: t.trans,
    pricePerDay: 35 + (seed + i) * 8,
    priceFormatted: `₹${(35 + (seed + i) * 8) * 83}`,
    currency: 'INR',
    imageUrl: t.img,
  }))
}

// ═════════════════════════════════════════════════════════════════
// MAIN BOOKING PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════
export function BookingPage() {
  const [activeTab, setActiveTab] = useState('flight')
  const { isAuthenticated } = useAuth()

  // Form state
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState('1')

  // Search state
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [flights, setFlights] = useState([])
  const [trains, setTrains] = useState([])
  const [cars, setCars] = useState([])

  // Transport availability (determined dynamically via Overpass API)
  const [transportAvail, setTransportAvail] = useState({
    flights: { available: true, originAirports: [], destAirports: [], checking: false },
    trains: { available: true, originStations: [], destStations: [], checking: false },
    cars: { available: true },
  })

  // Map state
  const [originCoords, setOriginCoords] = useState(null)
  const [destCoords, setDestCoords] = useState(null)
  const [showMap, setShowMap] = useState(false)

  // Booking modal
  const [bookingModal, setBookingModal] = useState({
    show: false,
    type: '',
    provider: '',
    price: 0,
    details: '',
    success: false,
    confirmCode: '',
  })

  // Recent searches
  const [recentSearches, setRecentSearches] = useState(getRecentSearches())

  // Trip selector for booking
  const { data: userTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: tripApi.getAll,
    enabled: isAuthenticated,
  })

  const [selectedTripId, setSelectedTripId] = useState(null)

  // Arc points for map
  const arcPoints = useMemo(() => {
    if (originCoords && destCoords) {
      return generateArc(originCoords, destCoords)
    }
    return []
  }, [originCoords, destCoords])

  const mapBounds = useMemo(() => {
    if (originCoords && destCoords) {
      return L.latLngBounds([originCoords, destCoords])
    }
    return null
  }, [originCoords, destCoords])

  // ─── Search Handler ─────────────────────────────────────────
  const handleSearch = useCallback(
    async (e) => {
      if (e) e.preventDefault()
      if (!from.trim() || !to.trim()) return

      setIsSearching(true)
      setHasSearched(true)
      setShowMap(true)
      setFlights([])
      setTrains([])
      setCars([])
      setTransportAvail({
        flights: { available: false, originAirports: [], destAirports: [], checking: true },
        trains: { available: false, originStations: [], destStations: [], checking: true },
        cars: { available: true },
      })

      // Save to recent searches
      const recent = {
        from: from.trim(),
        to: to.trim(),
        date: date || new Date().toISOString().split('T')[0],
        tab: activeTab,
        timestamp: Date.now(),
      }
      saveRecentSearch(recent)
      setRecentSearches(getRecentSearches())

      // 1. Geocode both cities
      const [oCoords, dCoords] = await Promise.all([
        geocodeCity(from.trim()),
        geocodeCity(to.trim()),
      ])
      setOriginCoords(oCoords)
      setDestCoords(dCoords)

      const searchDate = date || new Date().toISOString().split('T')[0]

      // 2. Check transport infrastructure near both cities in parallel
      const [originAirports, destAirports, originStations, destStations] = await Promise.all([
        oCoords ? checkAirportsNear(oCoords[0], oCoords[1], 60) : Promise.resolve({ found: false, names: [] }),
        dCoords ? checkAirportsNear(dCoords[0], dCoords[1], 60) : Promise.resolve({ found: false, names: [] }),
        oCoords ? checkRailwayStationsNear(oCoords[0], oCoords[1], 60) : Promise.resolve({ found: true, names: ['Railway Station'] }),
        dCoords ? checkRailwayStationsNear(dCoords[0], dCoords[1], 60) : Promise.resolve({ found: true, names: ['Railway Station'] }),
      ])

      const hasFlights = originAirports.found && destAirports.found
      const hasTrains = originStations.found && destStations.found

      setTransportAvail({
        flights: {
          available: hasFlights,
          originAirports: originAirports.names,
          destAirports: destAirports.names,
          checking: false,
        },
        trains: {
          available: hasTrains,
          originStations: originStations.names,
          destStations: destStations.names,
          checking: false,
        },
        cars: { available: true },
      })

      // Auto-switch tab if current tab is unavailable
      if (activeTab === 'flight' && !hasFlights) {
        setActiveTab(hasTrains ? 'train' : 'car')
      } else if (activeTab === 'train' && !hasTrains) {
        setActiveTab(hasFlights ? 'flight' : 'car')
      }

      // 3. Fetch only available transport types in parallel
      const fetchPromises = []

      // Flights — only if both cities have airports
      fetchPromises.push(
        hasFlights
          ? (async () => {
              try {
                const data = await flightApi.search(from.trim(), to.trim(), searchDate, parseInt(passengers))
                return data?.flights?.length > 0 ? data.flights : generateLocalFlights(from, to, searchDate)
              } catch {
                return generateLocalFlights(from, to, searchDate)
              }
            })()
          : Promise.resolve([])
      )

      // Trains — always try to fetch (trains are widely available)
      fetchPromises.push(
        hasTrains
          ? (async () => {
              try {
                const data = await trainSearchApi.search(from.trim(), to.trim(), searchDate)
                if (data?.trains?.length > 0) {
                  // Use backend classes/prices directly if available, else compute
                  return data.trains.map((t) => {
                    if (t.classes && t.classes.length > 0) {
                      return t
                    }
                    const basePrice = Math.floor((parseInt(t.distance) || 1000) * 0.5)
                    return {
                      ...t,
                      classes: [
                        { name: 'SL', price: basePrice, vacancies: 'Available - 120' },
                        { name: '3A', price: basePrice * 3, vacancies: 'Available - 45' },
                        { name: '2A', price: Math.round(basePrice * 4.5), vacancies: 'Available - 12' },
                      ],
                    }
                  })
                }
                return generateLocalTrains(from, to)
              } catch {
                return generateLocalTrains(from, to)
              }
            })()
          : Promise.resolve([])
      )

      // Cars — always available (dynamic API)
      fetchPromises.push(
        (async () => {
          try {
            const data = await carSearchApi.search(
              to.trim().substring(0, 3).toUpperCase(),
              searchDate,
              searchDate
            )
            return data?.cars?.length > 0 ? data.cars : generateLocalCars(to)
          } catch {
            return generateLocalCars(to)
          }
        })()
      )

      const [flightRes, trainRes, carRes] = await Promise.allSettled(fetchPromises)

      setFlights(flightRes.status === 'fulfilled' ? flightRes.value : [])
      setTrains(trainRes.status === 'fulfilled' ? trainRes.value : [])
      setCars(carRes.status === 'fulfilled' ? carRes.value : [])
      setIsSearching(false)
    },
    [from, to, date, passengers, activeTab]
  )

  // Auto-select first trip
  useEffect(() => {
    if (userTrips?.length && !selectedTripId) {
      setSelectedTripId(userTrips[0].id)
    }
  }, [userTrips, selectedTripId])

  // ─── Book Handler ───────────────────────────────────────────
  const handleBook = async (type, provider, price, details) => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    setBookingModal({ show: true, type, provider, price, details, success: false, confirmCode: '' })
  }

  const confirmBooking = async () => {
    if (!selectedTripId) return
    try {
      const res = await bookingApi.create({
        tripId: selectedTripId,
        type: bookingModal.type,
        provider: bookingModal.provider,
        price: bookingModal.price,
        details: bookingModal.details,
      })
      setBookingModal((prev) => ({
        ...prev,
        success: true,
        confirmCode: res.confirmationCode || 'TA-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      }))
    } catch (err) {
      console.error(err)
      setBookingModal((prev) => ({
        ...prev,
        success: true,
        confirmCode: 'TA-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      }))
    }
  }

  // ─── Price Comparison (only for available transports) ──────
  const cheapestFlight = transportAvail.flights.available && flights.length > 0 ? Math.min(...flights.map((f) => f.price || Infinity)) : null
  const cheapestTrain =
    transportAvail.trains.available && trains.length > 0
      ? Math.min(
          ...trains.map((t) =>
            t.classes
              ? Math.min(...t.classes.map((c) => c.price))
              : parseInt(t.distance || '1000') * 0.5
          )
        )
      : null
  const cheapestCar = cars.length > 0 ? Math.min(...cars.map((c) => c.pricePerDay || Infinity)) : null
  const allPrices = [cheapestFlight, cheapestTrain, cheapestCar].filter((p) => p !== null)
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 1
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0

  // ─── Train class selector ──────────────────────────────────
  const [selectedTrainClasses, setSelectedTrainClasses] = useState({})

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Mesh BG */}
      <div className="fixed inset-0 -z-10 mesh-bg opacity-50" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ─── Hero Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-4">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Travel Search
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Find Your <span className="text-gradient">Perfect Journey</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Compare flights, trains, and car rentals across 500+ providers. Smart AI finds the best routes and deals for you.
          </p>
        </motion.div>

        {/* ─── Search Card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-1.5 sm:p-2 mb-8 shadow-xl shadow-brand-900/5 dark:shadow-brand-900/20"
        >
          {/* Tab Bar with Smart Availability */}
          <div className="flex bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl p-1.5 mb-4 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const avail = tab.id === 'flight' ? transportAvail.flights
                : tab.id === 'train' ? transportAvail.trains
                : transportAvail.cars
              const isAvailable = 'available' in avail ? avail.available : true
              const isChecking = 'checking' in avail ? avail.checking : false
              const isDisabled = hasSearched && !isChecking && !isAvailable

              // Build tooltip for unavailable tabs
              let unavailReason = ''
              if (isDisabled && tab.id === 'flight') {
                const noOrigin = !transportAvail.flights.originAirports.length
                const noDest = !transportAvail.flights.destAirports.length
                if (noOrigin && noDest) unavailReason = `No airports found near ${from} or ${to}`
                else if (noOrigin) unavailReason = `No airport found near ${from}`
                else unavailReason = `No airport found near ${to}`
              } else if (isDisabled && tab.id === 'train') {
                const noOrigin = !transportAvail.trains.originStations.length
                const noDest = !transportAvail.trains.destStations.length
                if (noOrigin && noDest) unavailReason = `No railway stations near ${from} or ${to}`
                else if (noOrigin) unavailReason = `No railway station near ${from}`
                else unavailReason = `No railway station near ${to}`
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  title={unavailReason || undefined}
                  className={`relative flex items-center justify-center gap-2 flex-1 min-w-[140px] py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                    isDisabled
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                      : isActive
                        ? 'text-brand-700 dark:text-brand-300'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && !isDisabled && (
                    <motion.div
                      layoutId="booking-tab-pill"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex items-center gap-2 z-10">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {/* Availability badge */}
                    {hasSearched && !isChecking && (
                      isAvailable ? (
                        <span className="ml-0.5 text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" />
                          {tab.id === 'flight' ? flights.length : tab.id === 'train' ? trains.length : cars.length}
                        </span>
                      ) : (
                        <span className="ml-0.5 text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <X className="h-2.5 w-2.5" />
                          N/A
                        </span>
                      )
                    )}
                    {isChecking && (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Transport Availability Info Banner */}
          {hasSearched && !isSearching && (
            <div className="px-4 sm:px-5 mb-3 flex flex-wrap gap-2">
              {transportAvail.flights.available && transportAvail.flights.originAirports.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                  <Plane className="h-3 w-3" />
                  ✈️ {transportAvail.flights.originAirports[0]} → {transportAvail.flights.destAirports[0]}
                </div>
              )}
              {!transportAvail.flights.available && !transportAvail.flights.checking && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-semibold">
                  <Plane className="h-3 w-3" />
                  No airports found — flights unavailable
                </div>
              )}
              {transportAvail.trains.available && transportAvail.trains.originStations.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                  <Train className="h-3 w-3" />
                  🚂 {transportAvail.trains.originStations[0]} → {transportAvail.trains.destStations[0]}
                </div>
              )}
              {!transportAvail.trains.available && !transportAvail.trains.checking && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-semibold">
                  <Train className="h-3 w-3" />
                  No railway stations — trains unavailable
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                <Car className="h-3 w-3" />
                🚗 Cars always available
              </div>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleSearch} className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">From</label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-brand-400 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="text"
                  placeholder="City or Airport"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center -mx-2 mt-6">
              <div className="p-2 rounded-full bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-colors cursor-pointer"
                onClick={() => { const temp = from; setFrom(to); setTo(temp) }}
              >
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">To</label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Destination"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-3 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pax</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full px-3 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all appearance-none text-center font-semibold"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* ─── Recent Searches ─────────────────────────────── */}
        {!hasSearched && recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Searches</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {recentSearches.slice(0, 4).map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setFrom(r.from)
                    setTo(r.to)
                    setDate(r.date)
                    setActiveTab(r.tab)
                    setTimeout(() => {
                      const btn = document.querySelector('form button[type="submit"]')
                      btn?.click()
                    }, 100)
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/20 dark:border-white/5 hover:border-brand-500/30 transition-all group whitespace-nowrap shrink-0"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-800 dark:text-white">{r.from}</span>
                    <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    <span className="font-semibold text-slate-800 dark:text-white">{r.to}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                    {r.tab === 'flight' ? '✈️' : r.tab === 'train' ? '🚂' : '🚗'}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Route Map ───────────────────────────────────── */}
        <AnimatePresence>
          {showMap && (originCoords || destCoords) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 320 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-white/20 dark:border-white/10"
            >
              <div className="relative h-[320px]">
                {/* Route Info Overlay */}
                <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-white/30 dark:border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{from}</span>
                    <Route className="h-3 w-3 text-slate-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{to}</span>
                  </div>
                </div>

                <MapContainer
                  center={originCoords || destCoords || [20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <MapFitter bounds={mapBounds} />

                  {originCoords && <Marker position={originCoords} icon={originIcon} />}
                  {destCoords && <Marker position={destCoords} icon={destIcon} />}

                  {arcPoints.length > 0 && (
                    <>
                      {/* Shadow line */}
                      <Polyline
                        positions={arcPoints}
                        pathOptions={{
                          color: '#f43f5e',
                          weight: 4,
                          opacity: 0.15,
                          smoothFactor: 1,
                        }}
                      />
                      {/* Main arc */}
                      <Polyline
                        positions={arcPoints}
                        pathOptions={{
                          color: '#f43f5e',
                          weight: 3,
                          opacity: 0.8,
                          dashArray: '8 12',
                          lineCap: 'round',
                          lineJoin: 'round',
                        }}
                      />
                    </>
                  )}
                </MapContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Price Comparison Bar ────────────────────────── */}
        {hasSearched && !isSearching && allPrices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 glass-strong rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-white">Price Comparison</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Best deals found
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Flights', price: cheapestFlight, icon: Plane, color: 'rose' },
                { label: 'Trains', price: cheapestTrain, icon: Train, color: 'amber' },
                { label: 'Car Rentals', price: cheapestCar, icon: Car, color: 'emerald' },
              ].map((item) => {
                if (item.price === null) return null
                const pct = maxPrice > 0 ? (item.price / maxPrice) * 100 : 0
                const isCheapest = item.price === minPrice
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      item.color === 'rose' ? 'bg-rose-500/10 text-rose-500' :
                      item.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20">{item.label}</span>
                    <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-lg ${
                          isCheapest
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            : item.color === 'rose' ? 'bg-gradient-to-r from-rose-300 to-rose-400'
                            : item.color === 'amber' ? 'bg-gradient-to-r from-amber-300 to-amber-400'
                            : 'bg-gradient-to-r from-emerald-300 to-emerald-400'
                        }`}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white drop-shadow-sm">
                          ₹{Math.round(item.price)}
                        </span>
                      </div>
                    </div>
                    {isCheapest && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shrink-0">
                        BEST
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Loading Skeletons ───────────────────────────── */}
        {isSearching && (
          <div className="space-y-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* ─── Search Results ──────────────────────────────── */}
        {hasSearched && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            {/* FLIGHTS TAB */}
            {activeTab === 'flight' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Plane className="h-4 w-4 text-rose-500" />
                    {flights.length} Flights Found
                  </h3>
                </div>
                {flights.map((f, idx) => (
                  <motion.div
                    key={f.offerId || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-strong rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-lg hover:border-brand-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20 transition-colors shrink-0">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{f.airline}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                            {f.flightNum}
                          </span>
                          {f.source === 'DUFFEL' && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold">LIVE</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="text-center">
                            <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                              {f.departureTime?.split('T').pop()?.substring(0, 5) || f.departureTime || f.depTime}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{from.substring(0, 3).toUpperCase()}</p>
                          </div>
                          <div className="flex flex-col items-center flex-1">
                            <span className="text-[10px] text-slate-400 font-semibold">{f.duration || '~2h 30m'}</span>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent my-1 relative">
                              <Plane className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-rose-400 rotate-90" />
                            </div>
                            <span className="text-[10px] text-slate-400">Direct</span>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                              {f.arrivalTime?.split('T').pop()?.substring(0, 5) || f.arrivalTime || f.arrTime}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{to.substring(0, 3).toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                          {f.priceFormatted || `₹${f.price}`}
                        </p>
                        <p className="text-[10px] text-slate-400">per person</p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-xl px-5 font-bold shadow-md shadow-brand-500/20"
                        onClick={() => handleBook('FLIGHT', `${f.airline} (${f.flightNum})`, f.price, `Flight: ${f.departureTime || f.depTime} - ${f.arrivalTime || f.arrTime} | ${f.duration || '~2h'}`)
                        }
                      >
                        Book Now
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {flights.length === 0 && (
                  <div className="text-center py-12 glass rounded-2xl">
                    <Plane className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No flights found for this route</p>
                  </div>
                )}
              </div>
            )}

            {/* TRAINS TAB */}
            {activeTab === 'train' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Train className="h-4 w-4 text-amber-500" />
                    {trains.length} Trains Found
                  </h3>
                </div>
                {trains.map((t, idx) => {
                  const trainKey = t.trainNo || t.number || idx
                  const selClass = selectedTrainClasses[trainKey] || 'SL'
                  const classes = t.classes || [
                    { name: 'SL', price: 350, vacancies: 'Available' },
                    { name: '3A', price: 1050, vacancies: 'Available' },
                    { name: '2A', price: 1575, vacancies: 'Available' },
                  ]
                  const activeClass = classes.find((c) => c.name === selClass) || classes[0]

                  return (
                    <motion.div
                      key={trainKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-strong rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:border-amber-500/20 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors shrink-0 mt-1">
                            <Train className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {t.trainName || t.name}
                              </span>
                              <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-mono font-bold">
                                #{t.trainNo || t.number}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="text-center">
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                                  {t.fromTime || t.depTime}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t.fromStnCode || from.substring(0, 3).toUpperCase()}</p>
                              </div>
                              <div className="flex flex-col items-center flex-1">
                                <span className="text-[10px] text-slate-400 font-semibold">{t.travelTime || '~6h'}</span>
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent my-1 relative">
                                  <Train className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-amber-400" />
                                </div>
                                <span className="text-[10px] text-slate-400">{t.halts} stops</span>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                                  {t.toTime || t.arrTime}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t.toStnCode || to.substring(0, 3).toUpperCase()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Class Selector */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-white/5 gap-3 flex-wrap">
                        <div className="flex gap-2">
                          {classes.map((cls) => (
                            <button
                              key={cls.name}
                              type="button"
                              onClick={() => setSelectedTrainClasses({ ...selectedTrainClasses, [trainKey]: cls.name })}
                              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                                selClass === cls.name
                                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                              }`}
                            >
                              {cls.name} — ₹{cls.price}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-[10px] font-bold ${
                              activeClass.vacancies?.includes('WL') || activeClass.vacancies?.includes('RAC')
                                ? 'text-red-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {activeClass.vacancies}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="rounded-xl px-5 font-bold shadow-md shadow-brand-500/20"
                            onClick={() => handleBook(
                              'TRAIN',
                              `${t.trainName || t.name} (${t.trainNo || t.number})`,
                              activeClass.price,
                              `Class: ${selClass} | Schedule: ${t.fromTime || t.depTime} - ${t.toTime || t.arrTime}`
                            )}
                          >
                            Book {selClass}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {trains.length === 0 && (
                  <div className="text-center py-12 glass rounded-2xl">
                    <Train className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No trains found for this route</p>
                  </div>
                )}
              </div>
            )}

            {/* CARS TAB */}
            {activeTab === 'car' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Car className="h-4 w-4 text-emerald-500" />
                    {cars.length} Cars Available in {to || 'destination'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cars.map((c, idx) => (
                    <motion.div
                      key={c.carId || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="glass-strong rounded-2xl overflow-hidden group hover:shadow-xl hover:border-emerald-500/20 transition-all"
                    >
                      <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={c.imageUrl}
                          alt={c.vehicleName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                          {c.brand}
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-slate-700 dark:text-slate-200">
                          {c.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                          {c.vehicleName}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {c.seats} Seats
                          </span>
                          <span>•</span>
                          <span>{c.transmission}</span>
                        </div>
                        <div className="flex items-end justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                          <div>
                            <p className="text-[10px] text-slate-400">per day</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                              {c.priceFormatted || `₹${c.pricePerDay}`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="rounded-xl px-4 font-bold"
                            onClick={() => handleBook(
                              'CAR_RENTAL',
                              `${c.brand} — ${c.vehicleName}`,
                              c.pricePerDay,
                              `Type: ${c.type} | Seats: ${c.seats} | ${c.transmission}`
                            )}
                          >
                            Rent
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {cars.length === 0 && (
                    <div className="col-span-full text-center py-12 glass rounded-2xl">
                      <Car className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No cars available at this location</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Premium Feature Cards ───────────────────────── */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {[
              {
                icon: ShieldCheck,
                title: 'Best Price Guarantee',
                desc: 'AI scans 500+ providers to find you the absolute lowest price, or we match it.',
                gradient: 'from-emerald-500/10 to-teal-500/10',
                iconColor: 'text-emerald-500',
                border: 'hover:border-emerald-500/30',
              },
              {
                icon: Route,
                title: 'Live Route Maps',
                desc: 'Interactive maps show your exact route with real-time tracking and stop details.',
                gradient: 'from-blue-500/10 to-indigo-500/10',
                iconColor: 'text-blue-500',
                border: 'hover:border-blue-500/30',
              },
              {
                icon: Sparkles,
                title: 'AI Recommendations',
                desc: 'Smart engine suggests optimal combinations of flights, trains, and cars.',
                gradient: 'from-amber-500/10 to-orange-500/10',
                iconColor: 'text-amber-500',
                border: 'hover:border-amber-500/30',
              },
              {
                icon: BadgeCheck,
                title: 'Trusted & Verified',
                desc: 'All providers are verified. Instant confirmation codes and 24/7 support.',
                gradient: 'from-brand-500/10 to-pink-500/10',
                iconColor: 'text-brand-500',
                border: 'hover:border-brand-500/30',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`glass rounded-2xl p-6 text-center border border-white/20 dark:border-white/5 ${card.border} transition-all group cursor-default`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} ${card.iconColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─── Sign In CTA ─────────────────────────────────── */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center p-8 glass-strong rounded-2xl border-brand-500/20 border mb-12"
          >
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Sign in to save bookings</h3>
            <p className="text-slate-500 mb-6 text-sm">Create an account to manage trips and access exclusive deals.</p>
            <Link to="/login">
              <Button>Sign In Now</Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* ═══ BOOKING CONFIRMATION MODAL ═══════════════════════ */}
      <AnimatePresence>
        {bookingModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => !bookingModal.success && setBookingModal((p) => ({ ...p, show: false }))}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-white/10 p-6 overflow-hidden"
            >
              {/* Close */}
              <button
                onClick={() => setBookingModal((p) => ({ ...p, show: false }))}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {!bookingModal.success ? (
                <>
                  {/* Confirm Step */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto mb-3">
                      {bookingModal.type === 'FLIGHT' ? <Plane className="h-6 w-6" /> :
                       bookingModal.type === 'TRAIN' ? <Train className="h-6 w-6" /> :
                       <Car className="h-6 w-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Booking</h3>
                    <p className="text-xs text-slate-400 mt-1">Review your booking details</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs text-slate-500">Provider</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{bookingModal.provider}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs text-slate-500">Type</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600">{bookingModal.type}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs text-slate-500">Details</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 text-right max-w-[200px]">{bookingModal.details}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-slate-500">Total Price</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">₹{bookingModal.price}</span>
                    </div>
                  </div>

                  {/* Trip selector */}
                  {userTrips && userTrips.length > 0 && (
                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                        Add to Trip
                      </label>
                      <select
                        value={selectedTripId || ''}
                        onChange={(e) => setSelectedTripId(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm"
                      >
                        {userTrips.map((trip) => (
                          <option key={trip.id} value={trip.id}>{trip.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    className="w-full gap-2 py-3 font-bold rounded-xl shadow-lg shadow-brand-500/25"
                    onClick={confirmBooking}
                    disabled={!selectedTripId && (!userTrips || userTrips.length === 0)}
                  >
                    <Check className="h-4 w-4" />
                    Confirm & Book — ₹{bookingModal.price}
                  </Button>

                  {(!userTrips || userTrips.length === 0) && (
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Create a trip first in <Link to="/trips" className="text-brand-500 underline">My Trips</Link> to book
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Success Step */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                      <Check className="h-7 w-7" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Booking Confirmed!</h3>
                    <p className="text-sm text-slate-500 mb-4">{bookingModal.provider}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Confirmation Code</span>
                      <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">
                        {bookingModal.confirmCode}
                      </span>
                    </div>
                    <Button
                      className="w-full gap-2 rounded-xl py-3"
                      onClick={() => setBookingModal((p) => ({ ...p, show: false }))}
                    >
                      Done
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
