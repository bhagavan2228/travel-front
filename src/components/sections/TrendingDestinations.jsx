import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useInView } from '@/hooks/useInView'
import { destinationApi } from '@/api/endpoints'
import { DestinationCard } from '@/components/travel/DestinationCard'
import { DestinationCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export function TrendingDestinations() {
  const { ref, inView } = useInView()
  
  const { data: destinations, isLoading } = useQuery({
    queryKey: ['destinations', 'trending'],
    queryFn: () => destinationApi.getAll(),
  })

  // Take top 3 for the landing page
  const trending = destinations?.slice(0, 3) || []

  return (
    <section id="trending" ref={ref} className="py-24 sm:py-32 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-4">
              Trending right now
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Discover the most popular destinations our AI is helping travelers explore this week.
            </p>
          </div>
          
          <div className="hidden sm:block">
            <Link to="/destinations">
              <Button variant="outline" className="gap-2 group">
                View all destinations
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <DestinationCardSkeleton key={i} />)
          ) : trending.length > 0 ? (
            trending.map((d, i) => <DestinationCard key={d.id} destination={d} index={i} />)
          ) : (
            <div className="col-span-3 text-center py-12 text-slate-500">
              No destinations available at the moment.
            </div>
          )}
        </div>
        
        <div className="mt-8 sm:hidden text-center">
          <Link to="/destinations">
            <Button variant="outline" className="w-full gap-2">
              View all destinations
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
