import { motion } from 'framer-motion'
import {
  Brain,
  CloudRain,
  UtensilsCrossed,
  Route,
  Shield,
  MessageCircle,
} from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Brain,
    title: 'AI Event Prediction',
    description: 'Know festivals, concerts, and local happenings before you land.',
  },
  {
    icon: CloudRain,
    title: 'Smart Weather Alerts',
    description: 'Proactive notifications when storms threaten your travel dates.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Food Discovery',
    description: 'Restaurants ranked by quality, cost, and proximity to your stay.',
  },
  {
    icon: Route,
    title: 'Route Intelligence',
    description: 'Compare flights, trains, buses, and car rentals in one view.',
  },
  {
    icon: Shield,
    title: 'Safe Community',
    description: 'AI toxicity filtering keeps reviews trustworthy and respectful.',
  },
  {
    icon: MessageCircle,
    title: 'Travel Assistant',
    description: 'Context-aware chat that knows your trips, weather, and bookings.',
  },
]

export function Features() {
  const { ref, inView } = useInView()

  return (
    <section id="features" ref={ref} className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-medium text-brand-700 dark:text-brand-400 mb-3 tracking-wide uppercase">
            Everything you need
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-4">
            Intelligence at every step
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            From discovery to booking, Voyager orchestrates AI and real-time data so you travel with confidence.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className={cn(
                'group glass rounded-2xl p-8 transition-all duration-300',
                'hover:shadow-xl hover:shadow-brand-700/5 hover:-translate-y-1',
                'dark:hover:border-brand-500/20'
              )}
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 transition-transform group-hover:scale-110">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
