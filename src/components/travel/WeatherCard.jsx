import { useQuery } from '@tanstack/react-query'
import { Cloud, CloudRain, Sun, Wind, CloudLightning } from 'lucide-react'
import { weatherApi } from '@/api/endpoints'
import { Skeleton } from '@/components/ui/Skeleton'

function getWeatherIcon(condition) {
  const cond = condition ? condition.toLowerCase() : ''
  if (cond.includes('rain')) return <CloudRain className="h-8 w-8 text-blue-500" />
  if (cond.includes('cloud')) return <Cloud className="h-8 w-8 text-slate-400" />
  if (cond.includes('storm') || cond.includes('thunder')) return <CloudLightning className="h-8 w-8 text-yellow-500" />
  if (cond.includes('wind')) return <Wind className="h-8 w-8 text-slate-500" />
  return <Sun className="h-8 w-8 text-yellow-400" />
}

export function WeatherCard({ destinationId }) {
  const { data: weather, isLoading } = useQuery({
    queryKey: ['weather', destinationId],
    queryFn: () => weatherApi.getByDestination(destinationId),
    enabled: !!destinationId,
  })

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-2xl mb-12" />
  }

  if (!weather) return null

  return (
    <div className="glass rounded-2xl p-6 mb-12">
      <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
        <Sun className="h-5 w-5 text-brand-600" />
        Weather & Forecast
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Current Weather */}
        <div className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm text-slate-500 mb-1">Current</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-semibold text-slate-900 dark:text-white">
                {Math.round(weather.temperature)}°
              </span>
              <span className="text-lg text-slate-500 mb-1">{weather.condition}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Feels like {Math.round(weather.feelsLike)}° · Humidity {weather.humidity}%
            </p>
          </div>
          <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-full">
            {getWeatherIcon(weather.condition)}
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="flex-[2] grid grid-cols-5 gap-2">
          {weather.forecast?.map((day, i) => {
            const date = new Date(day.date)
            return (
              <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/30 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 text-center">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                {getWeatherIcon(day.condition)}
                <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {Math.round(day.maxTemp)}°
                  <span className="text-slate-400 font-normal ml-1">{Math.round(day.minTemp)}°</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
