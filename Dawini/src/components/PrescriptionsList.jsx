import { useState, useEffect } from 'react'
import { FileText, Calendar, User, MapPin, Phone, Download, Eye, AlertCircle } from 'lucide-react'
import api from '../api/axios.js'

export default function PrescriptionsList({ userId }) {
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [userId])

  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true)
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demonstration
      const mockPrescriptions = [
        {
          _id: '1',
          doctorName: 'Dr. Ahmed Benali',
          specialization: 'Cardiologie',
          date: '2024-01-15',
          medications: [
            { name: 'Aspirine', dosage: '100mg', frequency: '1 fois par jour', duration: '30 jours' },
            { name: 'Atorvastatine', dosage: '20mg', frequency: '1 fois par jour', duration: '90 jours' }
          ],
          instructions: 'Prendre avec de l\'eau, éviter l\'alcool',
          status: 'active'
        },
        {
          _id: '2',
          doctorName: 'Dr. Fatima Zohra',
          specialization: 'Dermatologie',
          date: '2024-01-10',
          medications: [
            { name: 'Crème hydratante', dosage: '50g', frequency: '2 fois par jour', duration: '15 jours' }
          ],
          instructions: 'Appliquer sur peau propre et sèche',
          status: 'completed'
        }
      ]
      
      setPrescriptions(mockPrescriptions)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      setError('Erreur lors du chargement des ordonnances')
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
            <div key={prescription._id} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">
                        {prescription.doctorName}
                      </h4>
                      <p className="text-green-600 font-semibold text-lg mb-2">{prescription.specialization}</p>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span className="text-lg">{new Date(prescription.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        prescription.status === 'active' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                        prescription.status === 'completed' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' :
                        'bg-gray-100 text-gray-800 border-2 border-gray-300'
                      }`}>
                        {prescription.status === 'active' ? '✅ Active' :
                         prescription.status === 'completed' ? '✅ Terminée' :
                         prescription.status}
                      </span>
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
