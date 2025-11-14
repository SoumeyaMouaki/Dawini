import { useState, useEffect } from 'react'
import { FileText, Calendar, User, MapPin, Phone, Download, Eye, AlertCircle } from 'lucide-react'
import api from '../api/axios.js'

export default function PrescriptionsList({ userId }) {
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPrescriptions()
    
    // Rafraîchir toutes les 30 secondes pour détecter les changements de statut
    const interval = setInterval(fetchPrescriptions, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Charger les ordonnances depuis l'API backend
      const response = await api.get('/api/prescriptions')
      const prescriptionsData = response.data.prescriptions || response.data || []
      
      console.log('📋 Loaded prescriptions for patient:', prescriptionsData.length)
      setPrescriptions(prescriptionsData)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      setError('Erreur lors du chargement des ordonnances')
      setPrescriptions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPrescription = (prescriptionId) => {
    // Simulate download
    console.log('Downloading prescription:', prescriptionId)
    // In a real app, this would trigger a PDF download
  }

  const handleViewPrescription = (prescriptionId) => {
    // Simulate view action
    console.log('Viewing prescription:', prescriptionId)
    // In a real app, this would open a modal or navigate to a detail page
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos ordonnances...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchPrescriptions}
            className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <FileText className="w-8 h-8 mr-3 text-primary-500" />
          Mes ordonnances
        </h3>
        <p className="text-gray-600">Consultez vos prescriptions médicales</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-700 mb-2">Aucune ordonnance</h4>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore d'ordonnances enregistrées</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map(prescription => (
            <div 
              key={prescription._id} 
              className={`rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                prescription.status === 'filled' 
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 hover:border-blue-400 ring-2 ring-blue-200' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">
                        Dr. {prescription.doctorId?.userId?.fullName || prescription.doctorId?.fullName || 'Médecin inconnu'}
                      </h4>
                      <p className="text-green-600 font-semibold text-lg mb-2">{prescription.doctorId?.specialization || 'Spécialité non spécifiée'}</p>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span className="text-lg">{new Date(prescription.issueDate || prescription.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        prescription.status === 'active' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                        prescription.status === 'filled' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 animate-pulse' :
                        prescription.status === 'completed' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' :
                        'bg-gray-100 text-gray-800 border-2 border-gray-300'
                      }`}>
                        {prescription.status === 'active' ? '✅ Active' :
                         prescription.status === 'filled' ? '🔔 Prête à récupérer !' :
                         prescription.status === 'completed' ? '✅ Terminée' :
                         prescription.status}
                      </span>
                      {prescription.status === 'filled' && (
                        <div className="mt-3 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                          <p className="text-sm font-bold text-blue-900 mb-2">
                            🎉 Votre ordonnance est prête !
                          </p>
                          {prescription.pharmacy?.notes && (
                            <p className="text-sm text-blue-800">
                              <strong>Message de la pharmacie :</strong> {prescription.pharmacy.notes}
                            </p>
                          )}
                          {prescription.pharmacyId?.pharmacyName && (
                            <p className="text-sm text-blue-700 mt-2">
                              <strong>Pharmacie :</strong> {prescription.pharmacyId.pharmacyName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-22">
                    <h5 className="font-semibold text-gray-800 mb-3">Médicaments prescrits :</h5>
                    <div className="space-y-2">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="bg-white/70 rounded-xl p-4 border border-green-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800">{med.name}</p>
                              <p className="text-gray-600 text-sm">
                                {med.dosage} - {med.frequency} - {med.duration}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {prescription.instructions && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800 font-medium">
                          <strong>Instructions :</strong> {prescription.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-8">
                  <div className="space-y-3">
                    <button
                      onClick={() => handleViewPrescription(prescription._id)}
                      className="w-full btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir détails
                    </button>
                    <button
                      onClick={() => handleDownloadPrescription(prescription._id)}
                      className="w-full btn-outline border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
