import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Sparkles, Map, MapPin, ImageOff } from 'lucide-react'
import { RestaurantExplorer } from '@/components/travel/RestaurantExplorer'
import { destinationApi } from '@/api/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { MapView } from '@/components/travel/MapView'
import { WeatherCard } from '@/components/travel/WeatherCard'

function HeroImage({ src, alt }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="w-full aspect-[21/9] bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 flex flex-col items-center justify-center gap-3">
        <ImageOff className="h-12 w-12 text-white/40" />
        <span className="text-white/60 font-display text-lg">{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full aspect-[21/9] object-cover"
      onError={() => setHasError(true)}
    />
  )
}

/**
 * Splits a long description into readable paragraphs.
 * We split on sentence boundaries, grouping roughly 3-4 sentences per paragraph.
 */
function DescriptionRenderer({ text }) {
  if (!text) return null

  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)

  if (sentences.length <= 4) {
    return <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
  }

  // Group into paragraphs of ~4 sentences
  const paragraphs = []
  for (let i = 0; i < sentences.length; i += 4) {
    paragraphs.push(sentences.slice(i, i + 4).join(' '))
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  )
}

export function DestinationDetailPage() {
  const { id } = useParams()
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
          <HeroImage src={destination.imageUrl} alt={destination.name} />
          <div className="p-8">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-2">
              {destination.name}
            </h1>
            <p className="text-slate-500 mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-brand-500" />
                {[destination.city, destination.state, destination.country].filter(Boolean).join(', ')}
              </span>
              {destination.exploredCount !== undefined && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-brand-600 dark:text-brand-400 font-medium bg-brand-500/10 dark:bg-brand-400/10 px-2 py-0.5 rounded-full text-xs">
                    Explored {destination.exploredCount} times
                  </span>
                </>
              )}
            </p>

            <DescriptionRenderer text={destination.description} />

            {destination.bestSeason && (
              <p className="mt-4 text-sm text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Best season: {destination.bestSeason}
              </p>
            )}

            {destination.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="glass rounded-2xl p-6 mb-12">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
            <Sparkles className="h-5 w-5 text-brand-600" />
            Top Places to Visit & Best Times
          </h2>
          <ul className="space-y-3">
            {events?.length ? (
              events.map((e, i) => (
                <li key={i} className="text-sm border-l-2 border-brand-500 pl-4">
                  <p className="font-medium text-slate-900 dark:text-white">{e.name || e.title}</p>
                  <p className="text-slate-500 font-semibold text-xs text-brand-600 dark:text-brand-400 mt-0.5">{e.date} · {e.category}</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{e.description}</p>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recommendations available yet.</p>
            )}
          </ul>
        </section>

        <WeatherCard destinationId={destId} />

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
