import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Sparkles, Map } from 'lucide-react'
import { RestaurantExplorer } from '@/components/travel/RestaurantExplorer'
import { destinationApi } from '@/api/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { MapView } from '@/components/travel/MapView'

export function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const destId = Number(id)
  const { isAuthenticated } = useAuth()

  const { data: destination, isLoading } = useQuery({
    queryKey: ['destination', destId],
    queryFn: () => destinationApi.getById(destId),
    enabled: !!destId,
  })

  const { data: events } = useQuery({
    queryKey: ['events', destId],
    queryFn: () => destinationApi.getEvents(destId),
    enabled: !!destId,
  })

  if (isLoading) {
    return (
      <div className="pt-28 px-4 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="pt-28 text-center">
        <p>Destination not found.</p>
        <Link to="/destinations" className="text-brand-700 mt-4 inline-block">
          Back to explore
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to destinations
        </Link>

        <div className="glass-strong rounded-3xl overflow-hidden mb-10">
          {destination.imageUrl && (
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-full aspect-[21/9] object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-2">
              {destination.name}
            </h1>
            <p className="text-slate-500 mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{[destination.city, destination.state, destination.country].filter(Boolean).join(', ')}</span>
              {destination.exploredCount !== undefined && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-brand-600 dark:text-brand-400 font-medium bg-brand-500/10 dark:bg-brand-400/10 px-2 py-0.5 rounded-full text-xs">
                    Explored {destination.exploredCount} times
                  </span>
                </>
              )}
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{destination.description}</p>
            {destination.bestSeason && (
              <p className="mt-4 text-sm text-brand-700 dark:text-brand-300">
                Best season: {destination.bestSeason}
              </p>
            )}
          </div>
        </div>

        <section className="glass rounded-2xl p-6 mb-12">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
            <Sparkles className="h-5 w-5 text-brand-600" />
            Predicted events
          </h2>
          <ul className="space-y-3">
            {events?.length ? (
              events.map((e, i) => (
                <li key={i} className="text-sm border-l-2 border-brand-500 pl-4">
                  <p className="font-medium text-slate-900 dark:text-white">{e.name}</p>
                  <p className="text-slate-500">{e.date} · {e.category}</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{e.description}</p>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500">No events predicted yet.</p>
            )}
          </ul>
        </section>

        <section className="glass rounded-2xl p-6 mb-12">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
            <Map className="h-5 w-5 text-brand-600" />
            Location & Map
          </h2>
          <MapView 
            latitude={destination.latitude} 
            longitude={destination.longitude} 
            name={destination.name} 
          />
        </section>

        <div className="mb-12">
          <RestaurantExplorer destinationId={destId} />
        </div>

        <div className="mb-12">
          <ReviewsSection destinationId={destId} />
        </div>

        {isAuthenticated && (
          <div className="mt-8 text-center">
            <Link to="/trips">
              <Button>
                <Calendar className="h-4 w-4" />
                Plan a trip here
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
