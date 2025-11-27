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
  Plus,
  Eye,
  Star,
  X
} from 'lucide-react'
import api from '../api/axios.js'
import ProfilePictureUpload from '../components/ProfilePictureUpload.jsx'
import SearchSuggestions from '../components/SearchSuggestions.jsx'
import AppointmentBooking from '../components/AppointmentBooking.jsx'
import ChatSystem from '../components/ChatSystem.jsx'
import NewConversation from '../components/NewConversation.jsx'
import NotificationBadge from '../components/NotificationBadge.jsx'
import Map from '../components/Map.jsx'
import PrescriptionsList from '../components/PrescriptionsList.jsx'
import PatientSettings from '../components/PatientSettings.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import PatientPrescriptionNotifications from '../components/PatientPrescriptionNotifications.jsx'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapMarkers, setMapMarkers] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeSection, setActiveSection] = useState('dashboard') // Nouvel état pour gérer les sections // dashboard, messages
  const [cancellingAppointment, setCancellingAppointment] = useState(null) // État pour gérer l'annulation
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointmentId: null, appointmentInfo: null })

  // Load user data and appointments
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch appointments from API
        const appointmentsResponse = await api.get('/api/appointments')
        const appointmentsData = appointmentsResponse.data.appointments || appointmentsResponse.data || []
        
        // Populate doctor information if not already populated
        const appointmentsWithDoctorInfo = appointmentsData.map(appointment => {
          // Ensure doctorId has the correct structure
          if (appointment.doctorId && !appointment.doctorId.userId && appointment.doctorId.fullName) {
            // If doctorId is already populated but in a different format
            return {
              ...appointment,
              doctorId: {
                ...appointment.doctorId,
                userId: {
                  fullName: appointment.doctorId.fullName,
                  phone: appointment.doctorId.phone,
                  address: appointment.doctorId.address
                }
              }
            }
          }
          return appointment
        })
        
        setAppointments(appointmentsWithDoctorInfo)
        
      } catch (error) {
        console.error('Error loading data:', error)
        // Set empty appointments on error
        setAppointments([])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  // Map configuration
  const mapCenter = [36.75, 3.06] // Alger center

  // Cancel appointment function
  const handleCancelAppointment = async (appointmentId) => {
    try {
      setCancellingAppointment(appointmentId)
      
      // Call API to cancel appointment
      await api.delete(`/api/appointments/${appointmentId}`)
      
      // Update appointments list by removing the cancelled appointment
      setAppointments(prevAppointments => 
        prevAppointments.filter(appointment => appointment._id !== appointmentId)
      )
      
      // Close modal
      setCancelModal({ isOpen: false, appointmentId: null, appointmentInfo: null })
      
      // Show success message
      console.log('Rendez-vous annulé avec succès')
      
      } catch (error) {
      console.error('Error cancelling appointment:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'annulation du rendez-vous'
      alert(`Erreur: ${errorMessage}`)
    } finally {
      setCancellingAppointment(null)
    }
  }

  // Open cancel modal
  const openCancelModal = (appointment) => {
    setCancelModal({
      isOpen: true,
      appointmentId: appointment._id,
      appointmentInfo: appointment
    })
  }

  // Close cancel modal
  const closeCancelModal = () => {
    setCancelModal({ isOpen: false, appointmentId: null, appointmentInfo: null })
  }

  // Search doctors
  const runSearch = async (e) => {
    e.preventDefault()
    try {
      setIsSearching(true)
      setSearchError('')
      
      // Simulate API call with mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock doctors data
      const mockDoctors = [
        {
          _id: '1',
          specialization: 'Cardiologie',
          consultationFee: 2500,
          userId: {
            fullName: 'Ahmed Benali',
            phone: '+213 555 123 456',
            address: {
              commune: 'Hydra',
              wilaya: 'Alger',
              coordinates: { lat: 36.7538, lng: 3.0588 }
            }
          }
        },
        {
          _id: '2',
          specialization: 'Dermatologie',
          consultationFee: 2000,
          userId: {
            fullName: 'Fatima Zohra',
            phone: '+213 555 789 012',
            address: {
              commune: 'El Mouradia',
              wilaya: 'Alger',
              coordinates: { lat: 36.7500, lng: 3.0500 }
            }
          }
        },
        {
          _id: '3',
          specialization: 'Pédiatrie',
          consultationFee: 1800,
          userId: {
            fullName: 'Mohamed Cherif',
            phone: '+213 555 345 678',
            address: {
              commune: 'Bab Ezzouar',
              wilaya: 'Alger',
              coordinates: { lat: 36.7200, lng: 3.1800 }
            }
          }
        },
        {
          _id: '4',
          specialization: 'Gynécologie',
          consultationFee: 2200,
          userId: {
            fullName: 'Aicha Boudjedra',
            phone: '+213 555 901 234',
            address: {
              commune: 'Kouba',
              wilaya: 'Alger',
              coordinates: { lat: 36.7400, lng: 3.0900 }
            }
          }
        },
        {
          _id: '5',
          specialization: 'Neurologie',
          consultationFee: 3000,
          userId: {
            fullName: 'Karim Belkacem',
            phone: '+213 555 567 890',
            address: {
              commune: 'Sidi Moussa',
              wilaya: 'Alger',
              coordinates: { lat: 36.7600, lng: 3.1200 }
            }
          }
        }
      ]

      // Filter doctors based on search criteria
      let filteredDoctors = mockDoctors
      
      if (search.specialization) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.specialization.toLowerCase().includes(search.specialization.toLowerCase())
        )
      }
      
      if (search.wilaya) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.userId.address.wilaya.toLowerCase().includes(search.wilaya.toLowerCase())
        )
      }

      setSearchResults({
        doctors: filteredDoctors,
        total: filteredDoctors.length,
        filters: {
          specialization: search.specialization,
          wilaya: search.wilaya,
          commune: search.commune,
          date: search.date,
          time: search.time
        }
      })
      
      // Update map with doctor locations
      if (filteredDoctors.length > 0) {
        const newMarkers = filteredDoctors.map(doctor => {
          if (doctor.userId?.address?.coordinates?.lat && doctor.userId?.address?.coordinates?.lng) {
            return {
              position: [doctor.userId.address.coordinates.lat, doctor.userId.address.coordinates.lng],
              popup: `
                <div class="p-3">
                  <h3 class="font-bold text-lg text-primary-600 mb-2">Dr. ${doctor.userId.fullName}</h3>
                  <p class="text-sm text-gray-600 mb-2">${doctor.specialization}</p>
                  <p class="text-xs text-gray-500 mb-2">${doctor.userId.address.commune}, ${doctor.userId.address.wilaya}</p>
                  <div class="flex space-x-2">
                  <button 
                    onclick="window.open('/search?specialization=${doctor.specialization}&wilaya=${doctor.userId.address.wilaya}', '_blank')"
                      class="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                  >
                    Voir détails
                  </button>
                    <button 
                      onclick="window.open('tel:${doctor.userId.phone || ''}', '_self')"
                      class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Appeler
                    </button>
                  </div>
                </div>
              `
            }
          }
          return null
        }).filter(Boolean)
        
        setMapMarkers(newMarkers)
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
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <ProfilePictureUpload
                currentImage={user.profilePicture}
                onImageChange={(imageUrl) => {
                  console.log('Profile picture updated:', imageUrl)
                }}
                userId={user.id || user._id}
                userType="patient"
                size="xl"
              />
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">
                  Bonjour, {user.fullName} 👋
                </h1>
                <p className="text-primary-100 text-xl font-medium">Gérez vos rendez-vous et votre santé</p>
                <div className="flex items-center text-primary-200 mt-3">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className="text-lg">Votre santé, notre priorité</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <PatientPrescriptionNotifications userId={user.id || user._id} />
              <div className="text-right">
                <p className="text-primary-100 text-sm">Prochain rendez-vous</p>
                <p className="text-white font-semibold">
                  {appointments.length > 0 ? 
                    `${new Date(appointments[0].date).toLocaleDateString('fr-FR')} à ${appointments[0].time}` : 
                    'Aucun RDV prévu'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-6 px-4 border-b-3 font-semibold text-base transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-25'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Tableau de bord</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('messages')}
              className={`py-6 px-4 border-b-3 font-semibold text-base transition-all duration-200 ${
                activeSection === 'messages'
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-25'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
                {unreadMessageCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadMessageCount}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active section */}
      {activeSection === 'dashboard' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-2">Mes rendez-vous</p>
                      <p className="text-4xl font-bold text-white">{appointments.length}</p>
                      <p className="text-blue-200 text-sm mt-1">Rendez-vous programmés</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-2">Médecins disponibles</p>
                      <p className="text-4xl font-bold text-white">{searchResults.total}</p>
                      <p className="text-green-200 text-sm mt-1">Spécialistes près de vous</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-2">Messages</p>
                      <p className="text-4xl font-bold text-white">{unreadMessageCount}</p>
                      <p className="text-purple-200 text-sm mt-1">Nouveaux messages</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Doctors */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center">
                    <Search className="w-8 h-8 mr-3 text-primary-500" />
                  Rechercher un médecin
                </h2>
                  <p className="text-gray-600 text-lg">Trouvez le spécialiste qu'il vous faut</p>
                </div>
                
                <form onSubmit={runSearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Spécialité médicale
                      </label>
                      <div className="relative">
                    <SearchSuggestions
                      searchType="specialty"
                      value={search.specialization}
                      onSelect={(value) => setSearch({ ...search, specialization: value })}
                          placeholder="Ex: Cardiologie, Dermatologie..."
                      icon={Stethoscope}
                    />
                        <div className="absolute inset-0 border-2 border-black rounded-xl pointer-events-none"></div>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Localisation
                      </label>
                      <div className="relative">
                    <SearchSuggestions
                      searchType="location"
                      value={search.wilaya}
                      onSelect={(value) => setSearch({ ...search, wilaya: value })}
                          placeholder="Ex: Alger, Oran, Constantine..."
                      icon={MapPin}
                    />
                        <div className="absolute inset-0 border-2 border-black rounded-xl pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date souhaitée
                      </label>
                      <div className="relative">
                    <input
                      type="date"
                          className="w-full px-4 py-4 border-2 border-black rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200 text-lg font-medium"
                      value={search.date}
                      onChange={(e) => setSearch({ ...search, date: e.target.value })}
                          placeholder="Sélectionnez une date"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Heure préférée
                      </label>
                      <div className="relative">
                    <input
                      type="time"
                          className="w-full px-4 py-4 border-2 border-black rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200 text-lg font-medium"
                      value={search.time}
                      onChange={(e) => setSearch({ ...search, time: e.target.value })}
                          placeholder="Sélectionnez une heure"
                    />
                      </div>
                    </div>
                  </div>
                  
                  {searchError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-red-700 font-medium">{searchError}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                  <button
                    type="submit"
                      className="btn btn-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Recherche en cours...
                      </>
                    ) : (
                      <>
                          <Search className="w-6 h-6 mr-3" />
                        Rechercher des médecins
                      </>
                    )}
                  </button>
                  </div>
                </form>
              </div>

              {/* Search Results */}
              {searchResults.doctors.length > 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Médecins trouvés ({searchResults.total})
                  </h3>
                    <p className="text-gray-600">Choisissez votre spécialiste</p>
                  </div>
                  
                  <div className="space-y-6">
                    {searchResults.doctors.map(doctor => (
                      <div key={doctor._id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-6 mb-4">
                              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center shadow-lg">
                                <Stethoscope className="w-10 h-10 text-primary-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-2xl mb-2">
                              Dr. {doctor.userId?.fullName}
                            </h4>
                                <p className="text-primary-600 font-semibold text-xl mb-2">{doctor.specialization}</p>
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPin className="w-5 h-5 mr-2" />
                                  <span className="text-lg">{doctor.userId?.address?.commune}, {doctor.userId?.address?.wilaya}</span>
                                </div>
                                {doctor.userId?.phone && (
                                  <div className="flex items-center text-gray-600">
                                    <Phone className="w-5 h-5 mr-2" />
                                    <span className="text-lg">{doctor.userId.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center bg-yellow-100 px-4 py-2 rounded-xl">
                                <Star className="w-5 h-5 text-yellow-600 mr-2" />
                                <span className="text-yellow-800 font-semibold">4.8 (24 avis)</span>
                              </div>
                              <div className="flex items-center bg-green-100 px-4 py-2 rounded-xl">
                                <Clock className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-green-800 font-semibold">Disponible aujourd'hui</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-8">
                            <p className="text-2xl font-bold text-green-600 mb-4">
                              {doctor.consultationFee ? `${doctor.consultationFee} DA` : 'Gratuit'}
                            </p>
                            <div className="space-y-3">
                            <button
                              onClick={() => handleBookAppointment(doctor)}
                                className="w-full btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                              Prendre RDV
                            </button>
                              <button className="w-full btn-outline border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                                <Eye className="w-5 h-5 mr-2" />
                                Voir profil
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchResults.total === 0 && (search.specialization || search.wilaya) ? (
                <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">Aucun docteur n'a été trouvé</h3>
                    <p className="text-gray-500 text-lg mb-8">
                      Aucun médecin ne correspond à vos critères de recherche.
                      <br />
                      Essayez de modifier vos filtres ou d'élargir votre recherche.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => setSearch({ specialization: '', wilaya: '', date: '', time: '' })}
                        className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Nouvelle recherche
                      </button>
                      <button
                        onClick={() => setSearch({ specialization: '', wilaya: '', date: '', time: '' })}
                        className="btn-outline border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                      >
                        Voir tous les médecins
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Recent Appointments */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                    <Calendar className="w-8 h-8 mr-3 text-primary-500" />
                  Mes rendez-vous récents
                </h3>
                  <p className="text-gray-600">Suivez vos consultations médicales</p>
                </div>
                
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Aucun rendez-vous</h4>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore de rendez-vous programmés</p>
                    <button className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                      <Search className="w-5 h-5 mr-2" />
                      Rechercher un médecin
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {appointments.slice(0, 5).map(appointment => (
                      <div key={appointment._id} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                              <Stethoscope className="w-8 h-8 text-green-600" />
                            </div>
                          <div>
                              <h4 className="font-bold text-gray-900 text-xl mb-2">
                                Dr. {appointment.doctorId?.userId?.fullName || appointment.doctorId?.fullName || 'Médecin non spécifié'}
                            </h4>
                              <p className="text-green-600 font-semibold text-lg mb-2">
                                {appointment.doctorId?.specialization || 'Spécialité non spécifiée'}
                              </p>
                              <div className="flex items-center text-gray-600 mb-2">
                                <Clock className="w-5 h-5 mr-2" />
                                <span className="text-lg">{new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}</span>
                              </div>
                              {appointment.reason && (
                                <p className="text-gray-600 text-lg">
                                  <strong>Motif:</strong> {appointment.reason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-6 py-3 rounded-xl text-sm font-bold ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                              'bg-gray-100 text-gray-800 border-2 border-gray-300'
                            }`}>
                              {appointment.status === 'confirmed' ? '✅ Confirmé' :
                               appointment.status === 'pending' ? '⏳ En attente' :
                             appointment.status}
                          </span>
                            <div className="mt-4 space-y-3">
                              <button className="w-full btn-outline border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                                <Eye className="w-4 h-4 mr-2" />
                                Détails
                              </button>
                              <button 
                                onClick={() => openCancelModal(appointment)}
                                disabled={cancellingAppointment === appointment._id}
                                className="w-full btn-outline border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {cancellingAppointment === appointment._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                                    Annulation...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-2" />
                                    Annuler RDV
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Medical Info */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                    <Heart className="w-6 h-6 mr-2 text-red-500" />
                  Informations médicales
                </h3>
                  <p className="text-gray-600">Votre profil santé</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {user.allergies?.length > 0 ? (
                        user.allergies.map((allergy, index) => (
                          <span key={index} className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-xl border border-red-200">
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm bg-gray-100 px-3 py-2 rounded-xl">Aucune allergie connue</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Maladies chroniques</p>
                    <div className="flex flex-wrap gap-2">
                      {user.chronicConditions?.length > 0 ? (
                        user.chronicConditions.map((condition, index) => (
                          <span key={index} className="px-3 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-xl border border-orange-200">
                            {condition}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm bg-gray-100 px-3 py-2 rounded-xl">Aucune maladie chronique</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                    <MapPin className="w-6 h-6 mr-2 text-primary-500" />
                  Médecins à proximité
                </h3>
                  <p className="text-gray-600">Trouvez des spécialistes près de vous</p>
                </div>
                <Map 
                  center={mapCenter}
                  zoom={10}
                  markers={mapMarkers}
                  className="w-full h-80 rounded-xl border-2 border-gray-200 shadow-lg"
                  id="patient-map"
                />
                <div className="text-center mt-4">
                  <button className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                    <MapPin className="w-4 h-4 mr-2" />
                    Voir sur la carte
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Actions rapides</h3>
                  <p className="text-gray-600">Accès direct aux services</p>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => setActiveSection('messages')}
                    className="w-full bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-2 border-blue-300 rounded-2xl p-6 flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-blue-800 text-lg">Messages</p>
                        <p className="text-blue-600 text-sm">Communiquez avec vos médecins</p>
                      </div>
                    </div>
                    {unreadMessageCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full px-3 py-1 font-bold">
                        {unreadMessageCount}
                      </div>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('prescriptions')}
                    className="w-full bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 border-2 border-green-300 rounded-2xl p-6 flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-green-800 text-lg">Mes ordonnances</p>
                        <p className="text-green-600 text-sm">Consultez vos prescriptions</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('settings')}
                    className="w-full bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 border-2 border-purple-300 rounded-2xl p-6 flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-purple-800 text-lg">Paramètres</p>
                        <p className="text-purple-600 text-sm">Gérez votre compte</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeSection === 'prescriptions' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="btn-outline border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              ← Retour au tableau de bord
            </button>
          </div>
          <PrescriptionsList userId={user.id || user._id} />
        </div>
      ) : activeSection === 'settings' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="btn-outline border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              ← Retour au tableau de bord
            </button>
          </div>
          <PatientSettings user={user} onUserUpdate={(updatedUser) => {
            // Update user data in context if needed
            console.log('User updated:', updatedUser)
          }} />
        </div>
      ) : activeSection === 'messages' ? (
        /* Messages Tab */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="btn-outline border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 mb-4"
            >
              ← Retour au tableau de bord
            </button>
          </div>
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
      ) : null}

      {/* New Conversation Modal */}
      <NewConversation
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
        onConversationCreated={(conversation) => {
          setSelectedConversation(conversation)
          setActiveSection('messages')
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

      {/* Cancel Appointment Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        onConfirm={() => handleCancelAppointment(cancelModal.appointmentId)}
        title="Annuler le rendez-vous"
        message={
          cancelModal.appointmentInfo ? 
            `Êtes-vous sûr de vouloir annuler votre rendez-vous avec le Dr. ${cancelModal.appointmentInfo.doctorId?.userId?.fullName || 'le médecin'} le ${new Date(cancelModal.appointmentInfo.date).toLocaleDateString('fr-FR')} à ${cancelModal.appointmentInfo.time} ?` :
            'Êtes-vous sûr de vouloir annuler ce rendez-vous ?'
        }
        type="warning"
        confirmText="Oui, annuler"
        cancelText="Non, garder"
        isLoading={cancellingAppointment === cancelModal.appointmentId}
      />
    </div>
  )
}