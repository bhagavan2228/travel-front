import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin } from 'lucide-react'
import { destinationApi } from '@/api/endpoints'
import { DestinationCard } from '@/components/travel/DestinationCard'
import { DestinationCardSkeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'

export function DestinationsPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)

  const { data: destinations, isLoading, error, isFetching } = useQuery({
    queryKey: ['destinations', debouncedQuery],
    queryFn: () =>
      debouncedQuery.trim() ? destinationApi.search(debouncedQuery) : destinationApi.getAll(),
  })

  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-4">
            Explore destinations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl">
            Search any city or region — try{' '}
            <button
              type="button"
              onClick={() => setQuery('Hyderabad, Andhra Pradesh')}
              className="text-brand-700 dark:text-brand-300 font-medium hover:underline"
            >
              Hyderabad, Andhra Pradesh
            </button>
          </p>
        </div>

        <div className="relative max-w-xl mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hyderabad, Andhra Pradesh · Mumbai · Goa..."
            className="w-full glass rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Search destinations"
          />
          {isFetching && debouncedQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              Searching...
            </span>
          )}
        </div>

        {error && (
          <div className="glass rounded-xl p-6 text-center text-slate-600 dark:text-slate-400">
            Could not load destinations. Make sure the backend is running.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <DestinationCardSkeleton key={i} />)
            : destinations?.map((d, i) => <DestinationCard key={d.id} destination={d} index={i} />)}
        </div>

        {!isLoading && destinations?.length === 0 && debouncedQuery && (
          <div className="text-center py-12 glass rounded-2xl">
            <MapPin className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No match for &ldquo;{debouncedQuery}&rdquo;. Try city and state separated by a comma.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
