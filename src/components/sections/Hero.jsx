import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 mesh-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-slate-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 mb-8">
              <Sparkles className="h-4 w-4 text-brand-600" />
              AI-powered travel intelligence
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-gradient mb-6">
              Plan journeys that feel personally crafted
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-10">
              Discover destinations, predict local events, book seamlessly, and get context-aware
              guidance — all in one premium travel experience.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/destinations">
                <Button size="lg" className="group">
                  Start exploring
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Create free account
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>120+ destinations</span>
              </div>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
              <span>Trusted by 50k+ travelers</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative hidden lg:block"
          >
            <div className="glass-strong rounded-3xl p-6 neu-soft rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-200 via-brand-100 to-slate-300 dark:from-slate-800 dark:via-brand-900/40 dark:to-slate-900 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                  alt="Scenic travel destination"
                  className="w-full h-full object-cover opacity-90"
                  loading="eager"
                />
                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4">
                  <p className="text-xs font-medium text-brand-700 dark:text-brand-300 mb-1">
                    Upcoming trip
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">Santorini, Greece</p>
                  <p className="text-sm text-slate-500">Jun 12 – Jun 20 · Weather looks perfect</p>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl"
            >
              <p className="text-2xl font-semibold text-brand-700 dark:text-brand-300">4.9</p>
              <p className="text-xs text-slate-500">Avg. rating</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
