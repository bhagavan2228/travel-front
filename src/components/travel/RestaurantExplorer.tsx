import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star, MapPin, Globe, Loader2, UtensilsCrossed } from 'lucide-react'
import { destinationApi } from '@/api/endpoints'
import type { Restaurant } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const PAGE_SIZE = 15

function RestaurantImage({ src, alt, cuisine }: { src?: string; alt: string; cuisine?: string }) {
  const [hasError, setHasError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-slate-800 flex flex-col items-center justify-center gap-2">
        <UtensilsCrossed className="h-8 w-8 text-brand-400 dark:text-brand-500" />
        <span className="text-xs text-brand-500 dark:text-brand-400 font-medium">{cuisine || alt}</span>
      </div>
    )
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  )
}

export function RestaurantExplorer({ destinationId }: { destinationId: number }) {
  const [restaurantPage, setRestaurantPage] = useState(0)
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    setRestaurantPage(0)
    setAllRestaurants([])
  }, [destinationId])

  const { data: restaurantData, isLoading: loadingRestaurants, isFetching } = useQuery({
    queryKey: ['restaurants', destinationId, restaurantPage],
    queryFn: () => destinationApi.getRestaurants(destinationId, restaurantPage),
  })

  useEffect(() => {
    if (!restaurantData) return
    if (restaurantPage === 0) {
      setAllRestaurants(restaurantData.content)
    } else {
      setAllRestaurants((prev) => [...prev, ...restaurantData.content])
    }
  }, [restaurantData, restaurantPage])

  const hasMoreRestaurants =
    restaurantData != null && restaurantData.page + 1 < restaurantData.totalPages

  return (
    <section className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-semibold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-brand-600" />
            Top restaurants
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real recommendations powered by AI
          </p>
        </div>
        {restaurantData && (
          <span className="text-xs font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full">
            {restaurantData.totalElements} places
          </span>
        )}
      </div>

      {loadingRestaurants && restaurantPage === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : allRestaurants.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No restaurants found for this location.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRestaurants.map((r, i) => (
              <motion.div
                key={`${r.id}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % PAGE_SIZE) * 0.03 }}
                className={cn(
                  'text-left glass rounded-xl overflow-hidden transition-all duration-200',
                  'hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-brand-500/20 flex flex-col'
                )}
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <RestaurantImage src={r.imageUrl} alt={r.name} cuisine={r.cuisine} />
                  <span className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm">
                    #{i + 1}
                  </span>
                  {r.businessStatus && r.businessStatus !== 'OPERATIONAL' && (
                    <span className="absolute top-2 right-2 bg-red-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                      {r.businessStatus.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {r.name}
                    </h3>
                  </div>
                  
                  {r.address && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {r.address}
                    </p>
                  )}
                  
                  {r.cuisine && <p className="text-xs text-slate-500 mt-1">{r.cuisine}</p>}
                  
                  <div className="flex items-center justify-between mt-3 text-xs mb-3">
                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {r.rating ? r.rating.toFixed(1) : 'New'} 
                      <span className="text-slate-400 ml-1">
                        ({r.userRatingsTotal ? r.userRatingsTotal.toLocaleString() : 0})
                      </span>
                    </span>
                    {r.priceLevel && r.priceLevel !== 'PRICE_LEVEL_UNSPECIFIED' && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {r.priceLevel.replace('PRICE_LEVEL_', '').replace('INEXPENSIVE', '$').replace('MODERATE', '$$').replace('EXPENSIVE', '$$$').replace('VERY_EXPENSIVE', '$$$$')}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    {r.googleMapsUri && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => window.open(r.googleMapsUri, '_blank')}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Maps
                      </Button>
                    )}
                    {r.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => window.open(r.website, '_blank')}
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Website
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMoreRestaurants && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setRestaurantPage((p) => p + 1)}
                disabled={isFetching}
              >
                {isFetching ? 'Loading...' : `Load next ${PAGE_SIZE} restaurants`}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
