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
  Package
} from 'lucide-react'
import prescriptionService from '../services/PrescriptionService.js'

export default function PharmacyPrescriptionsList({ pharmacyId = 'pharmacy_1' }) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Charger les ordonnances depuis le service
  useEffect(() => {
    const loadPrescriptions = () => {
      setIsLoading(true)
      try {
        // Obtenir les ordonnances pour cette pharmacie
        const pharmacyPrescriptions = prescriptionService.getPrescriptionsForPharmacy(pharmacyId)
        
        // Ajouter quelques données mockées pour la démonstration si aucune ordonnance réelle
        if (pharmacyPrescriptions.length === 0) {
          const mockPrescriptions = [
            {
              _id: 'pres_demo_1',
              patientId: {
                userId: {
                  fullName: 'Ahmed Benali',
                  email: 'ahmed.benali@email.com'
                }
              },
              doctorId: {
                userId: {
                  fullName: 'Dr. Sarah Khelil'
                },
                specialization: 'Cardiologie'
              },
              medications: [
                { name: 'Aspirine', dosage: '100mg', frequency: '1x/jour' },
                { name: 'Atorvastatine', dosage: '20mg', frequency: '1x/jour' }
              ],
              status: 'pending',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
              totalAmount: 2500,
              notes: 'Prendre avec les repas',
              urgency: 'normal',
              doctorNotes: 'Patient avec hypertension artérielle. Contrôle tension dans 2 semaines.',
              isNewFromDoctor: false
            }
          ]
          setPrescriptions(mockPrescriptions)
        } else {
          setPrescriptions(pharmacyPrescriptions)
        }
      } catch (error) {
        console.error('Error loading prescriptions:', error)
        setPrescriptions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPrescriptions()

    // Écouter les changements en temps réel
    const unsubscribe = prescriptionService.addListener((updatedPrescriptions) => {
      const pharmacyPrescriptions = updatedPrescriptions.filter(p => p.pharmacyId === pharmacyId)
      setPrescriptions(pharmacyPrescriptions)
    })

    return unsubscribe
  }, [pharmacyId])

  // Gérer le changement de statut d'une ordonnance
  const handleStatusChange = (prescriptionId, newStatus) => {
    try {
      prescriptionService.updatePrescriptionStatus(prescriptionId, newStatus)
      console.log(`✅ Prescription ${prescriptionId} status changed to ${newStatus}`)
    } catch (error) {
      console.error('Error updating prescription status:', error)
    }
  }

  // Filtrer les ordonnances
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesFilter = filter === 'all' || prescription.status === filter
    const matchesSearch = !searchTerm || 
      prescription.patientId?.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorId?.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent_by_doctor':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'sent_by_doctor':
        return 'Reçue du médecin'
      case 'pending':
        return 'En cours'
      case 'completed':
        return 'Terminée'
      case 'cancelled':
        return 'Annulée'
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
                <option value="sent_by_doctor">Nouvelles du médecin</option>
                <option value="pending">En cours</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
            <div key={prescription._id} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {prescription.patientId?.userId?.fullName || 'Patient non spécifié'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                          {getStatusText(prescription.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(prescription.urgency)}`}>
                          {getUrgencyText(prescription.urgency)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Médecin</p>
                          <p className="font-semibold text-gray-900">
                            {prescription.doctorId?.userId?.fullName || 'Médecin non spécifié'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {prescription.doctorId?.specialization || 'Spécialité non spécifiée'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Date de création</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(prescription.createdAt).toLocaleTimeString('fr-FR', { 
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

                      {/* Notes du médecin */}
                      {prescription.doctorNotes && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium mb-1">Notes du médecin :</p>
                          <p className="text-sm text-blue-700">{prescription.doctorNotes}</p>
                        </div>
                      )}

                      {/* Indicateur nouvelle ordonnance */}
                      {prescription.isNewFromDoctor && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-blue-800">
                              ✨ Nouvelle ordonnance reçue directement du médecin
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{prescription.totalAmount || 0} DA</p>
                    <p className="text-sm text-gray-500">Montant total</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {prescription.status === 'sent_by_doctor' && (
                      <button
                        onClick={() => handleStatusChange(prescription._id, 'pending')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accepter
                      </button>
                    )}
                    
                    {prescription.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(prescription._id, 'completed')}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Terminer
                      </button>
                    )}
                    
                    {(prescription.status === 'pending' || prescription.status === 'sent_by_doctor') && (
                      <button
                        onClick={() => handleStatusChange(prescription._id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}