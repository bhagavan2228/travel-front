import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Explorer',
    price: 'Free',
    description: 'Perfect for occasional travelers',
    features: ['5 trips per year', 'Basic weather alerts', 'Community reviews', 'Destination search'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Voyager Pro',
    price: '$12',
    period: '/month',
    description: 'For frequent explorers who want more',
    features: [
      'Unlimited trips',
      'AI event predictions',
      'Priority assistant',
      'Advanced route planning',
      'Toxicity-safe comments',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Teams and travel agencies',
    features: ['Admin moderation', 'API access', 'Custom branding', 'Dedicated support', 'SLA guarantee'],
    cta: 'Contact sales',
    highlighted: false,
  },
]

export function Pricing() {
  const { ref, inView } = useInView()

  return (
    <section id="pricing" ref={ref} className="py-24 sm:py-32 mesh-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Start free. Upgrade when you need AI superpowers for every journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'rounded-2xl p-8 flex flex-col transition-all duration-300',
                plan.highlighted
                  ? 'glass-strong ring-2 ring-brand-600/30 scale-[1.02] shadow-2xl shadow-brand-700/10'
                  : 'glass hover:shadow-lg'
              )}
            >
              {plan.highlighted && (
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-4">
                  Most popular
                </span>
              )}
              <h3 className="font-semibold text-xl text-slate-900 dark:text-white">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="font-display text-4xl font-semibold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
