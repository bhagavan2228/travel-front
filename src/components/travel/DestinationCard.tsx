import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Destination } from '@/types'
import { cn } from '@/lib/utils'

const fallbackImage = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80'

export function DestinationCard({ destination, index = 0 }: { destination: Destination; index?: number }) {
  const img = destination.imageUrl || fallbackImage

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/destinations/${destination.id}`}
        className={cn(
          'group block glass rounded-2xl overflow-hidden transition-all duration-300',
          'hover:shadow-xl hover:shadow-brand-700/5 hover:-translate-y-1'
        )}
      >
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={img}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {destination.tags && (
            <span className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs font-medium">
              {destination.tags.split(',')[0]?.trim()}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
            {destination.name}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {[destination.city, destination.state, destination.country].filter(Boolean).join(', ')}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
            {destination.description}
          </p>
        </div>
      </Link>
    </motion.article>
  )
}
