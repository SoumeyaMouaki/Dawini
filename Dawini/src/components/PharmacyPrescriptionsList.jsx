import { useState, useEffect } from 'react'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  Package,
  X,
  Pill,
  Bell,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function PharmacyPrescriptionsList({ pharmacyId = null }) {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFilling, setIsFilling] = useState(false)
  const [fillNotes, setFillNotes] = useState('')

  // Charger les ordonnances depuis l'API backend
  useEffect(() => {
    const loadPrescriptions = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Si pharmacyId n'est pas fourni, récupérer le profil Pharmacy de l'utilisateur
        let targetPharmacyId = pharmacyId
        
        if (!targetPharmacyId && user) {
          try {
            // Récupérer le profil Pharmacy depuis l'API
            const pharmaciesResponse = await api.get('/api/pharmacies')
            const pharmacies = pharmaciesResponse.data.pharmacies || pharmaciesResponse.data || []
            // Trouver la pharmacie qui correspond à l'utilisateur connecté
            const userPharmacy = pharmacies.find(ph => 
              ph.userId?._id === user.id || 
              ph.userId?._id === user._id ||
              ph.userId === user.id ||
              ph.userId === user._id
            )
            
            if (userPharmacy) {
              targetPharmacyId = userPharmacy._id
              console.log('Found pharmacy profile ID:', targetPharmacyId)
            } else {
              console.warn('No pharmacy profile found for user:', user.id)
            }
          } catch (error) {
            console.error('Error fetching pharmacy profile:', error)
          }
        }
        
        if (!targetPharmacyId) {
          // Si pas de pharmacyId spécifique, l'API backend gérera le filtrage automatiquement
          // pour les pharmaciens connectés
        }

        // Récupérer les ordonnances depuis l'API
        // Le backend filtrera automatiquement pour les pharmaciens
        const response = await api.get('/api/prescriptions', {
          params: {
            ...(targetPharmacyId && { pharmacyId: targetPharmacyId }),
            status: filter !== 'all' ? filter : undefined
          }
        })
        
        const prescriptionsData = response.data.prescriptions || response.data || []
        console.log('Loaded prescriptions:', prescriptionsData.length, prescriptionsData)
        setPrescriptions(prescriptionsData)
      } catch (error) {
        console.error('Error loading prescriptions:', error)
        setError('Erreur lors du chargement des ordonnances')
        setPrescriptions([])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadPrescriptions()
      
      // Refresh every 30 seconds to get new prescriptions
      const interval = setInterval(loadPrescriptions, 30000)
      return () => clearInterval(interval)
    }
  }, [pharmacyId, user, filter])

  // Ouvrir la modal de détails
  const handleViewDetails = (prescription) => {
    console.log('Opening prescription details:', prescription)
    setSelectedPrescription(prescription)
    setIsDetailModalOpen(true)
  }

  // Marquer l'ordonnance comme préparée/prête
  const handleMarkAsReady = async () => {
    if (!selectedPrescription) {
      console.error('No prescription selected')
      return
    }

    console.log('Marking prescription as ready:', selectedPrescription._id)
    setIsFilling(true)
    setError(null)
    try {
      // Utiliser la route /fill pour marquer comme préparée
      const response = await api.post(`/api/prescriptions/${selectedPrescription._id}/fill`, {
        filledBy: user?.fullName || user?.pharmacyName || 'Pharmacien',
        notes: fillNotes || undefined
      })
      
      console.log('✅ Prescription marked as ready:', response.data)
      
      // Refresh prescriptions list
      const refreshResponse = await api.get('/api/prescriptions', {
        params: {
          ...(pharmacyId && { pharmacyId }),
          status: filter !== 'all' ? filter : undefined
        }
      })
      setPrescriptions(refreshResponse.data.prescriptions || refreshResponse.data || [])
      
      // Fermer la modal
      setIsDetailModalOpen(false)
      setSelectedPrescription(null)
      setFillNotes('')
      
      // Afficher un message de succès
      alert('✅ Ordonnance marquée comme prête ! Le patient a été notifié par message.')
      
    } catch (error) {
      console.error('Error marking prescription as ready:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la préparation de l\'ordonnance'
      setError(errorMessage)
      alert(`❌ Erreur: ${errorMessage}`)
    } finally {
      setIsFilling(false)
    }
  }

  // Gérer le changement de statut d'une ordonnance (annulation)
  const handleStatusChange = async (prescriptionId, newStatus) => {
    try {
      // Map frontend status to backend status
      const backendStatus = newStatus === 'sent_by_doctor' ? 'active' : 
                           newStatus === 'completed' ? 'filled' : 
                           newStatus === 'cancelled' ? 'cancelled' : 'active'
      
      await api.put(`/api/prescriptions/${prescriptionId}`, {
        status: backendStatus
      })
      
      // Refresh prescriptions list
      const response = await api.get('/api/prescriptions', {
        params: {
          ...(pharmacyId && { pharmacyId }),
          status: filter !== 'all' ? filter : undefined
        }
      })
      setPrescriptions(response.data.prescriptions || response.data || [])
      
      console.log(`✅ Prescription ${prescriptionId} status changed to ${newStatus}`)
    } catch (error) {
      console.error('Error updating prescription status:', error)
      setError('Erreur lors de la mise à jour du statut')
    }
  }

  // Filtrer les ordonnances
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesFilter = filter === 'all' || 
      (filter === 'sent_by_doctor' && prescription.status === 'active') ||
      (filter === 'pending' && prescription.status === 'active') ||
      prescription.status === filter
    const matchesSearch = !searchTerm || 
      prescription.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'filled':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'filled':
        return 'Terminée'
      case 'cancelled':
        return 'Annulée'
      case 'expired':
        return 'Expirée'
      default:
        return status
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'Urgent'
      case 'high':
        return 'Priorité haute'
      case 'normal':
        return 'Normal'
      default:
        return urgency
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Ordonnances</h2>
              <p className="text-gray-600">Suivez et gérez les prescriptions reçues</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total des ordonnances</p>
            <p className="text-3xl font-bold text-primary-600">{prescriptions.length}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par patient, médecin ou diagnostic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200 appearance-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="filled">Terminées</option>
                <option value="cancelled">Annulées</option>
                <option value="expired">Expirées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Aucune ordonnance trouvée</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm || filter !== 'all' 
                  ? 'Aucune ordonnance ne correspond à vos critères de recherche.'
                  : 'Aucune ordonnance n\'a encore été reçue.'
                }
              </p>
            </div>
          </div>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <div 
              key={prescription._id} 
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => handleViewDetails(prescription)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {prescription.patientId?.userId?.fullName || prescription.patientId?.fullName || 'Patient inconnu'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                          {getStatusText(prescription.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Médecin</p>
                          <p className="font-semibold text-gray-900">
                            Dr. {prescription.doctorId?.userId?.fullName || prescription.doctorId?.fullName || 'Médecin inconnu'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {prescription.doctorId?.specialization || 'Spécialité non spécifiée'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Date de création</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(prescription.issueDate || prescription.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(prescription.issueDate || prescription.createdAt).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Médicaments */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Médicaments prescrits</p>
                        <div className="space-y-2">
                          {prescription.medications?.map((medication, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                              <Pill className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{medication.name}</span>
                              <span className="text-gray-600">-</span>
                              <span className="text-gray-600">{medication.dosage}</span>
                              <span className="text-gray-600">-</span>
                              <span className="text-gray-600">{medication.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      {prescription.instructions && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium mb-1">Instructions :</p>
                          <p className="text-sm text-blue-700">{prescription.instructions}</p>
                        </div>
                      )}

                      {/* Diagnostic */}
                      {prescription.diagnosis && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-800 font-medium mb-1">Diagnostic :</p>
                          <p className="text-sm text-gray-700">{prescription.diagnosis}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Code ordonnance</p>
                    <p className="text-lg font-bold text-gray-900">{prescription.prescriptionCode || 'N/A'}</p>
                  </div>

                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleViewDetails(prescription)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir détails
                    </button>
                    {prescription.status === 'active' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPrescription(prescription)
                            setIsDetailModalOpen(true)
                          }}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Marquer prête
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(prescription._id, 'cancelled')
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Annuler
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de détails de l'ordonnance */}
      {isDetailModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Détails de l'ordonnance</h2>
                  <p className="text-blue-100 mt-1">Code: {selectedPrescription.prescriptionCode}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    setSelectedPrescription(null)
                    setFillNotes('')
                  }}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations patient */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Informations patient
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPrescription.patientId?.userId?.fullName || selectedPrescription.patientId?.fullName || 'N/A'}
                    </p>
                  </div>
                  {selectedPrescription.patientId?.userId?.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedPrescription.patientId.userId.email}
                      </p>
                    </div>
                  )}
                  {selectedPrescription.patientId?.userId?.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedPrescription.patientId.userId.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations médecin */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Médecin prescripteur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-semibold text-gray-900">
                      Dr. {selectedPrescription.doctorId?.userId?.fullName || selectedPrescription.doctorId?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Spécialité</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPrescription.doctorId?.specialization || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnostic */}
              {selectedPrescription.diagnosis && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Diagnostic</h3>
                  <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
                </div>
              )}

              {/* Médicaments */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Pill className="w-5 h-5 mr-2 text-primary-600" />
                  Médicaments prescrits
                </h3>
                <div className="space-y-3">
                  {selectedPrescription.medications?.map((medication, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-2">{medication.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Dosage</p>
                              <p className="font-semibold text-gray-900">{medication.dosage}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Fréquence</p>
                              <p className="font-semibold text-gray-900">{medication.frequency}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Durée</p>
                              <p className="font-semibold text-gray-900">{medication.duration}</p>
                            </div>
                            {medication.quantity && (
                              <div>
                                <p className="text-gray-500">Quantité</p>
                                <p className="font-semibold text-gray-900">{medication.quantity} {medication.unit || ''}</p>
                              </div>
                            )}
                          </div>
                          {medication.instructions && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <p className="text-sm text-blue-800">
                                <strong>Instructions:</strong> {medication.instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions générales */}
              {selectedPrescription.instructions && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Instructions générales</h3>
                  <p className="text-gray-700">{selectedPrescription.instructions}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Date d'émission</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedPrescription.issueDate || selectedPrescription.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Date d'expiration</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedPrescription.expiryDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Formulaire de préparation (si active) */}
              {selectedPrescription.status === 'active' && (
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-600" />
                    Préparer l'ordonnance
                  </h3>
                  <div className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes de préparation (optionnel)
                      </label>
                      <textarea
                        value={fillNotes}
                        onChange={(e) => setFillNotes(e.target.value)}
                        placeholder="Ajoutez des notes sur la préparation (ex: médicaments disponibles, délai de préparation, etc.)"
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ces notes seront envoyées au patient dans la notification
                      </p>
                    </div>
                    <button
                      onClick={handleMarkAsReady}
                      disabled={isFilling}
                      className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isFilling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Préparation en cours...
                        </>
                      ) : (
                        <>
                          <Bell className="w-5 h-5 mr-2" />
                          Marquer comme prête et notifier le patient
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Statut si déjà préparée */}
              {selectedPrescription.status === 'filled' && selectedPrescription.pharmacy?.filledAt && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">Ordonnance préparée</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Préparée le {new Date(selectedPrescription.pharmacy.filledAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {selectedPrescription.pharmacy.filledBy && ` par ${selectedPrescription.pharmacy.filledBy}`}
                  </p>
                  {selectedPrescription.pharmacy.notes && (
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Notes:</strong> {selectedPrescription.pharmacy.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}