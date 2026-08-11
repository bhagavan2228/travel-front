import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, ChevronRight, Leaf, X, Loader2 } from 'lucide-react'
import { destinationApi } from '@/api/endpoints'
import type { Restaurant, MenuItem } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const PAGE_SIZE = 15

export function RestaurantExplorer({ destinationId }: { destinationId: number }) {
  const [restaurantPage, setRestaurantPage] = useState(0)
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([])
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [menuPage, setMenuPage] = useState(0)
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([])

  useEffect(() => {
    setRestaurantPage(0)
    setAllRestaurants([])
    closeRestaurant()
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

  const { data: menuData, isLoading: loadingMenu, isFetching: fetchingMenu } = useQuery({
    queryKey: ['menu', selected?.id, menuPage],
    queryFn: () => destinationApi.getMenu(selected!.id, menuPage),
    enabled: !!selected,
  })

  useEffect(() => {
    if (!menuData) return
    if (menuPage === 0) {
      setTimeout(() => setAllMenuItems(menuData.content), 0)
    } else {
      setTimeout(() => setAllMenuItems((prev) => [...prev, ...menuData.content]), 0)
    }
  }, [menuData, menuPage])

  function closeRestaurant() {
    setSelected(null)
    setMenuPage(0)
    setAllMenuItems([])
  }

  const openRestaurant = (r: Restaurant) => {
    setSelected(r)
    setMenuPage(0)
    setAllMenuItems([])
  }

  const hasMoreRestaurants =
    restaurantData != null && restaurantData.page + 1 < restaurantData.totalPages
  const hasMoreMenu = menuData != null && menuData.page + 1 < menuData.totalPages

  return (
    <section className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-semibold text-xl text-slate-900 dark:text-white">
            Top restaurants
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Swiggy-style picks — tap a restaurant to see dishes
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
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRestaurants.map((r, i) => (
              <motion.button
                key={r.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % PAGE_SIZE) * 0.03 }}
                onClick={() => openRestaurant(r)}
                className={cn(
                  'text-left glass rounded-xl overflow-hidden transition-all duration-200',
                  'hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-brand-500/20',
                  selected?.id === r.id && 'ring-2 ring-brand-600'
                )}
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 text-xs font-semibold px-2 py-0.5 rounded-md">
                    #{r.id <= 15 ? i + 1 : (restaurantPage * PAGE_SIZE) + i + 1}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {r.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{r.cuisine}</p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {r.rating?.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {r.deliveryMinutes} min
                    </span>
                    <span className="text-slate-500">₹{r.costForTwo} for two</span>
                  </div>
                </div>
              </motion.button>
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

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeRestaurant}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="glass-strong w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={`Menu for ${selected.name}`}
            >
              <div className="flex items-start justify-between p-5 border-b border-slate-200/50 dark:border-white/10">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-slate-500">{selected.cuisine} · Top dishes</p>
                </div>
                <button
                  type="button"
                  onClick={closeRestaurant}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMenu && menuPage === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                  </div>
                ) : (
                  allMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {item.name}
                          </p>
                          {item.veg && (
                            <Leaf className="h-3.5 w-3.5 text-green-600 shrink-0" aria-label="Vegetarian" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            ₹{item.price}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-amber-700">
                            <Star className="h-3 w-3 fill-current" />
                            {item.rating?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 self-center" />
                    </div>
                  ))
                )}
              </div>

              {hasMoreMenu && (
                <div className="p-4 border-t border-slate-200/50 dark:border-white/10">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setMenuPage((p) => p + 1)}
                    disabled={fetchingMenu}
                  >
                    {fetchingMenu ? 'Loading...' : `Load next ${PAGE_SIZE} dishes`}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
