import { useState } from 'react'
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
  Plus,
  Pill,
  Stethoscope
} from 'lucide-react'

export default function DoctorPrescriptionsList({ prescriptions = [], onStatusChange }) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false)

  // Mock data for demonstration
  const mockPrescriptions = [
    {
      _id: '1',
      patientId: {
        userId: {
          fullName: 'Ahmed Benali',
          email: 'ahmed.benali@email.com'
        }
      },
      medications: [
        { name: 'Aspirine', dosage: '100mg', frequency: '1x/jour', duration: '7 jours' },
        { name: 'Atorvastatine', dosage: '20mg', frequency: '1x/jour', duration: '30 jours' }
      ],
      status: 'active',
      createdAt: new Date().toISOString(),
      diagnosis: 'Hypertension artérielle',
      notes: 'Prendre avec les repas. Contrôle tension dans 2 semaines.',
      followUpDate: new Date(Date.now() + 14 * 86400000).toISOString()
    },
    {
      _id: '2',
      patientId: {
        userId: {
          fullName: 'Fatima Zohra',
          email: 'fatima.zohra@email.com'
        }
      },
      medications: [
        { name: 'Crème hydratante', dosage: '50g', frequency: '2x/jour', duration: '14 jours' },
        { name: 'Antihistaminique', dosage: '10mg', frequency: '1x/jour', duration: '10 jours' }
      ],
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      diagnosis: 'Dermatite atopique',
      notes: 'Appliquer sur peau propre. Éviter les produits parfumés.',
      followUpDate: null
    }
  ]

  const displayPrescriptions = prescriptions.length > 0 ? prescriptions : mockPrescriptions

  const filteredPrescriptions = displayPrescriptions.filter(prescription => {
    const matchesFilter = filter === 'all' || prescription.status === filter
    const matchesSearch = searchTerm === '' || 
      prescription.patientId?.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleStatusChange = async (prescriptionId, newStatus) => {
    try {
      if (onStatusChange) {
        await onStatusChange(prescriptionId, newStatus)
      }
      console.log(`Changing prescription ${prescriptionId} to ${newStatus}`)
    } catch (error) {
      console.error('Error changing prescription status:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
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
      case 'active':
        return 'Active'
      case 'completed':
        return 'Terminée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            Mes Ordonnances
          </h2>
          <p className="text-gray-600 mt-2">Gérez et suivez toutes les ordonnances que vous avez prescrites</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsCreatingPrescription(true)}
            className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle ordonnance
          </button>
          <button className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par patient ou diagnostic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900 placeholder-gray-500 font-medium"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900 font-medium appearance-none bg-white"
              >
                <option value="all">Toutes les ordonnances</option>
                <option value="active">Actives</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-white">{displayPrescriptions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Actives</p>
              <p className="text-3xl font-bold text-white">
                {displayPrescriptions.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Terminées</p>
              <p className="text-3xl font-bold text-white">
                {displayPrescriptions.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Patients uniques</p>
              <p className="text-3xl font-bold text-white">
                {new Set(displayPrescriptions.map(p => p.patientId?.userId?.fullName)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune ordonnance trouvée</h3>
            <p className="text-gray-500">
              {searchTerm ? 
                `Aucune ordonnance ne correspond à "${searchTerm}"` :
                'Aucune ordonnance ne correspond aux filtres sélectionnés'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-xl font-bold text-gray-900">
                            {prescription.patientId?.userId?.fullName || 'Patient inconnu'}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                            {getStatusText(prescription.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                            <span className="font-medium">Date:</span>
                            <span className="ml-1">
                              {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {prescription.followUpDate && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-primary-600" />
                              <span className="font-medium">Suivi:</span>
                              <span className="ml-1">
                                {new Date(prescription.followUpDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Diagnosis */}
                        {prescription.diagnosis && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-semibold text-blue-900 mb-1">Diagnostic:</h5>
                            <p className="text-blue-800">{prescription.diagnosis}</p>
                          </div>
                        )}

                        {/* Medications */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Médicaments prescrits:</h5>
                          <div className="space-y-2">
                            {prescription.medications?.map((med, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                  <Pill className="w-4 h-4 text-primary-600 mr-3" />
                                  <div>
                                    <span className="font-medium text-gray-900">{med.name}</span>
                                    <span className="text-gray-600 ml-2">({med.dosage})</span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  <div>{med.frequency}</div>
                                  {med.duration && <div>Durée: {med.duration}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {prescription.notes && (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>Notes médicales:</strong> {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      {prescription.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(prescription._id, 'completed')}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Terminer
                        </button>
                      )}
                      
                      {prescription.status === 'active' && (
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
            ))}
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {isCreatingPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nouvelle ordonnance</h2>
                <button 
                  onClick={() => setIsCreatingPrescription(false)}
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
                  onClick={() => setIsCreatingPrescription(false)}
                  className="btn btn-primary"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
