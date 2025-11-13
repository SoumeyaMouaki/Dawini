import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

const Map = ({ 
  center = [36.7538, 3.0588], 
  zoom = 13, 
  markers = [], 
  className = "w-full h-96 rounded-lg",
  id = "map-container"
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet
        const L = await import('leaflet')
        await import('leaflet/dist/leaflet.css')

        // Fix for default markers in Leaflet
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Initialize map if not already done
        if (mapRef.current && !mapRef.current._leaflet_id) {
          const map = L.map(mapRef.current).setView(center, zoom)
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map)

          mapInstanceRef.current = map

          // Add markers
          markers.forEach(marker => {
            if (marker.position && marker.position.length === 2) {
              const leafletMarker = L.marker(marker.position)
                .addTo(map)
                .bindPopup(marker.popup || '')
              
              markersRef.current.push(leafletMarker)
            }
          })

          // Fit bounds if markers exist
          if (markersRef.current.length > 0) {
            const group = new L.featureGroup(markersRef.current)
            map.fitBounds(group.getBounds().pad(0.1))
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, [center, zoom])

  // Update markers when markers prop changes
  useEffect(() => {
    if (mapInstanceRef.current && markers.length > 0) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add new markers
      markers.forEach(marker => {
        if (marker.position && marker.position.length === 2) {
          const L = window.L || require('leaflet')
          const leafletMarker = L.marker(marker.position)
            .addTo(mapInstanceRef.current)
            .bindPopup(marker.popup || '')
          
          markersRef.current.push(leafletMarker)
        }
      })

      // Fit bounds
      if (markersRef.current.length > 0) {
        const L = window.L || require('leaflet')
        const group = new L.featureGroup(markersRef.current)
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }, [markers])

  return (
    <div className="relative">
      <div 
        ref={mapRef}
        id={id}
        className={className}
        style={{ minHeight: '300px' }}
      />
      
      {/* Fallback content if map fails to load */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg opacity-0 pointer-events-none" id={`${id}-fallback`}>
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Carte non disponible</p>
        </div>
      </div>
    </div>
  )
}

export default Map
