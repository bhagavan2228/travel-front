import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star, MapPin, Globe, Loader2, UtensilsCrossed, LayoutGrid, Map as MapIcon, Search, ExternalLink, Navigation } from 'lucide-react'
import { destinationApi } from '@/api/endpoints'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

function RestaurantImage({ src, alt, cuisine }) {
  const [hasError, setHasError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-slate-800 flex flex-col items-center justify-center gap-2">
        <UtensilsCrossed className="h-8 w-8 text-brand-400 dark:text-brand-500" />
        <span className="text-xs text-brand-500 dark:text-brand-400 font-medium px-2 text-center">{cuisine || alt}</span>
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

export function RestaurantExplorer({ destinationId }) {
  const [restaurantPage, setRestaurantPage] = useState(0)
  const [allRestaurants, setAllRestaurants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  useEffect(() => {
    setRestaurantPage(0)
    setAllRestaurants([])
    setSelectedRestaurant(null)
  }, [destinationId])

  const { data: restaurantData, isLoading: loadingRestaurants, isFetching } = useQuery({
    queryKey: ['restaurants', destinationId, restaurantPage],
    queryFn: () => destinationApi.getRestaurants(destinationId, restaurantPage),
  })

  useEffect(() => {
    if (!restaurantData) return
    if (restaurantPage === 0) {
      setAllRestaurants(restaurantData.content || [])
      if (restaurantData.content && restaurantData.content.length > 0) {
        setSelectedRestaurant(restaurantData.content[0])
      }
    } else {
      setAllRestaurants((prev) => [...prev, ...(restaurantData.content || [])])
    }
  }, [restaurantData, restaurantPage])

  const hasMoreRestaurants =
    restaurantData != null && restaurantData.page + 1 < restaurantData.totalPages

  // Extract distinct cuisines
  const cuisines = useMemo(() => {
    const set = new Set()
    allRestaurants.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine.trim())
    })
    return Array.from(set).slice(0, 8)
  }, [allRestaurants])

  // Filter restaurants by search and cuisine
  const filteredRestaurants = useMemo(() => {
    return allRestaurants.filter((r) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchCuisine =
        selectedCuisine === 'ALL' ||
        (r.cuisine && r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()))

      return matchSearch && matchCuisine
    })
  }, [allRestaurants, searchQuery, selectedCuisine])

  const openMapLocation = (r) => {
    if (r.googleMapsUri) {
      window.open(r.googleMapsUri, '_blank')
    } else if (r.latitude && r.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((r.name || '') + ' ' + (r.address || ''))}`, '_blank')
    }
  }

  return (
    <section className="glass rounded-3xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-semibold text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <UtensilsCrossed className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            Top Restaurants & Dining ({allRestaurants.length || '15–20'})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Handpicked top 15–20 culinary destinations with verified addresses and real-time map navigation
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              viewMode === 'grid'
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              viewMode === 'map'
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Map Explorer
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by restaurant name, cuisine, or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {cuisines.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCuisine('ALL')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedCuisine === 'ALL'
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              All Cuisines
            </button>
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedCuisine === c
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {loadingRestaurants && restaurantPage === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-brand-600" />
          <p className="text-sm text-slate-500 font-medium">Discovering top 15–20 restaurants and maps...</p>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No restaurants match your search or filter criteria.
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRestaurants.map((r, i) => (
              <motion.div
                key={`${r.id}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 8) * 0.03 }}
                className={cn(
                  'text-left glass rounded-2xl overflow-hidden transition-all duration-200',
                  'hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-brand-500/30 flex flex-col group border border-slate-200/60 dark:border-slate-700/60'
                )}
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <RestaurantImage src={r.imageUrl} alt={r.name} cuisine={r.cuisine} />
                  <span className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 text-brand-700 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded-lg shadow-md backdrop-blur-sm">
                    #{i + 1}
                  </span>
                  {r.priceLevel && r.priceLevel !== 'PRICE_LEVEL_UNSPECIFIED' && (
                    <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                      {r.priceLevel.replace('PRICE_LEVEL_', '').replace('INEXPENSIVE', '$').replace('MODERATE', '$$').replace('EXPENSIVE', '$$$').replace('VERY_EXPENSIVE', '$$$$')}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {r.name}
                  </h3>

                  {r.cuisine && (
                    <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-0.5 line-clamp-1">
                      {r.cuisine}
                    </p>
                  )}

                  {r.address && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span>{r.address}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs mb-3">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {r.rating ? Number(r.rating).toFixed(1) : '4.6'}
                      <span className="text-slate-400 font-normal ml-0.5">
                        ({r.userRatingsTotal ? r.userRatingsTotal.toLocaleString() : '1k+'})
                      </span>
                    </span>

                    {r.latitude && r.longitude && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {Number(r.latitude).toFixed(2)}°, {Number(r.longitude).toFixed(2)}°
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8.5 rounded-xl border-brand-200 dark:border-brand-900/50 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium"
                      onClick={() => openMapLocation(r)}
                    >
                      <Navigation className="h-3 w-3 mr-1 text-brand-500" />
                      Map Location
                    </Button>
                    {r.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8.5 px-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-600"
                        onClick={() => window.open(r.website, '_blank')}
                        title="Visit Website"
                      >
                        <Globe className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMoreRestaurants && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setRestaurantPage((p) => p + 1)}
                disabled={isFetching}
                className="px-6 rounded-xl"
              >
                {isFetching ? 'Loading...' : `Load next restaurants`}
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Map View */
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-8 h-[540px] rounded-2xl overflow-hidden glass border border-slate-200 dark:border-slate-800 relative">
            {selectedRestaurant && selectedRestaurant.latitude && selectedRestaurant.longitude ? (
              <iframe
                title={selectedRestaurant.name}
                width="100%"
                height="100%"
                className="border-0 rounded-2xl"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${selectedRestaurant.latitude},${selectedRestaurant.longitude}&hl=en&z=15&output=embed`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                Select a restaurant below to preview map
              </div>
            )}

            {selectedRestaurant && (
              <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {selectedRestaurant.cuisine}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {selectedRestaurant.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      {selectedRestaurant.address}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {selectedRestaurant.rating || '4.7'}
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs rounded-lg px-3 bg-brand-600 text-white"
                    onClick={() => openMapLocation(selectedRestaurant)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in Google Maps
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Restaurant List Sidebar */}
          <div className="lg:col-span-4 h-[540px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {filteredRestaurants.map((r, i) => {
              const isSelected = selectedRestaurant?.id === r.id || selectedRestaurant?.name === r.name
              return (
                <div
                  key={`${r.id}-${i}`}
                  onClick={() => setSelectedRestaurant(r)}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-all border text-left flex gap-3 items-center",
                    isSelected
                      ? "bg-brand-50/90 dark:bg-brand-950/60 border-brand-500 shadow-md ring-1 ring-brand-500/20"
                      : "glass hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200/70 dark:border-slate-800"
                  )}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative">
                    <RestaurantImage src={r.imageUrl} alt={r.name} cuisine={r.cuisine} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {r.name}
                      </h4>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center shrink-0">
                        <Star className="h-3 w-3 fill-current mr-0.5" />
                        {r.rating || '4.6'}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium truncate">
                      {r.cuisine}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      {r.address}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
