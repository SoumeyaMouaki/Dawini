import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  MessageSquare, 
  Settings, 
  Search,
  MapPin,
  Phone,
  Heart,
  AlertTriangle,
  Plus
} from 'lucide-react'
import api from '../api/axios.js'
import ProfilePictureUpload from '../components/ProfilePictureUpload.jsx'
import SearchSuggestions from '../components/SearchSuggestions.jsx'
import AppointmentBooking from '../components/AppointmentBooking.jsx'
import ChatSystem from '../components/ChatSystem.jsx'
import NewConversation from '../components/NewConversation.jsx'
import NotificationBadge from '../components/NotificationBadge.jsx'
// Leaflet will be loaded dynamically
let L = null;

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapInstance, setMapInstance] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)

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
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [searchResults, setSearchResults] = useState({ doctors: [], total: 0, filters: {} })
  const [isSearching, setIsSearching] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [searchError, setSearchError] = useState('')
  const [search, setSearch] = useState({
    specialization: '',
    wilaya: '',
    commune: '',
    date: '',
    time: ''
  })
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, messages

  // Load user data and appointments
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load appointments
        const appointmentsResponse = await api.get('/api/appointments')
        setAppointments(appointmentsResponse.data.appointments || [])
        
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  // Initialize map
  useEffect(() => {
    const mapContainer = document.getElementById('patient-map')
    if (!mapInstance && mapContainer && !mapContainer._leaflet_id && L) {
      try {
        const map = L.map('patient-map').setView([36.75, 3.06], 10)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map)
        setMapInstance(map)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }
  }, [mapInstance])

  // Search doctors
  const runSearch = async (e) => {
    e.preventDefault()
    try {
      setIsSearching(true)
      setSearchError('')
      
      const params = new URLSearchParams()
      if (search.specialization) params.append('specialization', search.specialization)
      if (search.wilaya) params.append('wilaya', search.wilaya)
      if (search.commune) params.append('commune', search.commune)
      if (search.date) params.append('date', search.date)
      if (search.time) params.append('time', search.time)

      const response = await api.get(`/api/doctors?${params.toString()}`)
      setSearchResults({
        doctors: response.data.doctors || [],
        total: response.data.total || 0,
        filters: {
          specialization: search.specialization,
          wilaya: search.wilaya,
          commune: search.commune,
          date: search.date,
          time: search.time
        }
      })
      
      // Update map with doctor locations
      if (mapInstance && response.data.doctors) {
        markers.forEach(m => m.remove())
        const newMarkers = []
        response.data.doctors.forEach(doctor => {
          if (doctor.userId?.address?.coordinates?.lat && doctor.userId?.address?.coordinates?.lng && L) {
            const marker = L.marker([doctor.userId.address.coordinates.lat, doctor.userId.address.coordinates.lng])
              .addTo(mapInstance)
              .bindPopup(`
                <div class="p-2">
                  <h3 class="font-bold text-lg">Dr. ${doctor.userId.fullName}</h3>
                  <p class="text-sm text-gray-600">${doctor.specialization}</p>
                  <p class="text-xs text-gray-500">${doctor.userId.address.commune}, ${doctor.userId.address.wilaya}</p>
                  <button 
                    onclick="window.open('/search?specialization=${doctor.specialization}&wilaya=${doctor.userId.address.wilaya}', '_blank')"
                    class="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Voir détails
                  </button>
                </div>
              `)
            newMarkers.push(marker)
          }
        })
        setMarkers(newMarkers)
        
        if (newMarkers.length > 0 && L) {
          const group = new L.featureGroup(newMarkers)
          mapInstance.fitBounds(group.getBounds().pad(0.5))
        }
      }
      
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Erreur lors de la recherche de médecins')
    } finally {
      setIsSearching(false)
    }
  }

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setIsBookingOpen(true)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion requise</h2>
          <p className="text-gray-600 mb-4">Veuillez vous connecter pour accéder à votre tableau de bord.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfilePictureUpload
                currentImage={user.profilePicture}
                onImageChange={(imageUrl) => {
                  console.log('Profile picture updated:', imageUrl)
                }}
                userId={user.id || user._id}
                userType="patient"
                size="lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bonjour, {user.fullName} 👋
                </h1>
                <p className="text-gray-600">Gérez vos rendez-vous et votre santé</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rendez-vous</p>
                      <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Médecins</p>
                      <p className="text-2xl font-bold text-gray-900">{searchResults.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{unreadMessageCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Doctors */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-primary-600" />
                  Rechercher un médecin
                </h2>
                
                <form onSubmit={runSearch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchSuggestions
                      searchType="specialty"
                      value={search.specialization}
                      onSelect={(value) => setSearch({ ...search, specialization: value })}
                      placeholder="Spécialité (ex: Cardiologie)"
                      icon={Stethoscope}
                    />
                    <SearchSuggestions
                      searchType="location"
                      value={search.wilaya}
                      onSelect={(value) => setSearch({ ...search, wilaya: value })}
                      placeholder="Localisation (ex: Alger)"
                      icon={MapPin}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="date"
                      className="input"
                      value={search.date}
                      onChange={(e) => setSearch({ ...search, date: e.target.value })}
                      placeholder="Date souhaitée"
                    />
                    <input
                      type="time"
                      className="input"
                      value={search.time}
                      onChange={(e) => setSearch({ ...search, time: e.target.value })}
                      placeholder="Heure souhaitée"
                    />
                  </div>
                  
                  {searchError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        <p className="text-sm text-red-700">{searchError}</p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full btn btn-primary"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Rechercher des médecins
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Search Results */}
              {searchResults.doctors.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Médecins trouvés ({searchResults.total})
                  </h3>
                  
                  <div className="space-y-4">
                    {searchResults.doctors.map(doctor => (
                      <div key={doctor._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              Dr. {doctor.userId?.fullName}
                            </h4>
                            <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {doctor.userId?.address?.commune}, {doctor.userId?.address?.wilaya}
                            </div>
                            {doctor.userId?.phone && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {doctor.userId.phone}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              {doctor.consultationFee ? `${doctor.consultationFee} DA` : 'Gratuit'}
                            </p>
                            <button
                              onClick={() => handleBookAppointment(doctor)}
                              className="mt-2 btn btn-sm btn-primary"
                            >
                              Prendre RDV
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Appointments */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Mes rendez-vous récents
                </h3>
                
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun rendez-vous pour le moment</p>
                    <p className="text-sm text-gray-400">Recherchez un médecin pour prendre un rendez-vous</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map(appointment => (
                      <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Dr. {appointment.doctorId?.userId?.fullName}
                            </h4>
                            <p className="text-sm text-gray-600">{appointment.doctorId?.specialization}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmé' :
                             appointment.status === 'pending' ? 'En attente' :
                             appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Medical Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Informations médicales
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Allergies</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.allergies?.length > 0 ? (
                        user.allergies.map((allergy, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Aucune allergie connue</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Maladies chroniques</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.chronicConditions?.length > 0 ? (
                        user.chronicConditions.map((condition, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {condition}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Aucune maladie chronique</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Médecins à proximité
                </h3>
                <div id="patient-map" className="w-full h-64 rounded-lg border border-gray-200"></div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="w-full btn btn-outline flex items-center justify-center relative"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </div>
                    <NotificationBadge 
                      count={unreadMessageCount} 
                      type="message" 
                      size="sm"
                      className="absolute -top-1 -right-1"
                    />
                  </button>
                  <button className="w-full btn btn-outline flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Mes ordonnances
                  </button>
                  <button className="w-full btn btn-outline flex items-center justify-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Messages Tab */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <button
              onClick={() => setIsNewConversationOpen(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle conversation
            </button>
          </div>
          
          <ChatSystem
            currentUser={user}
            selectedConversation={selectedConversation}
            onConversationSelect={setSelectedConversation}
            onUnreadCountChange={setUnreadMessageCount}
          />
        </div>
      )}

      {/* New Conversation Modal */}
      <NewConversation
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
        onConversationCreated={(conversation) => {
          setSelectedConversation(conversation)
          setActiveTab('messages')
        }}
        currentUser={user}
      />

      {/* Appointment Booking Modal */}
      {isBookingOpen && selectedDoctor && (
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
    </div>
  )
}