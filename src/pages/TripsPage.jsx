import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Trash2,
  MapPin,
  Plane,
  Hotel,
  Train,
  Ticket,
  ChevronDown,
  ChevronUp,
  Search,
  Star,
  Compass
} from 'lucide-react'
import { tripApi, destinationApi, bookingApi, flightApi, hotelSearchApi, trainSearchApi, carSearchApi, assistantApi } from '@/api/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

// Dynamic simulated Swiggy-style Hotel generator
function generateHotels(city) {
  const hotelTemplates = [
    { name: "Grand Palace & Spa", tag: "luxury" },
    { name: "Royal Heritage Mansion", tag: "heritage" },
    { name: "Urban Comfort Suites", tag: "business" },
    { name: "Boutique Oasis", tag: "boutique" },
    { name: "Serene Valley Resort", tag: "nature" },
    { name: "Central Inn & Suites", tag: "business" },
    { name: "Lakeside Manor", tag: "nature" },
    { name: "Budget Stay Lodge", tag: "budget" },
    { name: "Pinewood Residency", tag: "nature" },
    { name: "Metropolitan Plaza", tag: "business" }
  ];

  return hotelTemplates.map((h, index) => {
    const seed = (city.charCodeAt(0) || 0) + index;
    const vacancies = seed % 7 === 0 ? 0 : (seed % 6) + 1;
    const rating = (4.0 + (seed % 9) * 0.1).toFixed(1);
    const price = 2200 + (seed % 10) * 800;
    const hotelName = `${city} ${h.name}`;
    
    const imageUrl = `https://images.unsplash.com/featured/400x300/?hotel,room,${h.tag}&sig=${seed}`;

    const reviews = [
      "Extremely clean rooms and hospitable staff. The food was top tier!",
      "Spectacular view from the balcony. Perfect weekend getaway.",
      "Centrally located, neat amenities, and check-in was seamless.",
      "Excellent value for money. Very polite room service."
    ];
    const r1 = reviews[seed % reviews.length];
    const r2 = reviews[(seed + 1) % reviews.length];

    return {
      id: index + 1,
      name: hotelName,
      imageUrl,
      rating,
      price,
      vacancies,
      reviews: [r1, r2]
    };
  });
}

// Dynamic simulated Flight generator
function generateFlights(from, to, _date) {
  const airlines = [
    { name: "IndiGo Airlines", code: "6E" },
    { name: "Air India", code: "AI" },
    { name: "Akasa Air", code: "QP" },
    { name: "Vistara", code: "UK" },
    { name: "SpiceJet", code: "SG" }
  ];

  const schedules = [
    { dep: "06:00", arr: "08:15" },
    { dep: "10:30", arr: "12:50" },
    { dep: "14:15", arr: "16:30" },
    { dep: "18:45", arr: "21:00" },
    { dep: "22:15", arr: "00:30" }
  ];

  const seed = (from.charCodeAt(0) || 0) + (to.charCodeAt(0) || 0);

  return airlines.map((air, index) => {
    const flightSeed = seed + index;
    const flightNum = `${air.code}-${100 + (flightSeed % 900)}`;
    const schedule = schedules[flightSeed % schedules.length];
    const price = 3200 + (flightSeed % 15) * 450;
    const vacancies = (flightSeed % 9) + 1;
    return {
      flightNum,
      airline: air.name,
      depTime: schedule.dep,
      arrTime: schedule.arr,
      price,
      vacancies
    };
  });
}

// Dynamic simulated Train generator
function generateTrains(from, to, _date) {
  const trainTemplates = [
    { number: "12727", name: "Godavari Superfast Express" },
    { number: "12760", name: "Charminar SF Express" },
    { number: "17015", name: "Visakha Express" },
    { number: "12626", name: "Kerala Superfast" },
    { number: "12759", name: "Garib Rath Express" },
    { number: "12220", name: "Duronto Express" }
  ];

  const schedules = [
    { dep: "05:10", arr: "11:45" },
    { dep: "13:20", arr: "19:50" },
    { dep: "17:40", arr: "23:58" },
    { dep: "22:15", arr: "04:40" }
  ];

  const statusOptions = [
    "On Time",
    "Delayed by 10 mins",
    "Delayed by 25 mins",
    "On Time",
    "Delayed by 5 mins"
  ];

  const seed = (from.charCodeAt(0) || 0) + (to.charCodeAt(0) || 0);

  return trainTemplates.map((t, index) => {
    const trainSeed = seed + index;
    const schedule = schedules[trainSeed % schedules.length];
    const delayStatus = statusOptions[trainSeed % statusOptions.length];
    const basePrice = 290 + (trainSeed % 6) * 60;
    
    const slVacancies = trainSeed % 5 === 0 ? "WL 12" : `Available - ${(trainSeed % 35) + 6} seats`;
    const acVacancies = trainSeed % 7 === 0 ? "RAC 4" : `Available - ${(trainSeed % 18) + 2} seats`;

    return {
      number: t.number,
      name: `${from}-${to} ${t.name}`,
      depTime: schedule.dep,
      arrTime: schedule.arr,
      status: delayStatus,
      classes: [
        { name: "SL", price: basePrice, vacancies: slVacancies },
        { name: "3A", price: basePrice * 3, vacancies: acVacancies },
        { name: "2A", price: basePrice * 4.5, vacancies: acVacancies.replace(/Available - \d+/, "Available - 3") }
      ]
    };
  });
}

function TripBookingPortal({ tripId, destinationId, destinationName, tripStartDate }) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('HOTEL')

  // Search parameters states
  const [sourceCity, setSourceCity] = useState('Hyderabad')
  const [destCity, setDestCity] = useState(destinationName || '')
  const [travelDate, setTravelDate] = useState(tripStartDate || '')

  // Search execution states
  const [hotels, setHotels] = useState([])
  const [flights, setFlights] = useState([])
  const [trains, setTrains] = useState([])
  const [cars, setCars] = useState([])

  // Live selected train class for booking
  const [selectedTrainClasses, setSelectedTrainClasses] = useState({})

  const [successMsg, setSuccessMsg] = useState('')

  // Budget and AI Assistant States
  const [budgetLimit, setBudgetLimit] = useState(50000)
  const [aiPrompt, setAiPrompt] = useState(`Suggest a 3-day itinerary for ${destinationName}`)
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Query server hotels
  const { data: serverHotels } = useQuery({
    queryKey: ['hotels', destinationId],
    queryFn: () => destinationApi.getHotels(destinationId),
    enabled: !!destinationId && activeTab === 'HOTEL'
  })

  // Automatically trigger search when parameters change (debounced)
  useEffect(() => {
    if (activeTab === 'HOTEL') {
      const timeoutId = setTimeout(() => {
        handleHotelSearch()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [destCity, destinationName, activeTab])

  const displayHotels = hotels && hotels.length > 0 ? hotels : (serverHotels && serverHotels.length > 0 ? serverHotels : [])

  const handleFlightSearch = async (e) => {
    e.preventDefault()
    try {
      const data = await flightApi.search(sourceCity, destCity, travelDate, 1)
      setFlights(data.flights || [])
    } catch (err) {
      console.error(err)
      setFlights(generateFlights(sourceCity, destCity, travelDate))
    }
  }

  const handleHotelSearch = async (e) => {
    if (e) e.preventDefault()
    try {
      const checkoutDate = travelDate ? new Date(new Date(travelDate).getTime() + 86400000 * 5).toISOString().split('T')[0] : '';
      const data = await hotelSearchApi.search(destCity.substring(0, 3).toUpperCase() || 'PAR', travelDate, checkoutDate, 1)
      setHotels(data.hotels || [])
    } catch (err) {
      console.error(err)
      setHotels(generateHotels(destCity || destinationName || 'Warangal'))
    }
  }

  const handleTrainSearch = async (e) => {
    e.preventDefault()
    try {
      const data = await trainSearchApi.search(sourceCity, destCity, travelDate)
      
      const mappedTrains = (data.trains || []).map((t) => {
        const basePrice = Math.floor((parseInt(t.distance) || 1000) * 0.5)
        return {
          number: t.trainNo,
          name: t.trainName,
          depTime: t.fromTime,
          arrTime: t.toTime,
          status: 'Scheduled',
          classes: [
            { name: "SL", price: basePrice, vacancies: "Available - 120" },
            { name: "3A", price: basePrice * 3, vacancies: "Available - 45" },
            { name: "2A", price: basePrice * 4.5, vacancies: "WL - 12" }
          ]
        }
      })
      setTrains(mappedTrains)
    } catch (err) {
      console.error(err)
      setTrains(generateTrains(sourceCity, destCity, travelDate))
    }
  }

  const handleCarSearch = async (e) => {
    e.preventDefault()
    try {
      const data = await carSearchApi.search(destCity.substring(0, 3).toUpperCase() || 'LHR', travelDate, travelDate)
      setCars(data.cars || [])
    } catch (err) {
      console.error(err)
      setCars([])
    }
  }

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', tripId],
    queryFn: () => bookingApi.getByTrip(tripId),
  })

  const bookingMutation = useMutation({
    mutationFn: (bookingData) =>
      bookingApi.create({
        tripId,
        type: bookingData.type,
        provider: bookingData.provider,
        price: bookingData.price,
        details: bookingData.details,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', tripId] })
      setSuccessMsg('Booking confirmed successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  const getBookingIcon = (type) => {
    switch (type) {
      case 'FLIGHT':
        return <Plane className="h-4 w-4 text-rose-500" />
      case 'HOTEL':
        return <Hotel className="h-4 w-4 text-pink-500" />
      case 'TRAIN':
        return <Train className="h-4 w-4 text-amber-500" />
      default:
        return <Ticket className="h-4 w-4 text-slate-500" />
    }
  }

  const totalCost = bookings?.reduce((acc, b) => acc + (b.price || 0), 0) || 0
  const utilizedPercent = Math.min(100, Math.round((totalCost / budgetLimit) * 100))

  return (
    <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-6 space-y-6">
      
      {/* 1. Dynamic Budget Planner & Cost Estimator */}
      <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              Trip Budget Tracker
            </h4>
            <p className="text-[10px] text-slate-400">Total cost calculated automatically from bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Set Limit:</span>
            <input
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Math.max(1, Number(e.target.value)))}
              className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Budget Limit</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹{budgetLimit}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Spent So Far</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹{totalCost}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Remaining</span>
            <p className={`text-sm font-bold mt-0.5 ${budgetLimit - totalCost >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              ₹{budgetLimit - totalCost}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${utilizedPercent}%` }}
              className={`h-full rounded-full transition-colors duration-500 ${
                utilizedPercent <= 70 ? 'bg-emerald-500' :
                utilizedPercent <= 90 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>0%</span>
            <span>{utilizedPercent}% Utilized</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 2. AI Assistant & Itinerary Optimizer */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-500/5 to-amber-500/5 border border-brand-500/10 dark:border-brand-500/5 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
            <Compass className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              ✨ Voyager AI Trip Assistant
            </h4>
            <p className="text-[10px] text-slate-400">Get customized sightseeing and dining advice for {destinationName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI to optimize itinerary, suggest foods..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-900 dark:text-white"
          />
          <Button
            size="sm"
            onClick={async () => {
              if (aiPrompt.trim().length === 0) return
              setAiLoading(true)
              setAiResponse('')
              try {
                const res = await assistantApi.chat({
                  message: aiPrompt,
                  destinationId: destinationId
                })
                setAiResponse(res.message || 'No response returned from AI.')
              } catch (err) {
                console.error(err)
                setAiResponse('AI suggestion service currently overloaded. Please try again!')
              } finally {
                setAiLoading(false)
              }
            }}
            disabled={aiLoading}
            className="shrink-0 font-semibold"
          >
            {aiLoading ? 'Thinking...' : 'Ask AI'}
          </Button>
        </div>

        {aiLoading && (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {aiResponse && !aiLoading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-line"
          >
            {aiResponse}
          </motion.div>
        )}
      </div>

      {/* 3. Current Bookings & Reservations List */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">
          Bookings & Reservations
        </h4>

        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="space-y-2">
            {bookings?.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 backdrop-blur-md shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                    {getBookingIcon(b.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">{b.type}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                      {b.provider}
                    </p>
                    {b.details && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{b.details}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{b.price}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Code: {b.confirmationCode}
                  </p>
                </div>
              </div>
            ))}
            {!bookings?.length && (
              <p className="text-xs text-slate-500 italic py-2">No bookings for this trip yet.</p>
            )}
          </div>
        )}
      </div>

      {/* 4. Booking Form Tabs & Results */}
      <div className="p-5 rounded-2xl bg-white/30 dark:bg-slate-950/20 border border-white/20 dark:border-white/5 space-y-5 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Explore & Book Travel
          </h5>
          {successMsg && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/10">
              {successMsg}
            </span>
          )}
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-2">
          {['HOTEL', 'FLIGHT', 'TRAIN', 'CAR'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveTab(type)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all text-xs font-semibold ${
                activeTab === type
                  ? 'border-pink-500 bg-gradient-to-r from-pink-500/10 to-amber-500/10 text-pink-700 dark:text-pink-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex justify-center mb-1">{getBookingIcon(type)}</div>
              <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Hotel Search (Swiggy-style) */}
        {activeTab === 'HOTEL' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
                placeholder="Search hotel location..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
              />
              <Button size="sm" className="gap-1 flex shrink-0">
                <Search className="h-3 w-3" />
                Find
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
              {displayHotels.map((h) => {
                const isFull = false;
                const imageUrl = h.photoUrl || h.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
                const rating = h.rating || 4.0;
                
                return (
                  <div
                    key={h.hotelId || h.id}
                    className="glass rounded-xl overflow-hidden flex flex-col border border-white/20 dark:border-white/5 shadow-sm"
                  >
                    <div className="relative h-28 w-full bg-slate-100 dark:bg-slate-800">
                      <img
                        src={imageUrl}
                        alt={h.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h6 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {h.name}
                          </h6>
                          <div className="flex items-center gap-0.5 shrink-0 bg-amber-500/10 text-amber-600 px-1 rounded text-[10px] font-bold">
                            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            {rating}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-2">
                          {h.priceFormatted || `₹${h.price}`} / night
                        </p>

                        <div className="border-t border-slate-100 dark:border-white/5 pt-2 space-y-1">
                          <p className="text-[9px] text-slate-400 italic line-clamp-1">
                            {h.roomType || h.address}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-3 font-semibold"
                        disabled={isFull || bookingMutation.isPending}
                        onClick={() =>
                          bookingMutation.mutate({
                            type: 'HOTEL',
                            provider: h.name,
                            price: h.price,
                            details: `Room: ${h.roomType || 'Standard'} | ${h.boardType || 'ROOM ONLY'}`,
                          })
                        }
                      >
                        {isFull ? 'Full / Sold Out' : 'Book Hotel'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Dynamic Flight Search */}
        {activeTab === 'FLIGHT' && (
          <form onSubmit={handleFlightSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">From</label>
                <input
                  value={sourceCity}
                  onChange={(e) => setSourceCity(e.target.value)}
                  placeholder="Source City"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">To</label>
                <input
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  placeholder="Destination City"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="w-full gap-1">
                <Search className="h-3.5 w-3.5" /> Search Flights
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {flights.map((f) => (
                <div
                  key={f.flightNum}
                  className="glass p-3 rounded-xl border border-white/20 dark:border-white/5 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                      <Plane className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {f.airline}
                        </span>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                          {f.flightNum}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Schedule: {f.departureTime || f.depTime} – {f.arrivalTime || f.arrTime} • {f.duration}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{f.priceFormatted || `₹${f.price}`}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        bookingMutation.mutate({
                          type: 'FLIGHT',
                          provider: `${f.airline} (${f.flightNum})`,
                          price: f.price,
                          details: `Flight: ${f.departureTime || f.depTime}-${f.arrivalTime || f.arrTime} | Seat: Confirmed`,
                        })
                      }
                      disabled={bookingMutation.isPending}
                    >
                      Book
                    </Button>
                  </div>
                </div>
              ))}
              {flights.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Enter source/destination and search.
                </p>
              )}
            </div>
          </form>
        )}

        {/* Dynamic Train Search ("Where is my train" style) */}
        {activeTab === 'TRAIN' && (
          <form onSubmit={handleTrainSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">From</label>
                <input
                  value={sourceCity}
                  onChange={(e) => setSourceCity(e.target.value)}
                  placeholder="Source Station"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">To</label>
                <input
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  placeholder="Destination Station"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="w-full gap-1">
                <Search className="h-3.5 w-3.5" /> Search Trains
              </Button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {trains.map((t) => {
                const selectedClassCode = selectedTrainClasses[t.number] || 'SL'
                const selectedClass = t.classes.find((c) => c.name === selectedClassCode) || t.classes[0]
                const isWL = selectedClass.vacancies.includes('WL')

                return (
                  <div
                    key={t.number}
                    className="glass p-3.5 rounded-xl border border-white/20 dark:border-white/5 flex flex-col gap-3 shadow-sm"
                  >
                    {/* Header: Train Info & Live Status */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.name}
                          </span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                            {t.number}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Schedule: {t.depTime} – {t.arrTime}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          t.status.includes('Delayed')
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    {/* Class Selector Row */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2.5 gap-2">
                      <div className="flex gap-1.5">
                        {t.classes.map((cls) => (
                          <button
                            key={cls.name}
                            type="button"
                            onClick={() =>
                              setSelectedTrainClasses({
                                ...selectedTrainClasses,
                                [t.number]: cls.name,
                              })
                            }
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              selectedClassCode === cls.name
                                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            {cls.name} (₹{cls.price})
                          </button>
                        ))}
                      </div>

                      {/* Class Details & Book Button */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span
                            className={`text-[9px] font-bold ${
                              isWL ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {selectedClass.vacancies}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            bookingMutation.mutate({
                              type: 'TRAIN',
                              provider: `${t.name} (${t.number})`,
                              price: selectedClass.price,
                              details: `Class: ${selectedClassCode} | Live Status: ${t.status} | Seat: Confirmed`,
                            })
                          }
                          disabled={bookingMutation.isPending}
                        >
                          Book {selectedClassCode}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {trains.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Enter source/destination and search.
                </p>
              )}
            </div>
          </form>
        )}

        {/* Dynamic Car Search */}
        {activeTab === 'CAR' && (
          <form onSubmit={handleCarSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Pickup Location</label>
                <input
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  placeholder="City or Airport Code"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Dates</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-transparent px-3 py-2 text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="w-full gap-1">
                <Search className="h-3.5 w-3.5" /> Find Cars
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
              {cars.map((c) => (
                <div
                  key={c.carId}
                  className="glass p-3 rounded-2xl border border-white/20 dark:border-white/5 flex flex-col gap-3 group hover:border-amber-500/30 transition-all shadow-sm overflow-hidden relative"
                >
                  <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={c.imageUrl}
                      alt={c.vehicleName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      {c.brand}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight">
                        {c.vehicleName}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{c.type}</span>
                        <span>•</span>
                        <span>{c.seats} Seats</span>
                        <span>•</span>
                        <span>{c.transmission}</span>
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Price per day</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                          {c.priceFormatted}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-xl px-4 py-1.5 h-auto text-xs font-bold"
                        onClick={() =>
                          bookingMutation.mutate({
                            type: 'CAR_RENTAL',
                            provider: `${c.brand} - ${c.vehicleName}`,
                            price: c.pricePerDay,
                            details: `Type: ${c.type} | Seats: ${c.seats} | ${c.transmission}`,
                          })
                        }
                        disabled={bookingMutation.isPending}
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {cars.length === 0 && (
                <div className="col-span-full text-center py-6">
                  <p className="text-xs text-slate-500 italic">Enter location and search for cars.</p>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export function TripsPage() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showForm, setShowForm] = useState(false)
  const [expandedTripId, setExpandedTripId] = useState(null)
  
  const [form, setForm] = useState({
    title: '',
    destinationId: '',
    startDate: '',
    endDate: '',
    notes: '',
  })

  // Autocomplete & search destination states
  const [destSearch, setDestSearch] = useState('')
  const [showDestDropdown, setShowDestDropdown] = useState(false)
  const [selectedDestName, setSelectedDestName] = useState('')

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowForm(true)
      const to = searchParams.get('to')
      const date = searchParams.get('date')
      if (to) {
        setDestSearch(to)
        setForm(f => ({ ...f, title: `Trip to ${to}` }))
      }
      if (date) {
        setForm(f => ({
          ...f,
          startDate: date,
          endDate: new Date(new Date(date).getTime() + 86400000 * 5).toISOString().split('T')[0]
        }))
      }
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: tripApi.getAll,
    enabled: isAuthenticated,
  })

  const { data: allDests } = useQuery({
    queryKey: ['destinations'],
    queryFn: destinationApi.getAll,
    enabled: showForm,
  })

  const { data: searchDestinations, isLoading: searchingDests } = useQuery({
    queryKey: ['destinationsSearch', destSearch],
    queryFn: () => destinationApi.search(destSearch),
    enabled: destSearch.trim().length > 0 && showDestDropdown,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      tripApi.create({
        title: form.title,
        destinationId: Number(form.destinationId),
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setShowForm(false)
      setForm({ title: '', destinationId: '', startDate: '', endDate: '', notes: '' })
      setDestSearch('')
      setSelectedDestName('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: tripApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  })

  if (!isAuthenticated) {
    return (
      <div className="pt-32 text-center px-4">
        <h1 className="font-display text-2xl font-semibold mb-4">Sign in to view your trips</h1>
        <Link to="/login">
          <Button>Log in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              My Trips
            </h1>
            <p className="text-slate-500 mt-1">Your planned and past journeys</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </div>

        {showForm && (
          <form
            className="glass rounded-3xl p-6 mb-8 space-y-4 border border-white/20 dark:border-white/5 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Trip title"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm"
            />
            <div className="relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={destSearch}
                  onChange={(e) => {
                    setDestSearch(e.target.value)
                    setShowDestDropdown(true)
                    if (form.destinationId) {
                      setForm({ ...form, destinationId: '' })
                      setSelectedDestName('')
                    }
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowDestDropdown(false), 200)
                  }}
                  placeholder="Where to? (e.g., Goa, Araku, Khammam)"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                />
                {selectedDestName && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                    Selected
                  </span>
                )}
              </div>

              {showDestDropdown && (
                <div className="absolute z-50 mt-1.5 w-full glass rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 backdrop-blur-md">
                  {searchingDests && (
                    <div className="p-3 text-xs text-slate-500 flex items-center gap-2">
                      <span className="h-3 w-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                      Searching...
                    </div>
                  )}
                  {((destSearch.trim() ? searchDestinations : allDests) || []).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, destinationId: String(d.id) })
                        setDestSearch(`${d.name}, ${d.city || ''}`)
                        setSelectedDestName(d.name)
                        setShowDestDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-brand-500/10 text-sm transition-colors flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">{d.name}</span>
                        <span className="text-xs text-slate-500">{[d.city, d.state, d.country].filter(Boolean).join(', ')}</span>
                      </div>
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full font-medium">
                        Select
                      </span>
                    </button>
                  ))}
                  {destSearch.trim().length > 0 &&
                    !((searchDestinations || []).some(
                      (d) => d.name.toLowerCase() === destSearch.trim().toLowerCase()
                    )) && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await destinationApi.search(destSearch)
                            if (res && res.length > 0) {
                              const newDest = res[0]
                              setForm({ ...form, destinationId: String(newDest.id) })
                              setDestSearch(`${newDest.name}, ${newDest.city || ''}`)
                              setSelectedDestName(newDest.name)
                              queryClient.invalidateQueries({ queryKey: ['destinations'] })
                            }
                          } catch (err) {
                            console.error("Failed to dynamically create destination", err)
                          }
                          setShowDestDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-semibold transition-colors flex items-center gap-2 border-t border-brand-500/10"
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="truncate">Create & explore new destination: "{destSearch}"</span>
                      </button>
                    )}
                  {((destSearch.trim() ? searchDestinations : allDests) || []).length === 0 && !searchingDests && (
                    <div className="p-4 text-xs text-slate-500 text-center">
                      No matching destinations. Type to search or create new.
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm"
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm"
              />
            </div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm"
            />
            <Button type="submit" disabled={createMutation.isPending}>
              Create Trip
            </Button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trips?.map((trip) => {
              const isExpanded = expandedTripId === trip.id
              return (
                <article
                  key={trip.id}
                  className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                        {trip.title}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {trip.destination?.name || `Destination #${trip.destination?.id}`}
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </p>
                      <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/10">
                        {trip.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Bookings
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Bookings
                          </>
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(trip.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Delete trip"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <TripBookingPortal
                      tripId={trip.id}
                      destinationId={trip.destination?.id}
                      destinationName={trip.destination?.name || ''}
                      tripStartDate={trip.startDate}
                    />
                  )}
                </article>
              )
            })}
            {!trips?.length && (
              <p className="text-center text-slate-500 py-12">
                No trips yet. Create your first adventure!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
