import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plane, Train, Car, Calendar, MapPin, Search, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

const TABS = [
  { id: 'flight', label: 'Flights', icon: Plane },
  { id: 'train', label: 'Trains', icon: Train },
  { id: 'car', label: 'Car Rentals', icon: Car },
]

export function BookingPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const { isAuthenticated } = useAuth()
  
  // Dummy form states
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState('1')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    const params = new URLSearchParams({
      new: 'true',
      to,
      date,
      tab: activeTab.toUpperCase()
    })
    window.location.href = `/trips?${params.toString()}`
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-white mb-4">
            Unified Booking Portal
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find the best deals on flights, trains, and cars. All your travel needs in one secure place, powered by AI predictions.
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-2 sm:p-4 mb-16 shadow-xl shadow-brand-900/5 dark:shadow-brand-900/20">
          <div className="flex bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-1.5 mb-6 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 flex-1 min-w-[120px] py-3 px-4 text-sm font-medium rounded-xl transition-colors ${
                    isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="booking-tab"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex items-center gap-2 z-10">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSearch} className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">From</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="City or Airport"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 transition-shadow"
                  required
                />
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center -mx-2 mt-6">
              <ArrowRight className="h-5 w-5 text-slate-300" />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">To</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Destination"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 transition-shadow"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 transition-shadow"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Passengers</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 transition-shadow appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-12 flex justify-end mt-4">
              <Button type="submit" size="lg" className="w-full md:w-auto px-8 gap-2">
                <Search className="h-5 w-5" />
                Search {activeTab}s
              </Button>
            </div>
          </form>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 text-center">
            <ShieldCheck className="h-10 w-10 text-brand-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Secure Booking</h3>
            <p className="text-sm text-slate-500">Your payments and personal data are encrypted and fully protected.</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <Sparkles className="h-10 w-10 text-brand-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Smart Deals</h3>
            <p className="text-sm text-slate-500">Our AI scans thousands of providers to find you the optimal price and route.</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <Plane className="h-10 w-10 text-brand-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">All-in-One</h3>
            <p className="text-sm text-slate-500">Manage your flights, trains, and car rentals from a single dashboard.</p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-12 text-center p-8 glass-strong rounded-2xl border-brand-500/20 border">
            <h3 className="text-lg font-semibold mb-2">Sign in to save your bookings</h3>
            <p className="text-slate-500 mb-6 text-sm">Create an account to manage your trips and access exclusive deals.</p>
            <Link to="/login">
              <Button>Sign In Now</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
