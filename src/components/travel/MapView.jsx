import { useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Loader2 } from 'lucide-react'

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 'inherit'
}

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629 // Default to center of India if coords missing
}

export function MapView({ latitude, longitude, name, className = "w-full h-80 rounded-2xl overflow-hidden" }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  })

  const center = latitude && longitude 
    ? { lat: latitude, lng: longitude } 
    : defaultCenter

  const onLoad = useCallback(function callback() {
    // map loaded
  }, [])

  const onUnmount = useCallback(function callback() {
    // map unmounted
  }, [])

  if (loadError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${className}`}>
        <p className="text-slate-500 text-sm">Failed to load Google Maps.</p>
        <p className="text-slate-400 text-xs mt-1">Check your API key configuration.</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={latitude && longitude ? 10 : 4}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true,
          }}
        >
          {latitude && longitude && (
            <Marker 
              position={center} 
              title={name}
            />
          )}
        </GoogleMap>
      )}
    </div>
  )
}
