import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'
import { useCountUp } from '@/hooks/useCountUp'

const stats = [
  { label: 'Destinations explored', value: 120, suffix: '+' },
  { label: 'Trips planned', value: 85, suffix: 'k' },
  { label: 'Community reviews', value: 240, suffix: 'k' },
  { label: 'Satisfaction rate', value: 98, suffix: '%' },
]

function StatItem({ label, value, suffix, start }: { label: string; value: number; suffix: string; start: boolean }) {
  const count = useCountUp(value, 2200, start)
  const display = suffix === 'k' ? `${count}${suffix}` : suffix === '%' ? `${count}${suffix}` : `${count}${suffix}`

  return (
    <div className="text-center">
      <p className="font-display text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-white tabular-nums">
        {display}
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

export function Stats() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="py-20 border-y border-slate-200/60 dark:border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="grid grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} start={inView} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
