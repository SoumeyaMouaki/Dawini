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
  Mail,
  Heart,
  Shield,
  AlertTriangle,
  Plus,
  Edit,
  Camera,
  Bell,
  TrendingUp,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download
} from 'lucide-react'
import api from '../api/axios.js'
import ProfilePictureUpload from '../components/ProfilePictureUpload.jsx'
import PatientSearch from '../components/PatientSearch.jsx'
import ChatSystem from '../components/ChatSystem.jsx'
import NewConversation from '../components/NewConversation.jsx'
import NotificationBadge from '../components/NotificationBadge.jsx'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    completedAppointments: 0,
    revenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [isPatientSearchOpen, setIsPatientSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [doctorProfileId, setDoctorProfileId] = useState(null)
  const [isRxOpen, setIsRxOpen] = useState(false)
  const [appointmentFilter, setAppointmentFilter] = useState('all') // all, today, pending, completed
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, messages
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load doctor profile ID
        const doctorResponse = await api.get('/api/doctors')
        const doctorProfiles = doctorResponse.data.doctors || []
        const currentDoctorProfile = doctorProfiles.find(doctor => 
          doctor.userId._id === user._id || doctor.userId._id === user.id
        )
        if (currentDoctorProfile) {
          setDoctorProfileId(currentDoctorProfile._id)
        }

        // Load appointments
        const appointmentsResponse = await api.get('/api/appointments')
        const allAppointments = appointmentsResponse.data.appointments || []
        setAppointments(allAppointments)
      
      // Calculate stats
        const today = new Date().toISOString().split('T')[0]
        const todayAppointments = allAppointments.filter(apt => 
          new Date(apt.date).toISOString().split('T')[0] === today
        )
        const pendingAppointments = allAppointments.filter(apt => 
          apt.status === 'pending'
        )
        const completedAppointments = allAppointments.filter(apt => 
          apt.status === 'completed'
        )
        
        setStats({
          totalAppointments: allAppointments.length,
          todayAppointments: todayAppointments.length,
          pendingAppointments: pendingAppointments.length,
          totalPatients: new Set(allAppointments.map(apt => apt.patientId._id)).size,
          completedAppointments: completedAppointments.length,
          revenue: completedAppointments.reduce((sum, apt) => sum + (apt.payment?.amount || 0), 0)
        })
      
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

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    
    switch (appointmentFilter) {
      case 'today':
        return appointmentDate === today
      case 'pending':
        return appointment.status === 'pending'
      case 'completed':
        return appointment.status === 'completed'
      default:
        return true
    }
  })

  const handleAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.put(`/api/appointments/${appointmentId}`, { status })
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId ? { ...apt, status } : apt
        )
      )
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingAppointments: status === 'pending' ? prev.pendingAppointments + 1 : prev.pendingAppointments - 1,
        completedAppointments: status === 'completed' ? prev.completedAppointments + 1 : prev.completedAppointments - 1
      }))
      
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
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
                userType="doctor"
                size="lg"
              />
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dr. {user.fullName} 👨‍⚕️
              </h1>
                <p className="text-gray-600">{user.specialization || 'Médecin'}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.address?.commune}, {user.address?.wilaya}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="w-6 h-6" />
              </button>
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
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4" />
                <span>Tableau de bord</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
        {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rendez-vous</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
        </div>

          {/* Appointments Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Rendez-vous
                </h2>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="pending">En attente</option>
                    <option value="completed">Terminés</option>
                  </select>
                </div>
              </div>
              
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun rendez-vous trouvé</p>
                  <p className="text-sm text-gray-400">Les nouveaux rendez-vous apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map(appointment => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                              <h4 className="font-semibold text-gray-900">
                                {appointment.patientId?.userId?.fullName || 'Patient inconnu'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {appointment.patientId?.userId?.email || 'Email non disponible'}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                              </div>
                              {appointment.reason && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Motif:</strong> {appointment.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmé' :
                             appointment.status === 'pending' ? 'En attente' :
                             appointment.status === 'completed' ? 'Terminé' :
                             appointment.status}
                          </span>
                          
                          {appointment.status === 'pending' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleAppointmentStatus(appointment._id, 'confirmed')}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Confirmer"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAppointmentStatus(appointment._id, 'cancelled')}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Annuler"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => handleAppointmentStatus(appointment._id, 'completed')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Marquer terminé
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsPatientSearchOpen(true)}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher patient
                </button>
                <button 
                  onClick={() => setIsPrescriptionOpen(true)}
                  className="w-full btn btn-outline flex items-center justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nouvelle ordonnance
                </button>
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
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full btn btn-outline flex items-center justify-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </button>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                Planning d'aujourd'hui
              </h3>
              
              {stats.todayAppointments === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Aucun rendez-vous aujourd'hui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .filter(apt => {
                      const appointmentDate = new Date(apt.date).toISOString().split('T')[0]
                      const today = new Date().toISOString().split('T')[0]
                      return appointmentDate === today
                    })
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(appointment => (
                      <div key={appointment._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.patientId?.userId?.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{appointment.time}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'confirmed' ? 'Confirmé' :
                           appointment.status === 'pending' ? 'En attente' :
                           appointment.status}
                        </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Revenus
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ce mois</span>
                  <span className="text-lg font-bold text-gray-900">{stats.revenue} DA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Consultations terminées</span>
                  <span className="text-sm font-medium text-gray-900">{stats.completedAppointments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux de completion</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.totalAppointments > 0 ? 
                      Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          /* Messages Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              <button
                onClick={() => {
                  console.log('Opening new conversation modal...')
                  setIsNewConversationOpen(true)
                }}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle conversation</span>
              </button>
      </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px]">
              <ChatSystem
                currentUser={user}
                selectedConversation={selectedConversation}
                onConversationSelect={setSelectedConversation}
                onUnreadCountChange={setUnreadMessageCount}
              />
              </div>
              </div>
        )}
              </div>

      {/* Patient Search Modal */}
      {isPatientSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recherche de patients</h2>
                <button 
                  onClick={() => setIsPatientSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              </div>
            <div className="p-6">
              {doctorProfileId ? (
                <PatientSearch doctorId={doctorProfileId} />
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement du profil médecin...</p>
                </div>
              )}
              </div>
                    </div>
                </div>
      )}

      {/* New Conversation Modal */}
      {isNewConversationOpen && (
        <NewConversation
          currentUser={user}
          onClose={() => setIsNewConversationOpen(false)}
          onConversationCreated={(conversation) => {
            setSelectedConversation(conversation)
            setIsNewConversationOpen(false)
            setActiveTab('messages')
          }}
        />
      )}

      {/* Prescription Modal */}
      {isPrescriptionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nouvelle ordonnance</h2>
                <button 
                  onClick={() => setIsPrescriptionOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fonctionnalité en développement</h3>
                <p className="text-gray-600 mb-4">
                  Le système de prescription électronique sera bientôt disponible.
                </p>
                <button
                  onClick={() => setIsPrescriptionOpen(false)}
                  className="btn btn-primary"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={user.fullName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        readOnly
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={user.phone || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Nouveaux messages</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Nouveaux rendez-vous</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="ml-2 text-sm text-gray-700">Rappels de rendez-vous</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="btn btn-primary"
                >
                  Sauvegarder
                </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}