import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, User, Stethoscope, Star, Clock, Phone, Mail } from 'lucide-react'
import api from '../api/axios.js'
import AppointmentBooking from '../components/AppointmentBooking.jsx'
import TestAppointment from '../components/TestAppointment.jsx'
// Leaflet will be loaded dynamically
let L = null;

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mapInstance, setMapInstance] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isTestOpen, setIsTestOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leafletModule = await import('leaflet');
        L = leafletModule.default;
        await import('leaflet/dist/leaflet.css');
      } catch (error) {
        console.warn('Leaflet not available:', error);
      }
    };
    loadLeaflet();
  }, []);

  // Get search parameters
  const specialization = searchParams.get('specialization') || ''
  const wilaya = searchParams.get('wilaya') || ''
  const commune = searchParams.get('commune') || ''
  const date = searchParams.get('date') || ''

  useEffect(() => {
    searchDoctors()
    // Load user data if logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [searchParams])

  const searchDoctors = async () => {
    try {
      setIsLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (specialization) params.append('specialization', specialization)
      if (wilaya) params.append('wilaya', wilaya)
      if (commune) params.append('commune', commune)
      if (date) params.append('date', date)
      params.append('available', 'true')
      params.append('limit', '50')

      const { data } = await api.get(`/api/doctors?${params.toString()}`)
      setDoctors(data.doctors || [])

      // Initialize map
      setTimeout(() => {
        initializeMap(data.doctors || [])
      }, 100)

    } catch (err) {
      console.error('Search error:', err)
      setError('Erreur lors de la recherche. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeMap = (doctors) => {
    const mapContainer = document.getElementById('search-map')
    if (!mapContainer || mapContainer._leaflet_id) return

    if (L) {
      try {
        const map = L.map('search-map').setView([36.75, 3.06], 10)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map)

      // Add markers for doctors
      doctors.forEach(doctor => {
        const lat = doctor.userId?.address?.coordinates?.lat
        const lng = doctor.userId?.address?.coordinates?.lng
        if (typeof lat === 'number' && typeof lng === 'number' && L) {
          const marker = L.marker([lat, lng]).addTo(map)
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${doctor.userId?.fullName || ''}</h3>
              <p class="text-blue-600 font-medium">${doctor.specialization || ''}</p>
              <p class="text-gray-600 text-sm">${doctor.userId?.address?.wilaya || ''}, ${doctor.userId?.address?.commune || ''}</p>
              <p class="text-green-600 font-medium">${doctor.consultationFee ? `${doctor.consultationFee} DA` : 'Gratuit'}</p>
            </div>
          `)
        }
      })

      setMapInstance(map)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }
  }

  const handleBookAppointment = (doctor) => {
    const token = localStorage.getItem('token')
    if (token && user?.userType === 'patient') {
      setSelectedDoctor(doctor)
      setIsBookingOpen(true)
    } else {
      navigate('/login', { state: { redirectTo: `/search?${searchParams.toString()}` } })
    }
  }

  const handleTestAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setIsTestOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Résultats de recherche</h1>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Critères de recherche</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {specialization && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <Stethoscope className="w-4 h-4 mr-2" />
                {specialization}
              </div>
            )}
            {wilaya && (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4 mr-2" />
                {wilaya}
              </div>
            )}
            {commune && (
              <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4 mr-2" />
                {commune}
              </div>
            )}
            {date && (
              <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(date).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Results List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'Recherche en cours...' : `${doctors.length} médecin${doctors.length > 1 ? 's' : ''} trouvé${doctors.length > 1 ? 's' : ''}`}
                </h3>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Recherche en cours...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={searchDoctors}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-12">
                    <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucun médecin trouvé</p>
                    <p className="text-gray-400">Essayez avec d'autres critères de recherche</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctors.map(doctor => (
                      <div key={doctor._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">
                              {doctor.userId?.fullName}
                            </h4>
                            <p className="text-primary-600 font-medium text-lg mb-2">
                              {doctor.specialization}
                            </p>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              {doctor.userId?.address?.wilaya}, {doctor.userId?.address?.commune}
                            </div>
                            {doctor.biography && (
                              <p className="text-gray-600 text-sm mb-3">{doctor.biography}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {doctor.consultationFee ? `${doctor.consultationFee} DA` : 'Gratuit'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.consultationDuration || 30} min
                            </div>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {doctor.services?.nightService && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Service de nuit
                            </span>
                          )}
                          {doctor.services?.homeVisit && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Visite à domicile
                            </span>
                          )}
                          {doctor.services?.videoConsultation && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Consultation vidéo
                            </span>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {doctor.userId?.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {doctor.userId.phone}
                              </div>
                            )}
                            {doctor.userId?.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {doctor.userId.email}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBookAppointment(doctor)}
                              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                              Prendre RDV
                            </button>
                            <button
                              onClick={() => handleTestAppointment(doctor)}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                            >
                              Test
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
              <div id="search-map" className="w-full h-96 rounded-lg border border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {isBookingOpen && selectedDoctor && user?.userType === 'patient' && (
        <AppointmentBooking
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false)
            setSelectedDoctor(null)
          }}
          doctor={selectedDoctor}
          patientId={user.id || user._id}
        />
      )}

      {/* Test Appointment Modal */}
      {isTestOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Test de Réservation</h2>
                <button
                  onClick={() => {
                    setIsTestOpen(false)
                    setSelectedDoctor(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <TestAppointment 
                doctor={selectedDoctor}
                patientId={user?.id || user?._id || 'test-patient-id'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
