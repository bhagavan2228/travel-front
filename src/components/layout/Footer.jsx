import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Compass, Globe, Share2, Mail, X, CheckCircle, ShieldAlert, FileText, BookOpen, Compass as CompassIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeModal, setActiveModal] = useState(null)

  const handleDestinationsClick = (e) => {
    e.preventDefault()
    if (location.pathname !== '/destinations') {
      navigate('/destinations')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 150)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleShareClick = async (e) => {
    e.preventDefault()
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Voyager Travel',
          text: 'Explore premium AI travel planning with Voyager!',
          url: window.location.origin,
        })
      } catch (err) {
        console.log('Share canceled or failed:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.origin)
      alert('Voyager Travel link copied to clipboard!')
    }
  }

  const closeModal = () => setActiveModal(null)

  return (
    <footer className="border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
                <Compass className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-semibold">Voyager</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Premium AI travel planning for the modern explorer.
            </p>
            <div className="flex gap-3 mt-6">
              {/* Globe Icon: Explore Destinations */}
              <a
                href="/destinations"
                onClick={handleDestinationsClick}
                aria-label="Explore Destinations"
                className="p-2.5 rounded-xl glass hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </a>

              {/* Share Icon */}
              <button
                onClick={handleShareClick}
                aria-label="Share"
                className="p-2.5 rounded-xl glass hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>

              {/* Mail Icon: opens mail to bhagavan282005@gmail.com */}
              <a
                href="mailto:bhagavan282005@gmail.com?subject=Contact%20Voyager%20Travel"
                aria-label="Contact"
                className="p-2.5 rounded-xl glass hover:bg-white dark:hover:bg-white/10 transition-colors"
              >
                <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">Explore</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setActiveModal('product')}
                  className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer text-left"
                >
                  Product
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('features')}
                  className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <a
                  href="/destinations"
                  onClick={handleDestinationsClick}
                  className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer text-left"
                >
                  Destinations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">Voyager</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setActiveModal('about')}
                  className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('blog')}
                  className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer text-left"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer text-left"
                >
                  Privacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer text-left"
                >
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-sm text-slate-500">
          <p>&copy; 2026 Voyager &mdash; Developed by Bhagavan Muthineni</p>
        </div>
      </div>

      {/* Interactive Beautiful Modal System */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200/80 dark:border-white/10 z-10"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>

              {/* Modal Content Router */}
              {activeModal === 'product' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-2xl">
                      <CompassIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">About the Application</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Voyager is a unified, next-generation AI travel companion engineered to simplify, enrich, and optimize trip curation. It brings everything you need for travel into a single, cohesive experience.
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Smart AI Orchestration</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Contextual assistant streams tailored schedules, transport guides, and sightseeing ideas.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Live Dining & Map Explorer</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Discover 20 real physical restaurants dynamically near you with accurate GPS maps.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Weather & Booking Services</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Integrated weather forecast system and real-time train/flight API booking simulation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'features' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl">
                      <CompassIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Features Built-In</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 painful leading-relaxed">
                    Explore the state-of-the-art tools and dynamic APIs bundled directly within Voyager:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">AI Chat Planner</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Generate full day-by-day itineraries instantly.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">OSM Places API</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Live query physical local restaurants with open maps.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Weather Dashboard</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Real-time weather parameters for accurate packing.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Train Proxy Service</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Direct booking integration via RailKit API server.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'about' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-2xl">
                      <CheckCircle className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why Voyager & What You Gain</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Voyager is built to solve travel planning friction. Here is what you gain by planning your adventures with us:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-xs font-semibold text-brand-700 dark:text-brand-300 mt-0.5">1</span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Save Time</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Compress hours of research on weather, places, transport, and routing into minutes.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-xs font-semibold text-brand-700 dark:text-brand-300 mt-0.5">2</span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Discover Authenticity</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Skip standard tourist traps; OSM integration lists actual local hubs and eateries.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-xs font-semibold text-brand-700 dark:text-brand-300 mt-0.5">3</span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Absolute Security</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Enjoy safe, ad-free planning with encrypted data, no trackers, and local caching.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-2xl">
                      <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Privacy & Security Points</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Your personal journeys are yours alone. We believe in absolute privacy. Here is how your data is handled:
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/10">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Zero Itinerary Selling</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">We never trade, analyze, or sell your trip details or destinations history to third parties.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/10">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Prompt Anonymization</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Queries routed to Gemini/Grok models are anonymized to ensure zero personal leaks.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/10">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Encrypted Auth & Caching</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">JWT tokens and user sessions are stored securely in local cookies with strict validation.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'blog' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl">
                      <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Voyager Travel Blog</h3>
                  </div>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    <article className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Tech & Travel</span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">How AI is Revolutionizing Modern Curation</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Planning trips used to take hours. Discover how smart LLM engines help us navigate and schedule day-by-day seamlessly.</p>
                    </article>
                    <article className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Destinations</span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">10 Hidden Escapes Off the Beaten Path</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">From the valleys of Araku to the historic ghats of Varanasi (Kashi), explore quiet, authentic getaways.</p>
                    </article>
                    <article className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">Foodie Guide</span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">Finding Real Local Culinary Secrets</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">How to leverage community geospatial data to avoid expensive tourist traps and dine like a local.</p>
                    </article>
                  </div>
                </div>
              )}

              {activeModal === 'terms' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Terms & Conditions</h3>
                  </div>
                  <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-[300px] overflow-y-auto pr-2">
                    <p>
                      <strong>1. Service Scope:</strong> Voyager provides AI-guided planning recommendations. All listings, restaurants, weather, and transport proxies are for assistance. Verify times and availability directly with venues.
                    </p>
                    <p>
                      <strong>2. API Access & Limits:</strong> Users must not scrape, overload, or run automated batch routines on Voyager's backend endpoints. Abuse of weather or AI services will result in automatic lockout.
                    </p>
                    <p>
                      <strong>3. Third Party Links:</strong> Mapped links and websites point to third-party providers (Google Maps, OpenStreetMap). Voyager holds no liability for external services or reservations.
                    </p>
                    <p>
                      <strong>4. Liability:</strong> Voyager is not liable for travel delays, bookings cancellations, or spatial errors. Enjoy your travels responsibly and respect local guidelines!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  )
}
