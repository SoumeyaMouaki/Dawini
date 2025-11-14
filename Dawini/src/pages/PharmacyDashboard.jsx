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
  Pill,
  Package,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react'
import api from '../api/axios.js'
import ProfilePictureUpload from '../components/ProfilePictureUpload.jsx'
import SearchSuggestions from '../components/SearchSuggestions.jsx'
import ChatSystem from '../components/ChatSystem.jsx'
import NewConversation from '../components/NewConversation.jsx'
import NotificationBadge from '../components/NotificationBadge.jsx'
import PharmacyPrescriptionsList from '../components/PharmacyPrescriptionsList.jsx'
import PharmacySettings from '../components/PharmacySettings.jsx'

export default function PharmacyDashboard() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, messages, prescriptions, settings
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    completedPrescriptions: 0,
    totalRevenue: 0
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load prescriptions
        const prescriptionsResponse = await api.get('/api/prescriptions')
        const allPrescriptions = prescriptionsResponse.data.prescriptions || []
        setPrescriptions(allPrescriptions)
      
      // Calculate stats
        const pendingPrescriptions = allPrescriptions.filter(pres => 
          pres.status === 'pending'
        )
        const completedPrescriptions = allPrescriptions.filter(pres => 
          pres.status === 'completed'
        )
      
      setStats({
          totalPrescriptions: allPrescriptions.length,
          pendingPrescriptions: pendingPrescriptions.length,
          completedPrescriptions: completedPrescriptions.length,
          totalRevenue: completedPrescriptions.reduce((sum, pres) => sum + (pres.totalAmount || 0), 0)
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

  const handlePrescriptionStatus = async (prescriptionId, status) => {
    try {
      await api.put(`/api/prescriptions/${prescriptionId}`, { status })
      
      // Update local state
      setPrescriptions(prev => 
        prev.map(pres => 
          pres._id === prescriptionId ? { ...pres, status } : pres
        )
      )
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingPrescriptions: status === 'pending' ? prev.pendingPrescriptions + 1 : prev.pendingPrescriptions - 1,
        completedPrescriptions: status === 'completed' ? prev.completedPrescriptions + 1 : prev.completedPrescriptions - 1
      }))
      
    } catch (error) {
      console.error('Error updating prescription status:', error)
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <ProfilePictureUpload
                currentImage={user.profilePicture}
                onImageChange={(imageUrl) => {
                  console.log('Profile picture updated:', imageUrl)
                }}
                userId={user.id || user._id}
                userType="pharmacist"
                size="lg"
              />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {user.pharmacyName || 'Pharmacie'} 💊
                </h1>
                <p className="text-green-100 text-xl font-medium">Gérez vos ordonnances et vos patients</p>
                <div className="flex items-center text-green-200 mt-2">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{user.address?.commune}, {user.address?.wilaya}</span>
                </div>
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
              onClick={() => setActiveTab('prescriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prescriptions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Ordonnances</span>
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
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' ? (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
        {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                      <p className="text-blue-100 text-sm font-medium">Ordonnances</p>
                      <p className="text-3xl font-bold text-white">{stats.totalPrescriptions}</p>
              </div>
            </div>
          </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                      <p className="text-yellow-100 text-sm font-medium">En attente</p>
                      <p className="text-3xl font-bold text-white">{stats.pendingPrescriptions}</p>
              </div>
            </div>
          </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                      <p className="text-green-100 text-sm font-medium">Terminées</p>
                      <p className="text-3xl font-bold text-white">{stats.completedPrescriptions}</p>
              </div>
            </div>
          </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-purple-100 text-sm font-medium">Revenus</p>
                      <p className="text-3xl font-bold text-white">{stats.totalRevenue} DA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  Ordonnances récentes
                </h3>
                
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune ordonnance pour le moment</p>
                    <p className="text-sm text-gray-400">Les nouvelles ordonnances apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.slice(0, 5).map(prescription => (
                      <div key={prescription._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {prescription.patientId?.userId?.fullName || 'Patient inconnu'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Dr. {prescription.doctorId?.userId?.fullName}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                              prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {prescription.status === 'completed' ? 'Terminée' :
                               prescription.status === 'pending' ? 'En attente' :
                               prescription.status}
                            </span>
                            
                            {prescription.status === 'pending' && (
                              <button
                                onClick={() => handlePrescriptionStatus(prescription._id, 'completed')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Marquer terminée
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
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-primary-600" />
                  Actions rapides
                </h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => setActiveTab('prescriptions')}
                    className="w-full bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-800 font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-bold">Ordonnances</div>
                      <div className="text-sm opacity-80">Gérer les prescriptions</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="w-full bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center relative"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-bold">Messages</div>
                        <div className="text-sm opacity-80">Communiquer avec les patients</div>
                      </div>
                    </div>
                    <NotificationBadge 
                      count={unreadMessageCount} 
                      type="message" 
                      size="sm"
                      className="absolute -top-1 -right-1"
                    />
                  </button>
                  
                  <button className="w-full bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-800 font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center">
                    <Package className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-bold">Inventaire</div>
                      <div className="text-sm opacity-80">Gérer le stock</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 text-orange-800 font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-bold">Paramètres</div>
                      <div className="text-sm opacity-80">Configurer la pharmacie</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Today's Prescriptions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-600" />
                  Ordonnances d'aujourd'hui
                </h3>
                
                {prescriptions.filter(pres => {
                  const today = new Date().toISOString().split('T')[0]
                  const prescriptionDate = new Date(pres.createdAt).toISOString().split('T')[0]
                  return prescriptionDate === today
                }).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Aucune ordonnance aujourd'hui</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions
                      .filter(pres => {
                        const today = new Date().toISOString().split('T')[0]
                        const prescriptionDate = new Date(pres.createdAt).toISOString().split('T')[0]
                        return prescriptionDate === today
                      })
                      .map(prescription => (
                        <div key={prescription._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {prescription.patientId?.userId?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Dr. {prescription.doctorId?.userId?.fullName}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                            prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {prescription.status === 'completed' ? 'Terminée' :
                             prescription.status === 'pending' ? 'En attente' :
                             prescription.status}
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
                    <span className="text-lg font-bold text-gray-900">{stats.totalRevenue} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ordonnances terminées</span>
                    <span className="text-sm font-medium text-gray-900">{stats.completedPrescriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taux de completion</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats.totalPrescriptions > 0 ? 
                        Math.round((stats.completedPrescriptions / stats.totalPrescriptions) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'prescriptions' ? (
        /* Prescriptions Tab */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ordonnances</h2>
            <div className="flex items-center space-x-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="all">Toutes</option>
                <option value="pending">En attente</option>
                <option value="completed">Terminées</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            {prescriptions.length === 0 ? (
            <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune ordonnance trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div key={prescription._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {prescription.patientId?.userId?.fullName || 'Patient inconnu'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Dr. {prescription.doctorId?.userId?.fullName}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                          prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {prescription.status === 'completed' ? 'Terminée' :
                           prescription.status === 'pending' ? 'En attente' :
                           prescription.status}
                        </span>
                        
                        {prescription.status === 'pending' && (
                          <button
                            onClick={() => handlePrescriptionStatus(prescription._id, 'completed')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Marquer terminée
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
      ) : activeTab === 'prescriptions' ? (
        /* Prescriptions Tab */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PharmacyPrescriptionsList />
        </div>
      ) : activeTab === 'settings' ? (
        /* Settings Tab */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PharmacySettings 
            user={user}
            onSave={(data) => console.log('Settings saved:', data)}
          />
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
    </div>
  )
}