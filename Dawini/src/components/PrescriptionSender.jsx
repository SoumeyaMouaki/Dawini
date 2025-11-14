import { useState, useEffect } from 'react'
import { 
  FileText, 
  User, 
  MapPin, 
  Phone, 
  Search,
  Plus,
  Minus,
  Send,
  X,
  Clock,
  Pill,
  AlertCircle,
  CheckCircle,
  Building
} from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function PrescriptionSender({ 
  isOpen, 
  onClose, 
  doctorId, 
  onPrescriptionSent,
  selectedPatient = null 
}) {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: Patient, 2: Prescription, 3: Pharmacy, 4: Confirm
  const [selectedPatientData, setSelectedPatientData] = useState(selectedPatient)
  const [pharmacies, setPharmacies] = useState([])
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [patients, setPatients] = useState([])
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  
  // Mock pharmacies data
  const mockPharmacies = [
    {
      _id: 'ph1',
      pharmacyName: 'Pharmacie du Centre',
      ownerName: 'Dr. Ahmed Benali',
      address: {
        street: '123 Rue de la Santé',
        commune: 'Alger Centre',
        wilaya: 'Alger'
      },
      phone: '+213 555 123 456',
      email: 'pharmacie.centre@email.com',
      licenseNumber: 'PH-2024-001',
      isOpen: true,
      rating: 4.8,
      distance: '0.5 km'
    },
    {
      _id: 'ph2',
      pharmacyName: 'Pharmacie de la Paix',
      ownerName: 'Dr. Fatima Zohra',
      address: {
        street: '456 Avenue de la Paix',
        commune: 'Hydra',
        wilaya: 'Alger'
      },
      phone: '+213 555 789 012',
      email: 'pharmacie.paix@email.com',
      licenseNumber: 'PH-2024-002',
      isOpen: true,
      rating: 4.6,
      distance: '1.2 km'
    },
    {
      _id: 'ph3',
      pharmacyName: 'Pharmacie El Djazair',
      ownerName: 'Dr. Mohamed Amine',
      address: {
        street: '789 Boulevard Mohamed V',
        commune: 'Bab Ezzouar',
        wilaya: 'Alger'
      },
      phone: '+213 555 345 678',
      email: 'pharmacie.djazair@email.com',
      licenseNumber: 'PH-2024-003',
      isOpen: false,
      rating: 4.4,
      distance: '2.1 km'
    }
  ]

  const [prescriptionData, setPrescriptionData] = useState({
    patientId: selectedPatient?._id || '',
    diagnosis: '',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '' }
    ],
    notes: '',
    followUpDate: '',
    urgency: 'normal' // normal, urgent, emergency
  })

  useEffect(() => {
    if (isOpen) {
      // Load pharmacies from API
      const loadPharmacies = async () => {
        try {
          // Load more pharmacies (limit=100) and don't filter by isVerified/isActive for now
          const response = await api.get('/api/pharmacies', {
            params: {
              limit: 100,
              page: 1
            }
          })
          const pharmaciesList = response.data.pharmacies || response.data || []
          console.log('Loaded pharmacies:', pharmaciesList.length, pharmaciesList)
          setPharmacies(pharmaciesList)
          
          if (pharmaciesList.length === 0) {
            console.warn('No pharmacies found, using mock data')
            setPharmacies(mockPharmacies)
          }
        } catch (error) {
          console.error('Error loading pharmacies:', error)
          // Fallback to mock data if API fails
          setPharmacies(mockPharmacies)
        }
      }
      loadPharmacies()
      
      if (selectedPatient) {
        setSelectedPatientData(selectedPatient)
        // Use the patient's _id from the Patient model, not userId
        const patientId = selectedPatient._id || selectedPatient.id
        setPrescriptionData(prev => ({ ...prev, patientId }))
        setStep(2)
      }
    }
  }, [isOpen, selectedPatient])

  useEffect(() => {
    if (!patientSearchTerm || patientSearchTerm.length < 2) {
      setPatients([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingPatients(true)
      try {
        // Get doctor profile ID first
        const doctorResponse = await api.get('/api/doctors')
        const doctorProfiles = doctorResponse.data.doctors || []
        const currentDoctorProfile = doctorProfiles.find(doctor => 
          doctor.userId._id === user?.id || doctor.userId._id === user?._id
        )
        
        if (!currentDoctorProfile) {
          setError('Profil médecin non trouvé')
          return
        }

        // Search patients
        const params = new URLSearchParams()
        params.append('name', patientSearchTerm)
        const response = await api.get(`/api/doctors/${currentDoctorProfile._id}/patients/search?${params.toString()}`)
        const patientsList = response.data.patients || []
        setPatients(patientsList)
      } catch (error) {
        console.error('Error searching patients:', error)
        setError('Erreur lors de la recherche de patients')
      } finally {
        setIsLoadingPatients(false)
      }
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [patientSearchTerm, user])

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...prescriptionData.medications]
    newMedications[index][field] = value
    setPrescriptionData(prev => ({ ...prev, medications: newMedications }))
  }

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }))
  }

  const removeMedication = (index) => {
    if (prescriptionData.medications.length > 1) {
      const newMedications = prescriptionData.medications.filter((_, i) => i !== index)
      setPrescriptionData(prev => ({ ...prev, medications: newMedications }))
    }
  }

  const handleSendPrescription = async () => {
    if (!selectedPharmacy || !selectedPatientData) {
      setError('Veuillez sélectionner une pharmacie et un patient')
      return
    }

    // Validate IDs are MongoDB ObjectIds
    const patientId = selectedPatientData._id || selectedPatientData.id
    const pharmacyId = selectedPharmacy._id || selectedPharmacy.id
    
    if (!patientId || !pharmacyId) {
      setError('ID patient ou pharmacie manquant')
      return
    }

    // Check if IDs look like MongoDB ObjectIds (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    if (!objectIdRegex.test(patientId)) {
      setError('ID patient invalide. Veuillez sélectionner un patient valide.')
      return
    }
    if (!objectIdRegex.test(pharmacyId)) {
      setError('ID pharmacie invalide. Veuillez sélectionner une pharmacie valide.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Calculate expiry date (30 days from now by default)
      const expiryDate = prescriptionData.followUpDate 
        ? new Date(prescriptionData.followUpDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      const prescriptionPayload = {
        patientId: patientId,
        pharmacyId: pharmacyId,
        diagnosis: prescriptionData.diagnosis,
        medications: prescriptionData.medications.filter(med => med.name && med.dosage && med.frequency && med.duration),
        instructions: prescriptionData.notes || '',
        expiryDate: expiryDate.toISOString()
      }

      // Send prescription to backend API
      const response = await api.post('/api/prescriptions', prescriptionPayload)
      const savedPrescription = response.data
      
      console.log('✅ Prescription sent successfully:', savedPrescription)
      
      if (onPrescriptionSent) {
        onPrescriptionSent(savedPrescription)
      }
      
      // Reset form
      setPrescriptionData({
        patientId: '',
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: '',
        followUpDate: '',
        urgency: 'normal'
      })
      setSelectedPharmacy(null)
      setStep(1)
      onClose()
      
    } catch (error) {
      console.error('Error sending prescription:', error)
      
      // Afficher les détails de l'erreur de validation
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => err.msg || err.message).join(', ')
          setError(`Erreur de validation: ${errorMessages}`)
        } else {
          setError(errorData.message || 'Erreur de validation')
        }
      } else {
        setError(error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de l\'ordonnance')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    if (!searchTerm) return true
    
    const search = searchTerm.toLowerCase()
    const name = pharmacy.pharmacyName?.toLowerCase() || ''
    const commune = pharmacy.location?.commune?.toLowerCase() || pharmacy.address?.commune?.toLowerCase() || ''
    const wilaya = pharmacy.location?.wilaya?.toLowerCase() || pharmacy.address?.wilaya?.toLowerCase() || ''
    
    return name.includes(search) || commune.includes(search) || wilaya.includes(search)
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Nouvelle ordonnance</h2>
              <p className="text-primary-100 mt-1">
                Étape {step} sur 4 - {step === 1 ? 'Sélection du patient' : 
                step === 2 ? 'Rédaction de l\'ordonnance' :
                step === 3 ? 'Choix de la pharmacie' : 'Confirmation'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-primary-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    stepNum <= step ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {/* Step 1: Patient Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sélection du patient</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un patient (nom, email, NSS)..."
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Patient search results */}
              <div className="space-y-3">
                {isLoadingPatients ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Recherche en cours...</p>
                  </div>
                ) : patients.length === 0 && patientSearchTerm.length >= 2 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun patient trouvé</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tapez au moins 2 caractères pour rechercher un patient</p>
                  </div>
                ) : (
                  patients.map((patient) => (
                    <div
                      key={patient._id}
                      onClick={() => {
                        setSelectedPatientData(patient)
                        setPrescriptionData(prev => ({ ...prev, patientId: patient._id }))
                        setStep(2)
                      }}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{patient.userId?.fullName || patient.fullName}</h4>
                          <p className="text-gray-600">{patient.userId?.email || patient.email}</p>
                          {patient.nss && (
                            <p className="text-gray-500 text-sm">NSS: {patient.nss}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Prescription Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Détails de l'ordonnance</h3>
                
                {/* Patient Info */}
                {selectedPatientData && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h4 className="font-bold text-blue-900 mb-2">Patient sélectionné</h4>
                    <p className="text-blue-800">{selectedPatientData.fullName}</p>
                    <p className="text-blue-600 text-sm">{selectedPatientData.email}</p>
                  </div>
                )}

                {/* Diagnosis */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnostic *
                  </label>
                  <textarea
                    value={prescriptionData.diagnosis}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    rows={3}
                    placeholder="Décrivez le diagnostic..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                  />
                </div>

                {/* Medications */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Médicaments prescrits *
                    </label>
                    <button
                      onClick={addMedication}
                      className="btn bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-4">
                    {prescriptionData.medications.map((med, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Médicament {index + 1}</h5>
                          {prescriptionData.medications.length > 1 && (
                            <button
                              onClick={() => removeMedication(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Nom du médicament
                            </label>
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              placeholder="Ex: Aspirine"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Dosage
                            </label>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                              placeholder="Ex: 100mg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Fréquence
                            </label>
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                              placeholder="Ex: 1x/jour"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Durée
                            </label>
                            <input
                              type="text"
                              value={med.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                              placeholder="Ex: 7 jours"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes médicales
                    </label>
                    <textarea
                      value={prescriptionData.notes}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder="Instructions spéciales..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de suivi
                    </label>
                    <input
                      type="date"
                      value={prescriptionData.followUpDate}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'urgence
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'normal', label: 'Normal', color: 'green' },
                      { value: 'urgent', label: 'Urgent', color: 'yellow' },
                      { value: 'emergency', label: 'Urgence', color: 'red' }
                    ].map((urgency) => (
                      <label key={urgency.value} className="flex items-center">
                        <input
                          type="radio"
                          name="urgency"
                          value={urgency.value}
                          checked={prescriptionData.urgency === urgency.value}
                          onChange={(e) => setPrescriptionData(prev => ({ ...prev, urgency: e.target.value }))}
                          className="mr-2"
                        />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          urgency.color === 'green' ? 'bg-green-100 text-green-800' :
                          urgency.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {urgency.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pharmacy Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sélection de la pharmacie</h3>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une pharmacie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                  />
                </div>

                <div className="space-y-4">
                  {filteredPharmacies.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {searchTerm 
                          ? `Aucune pharmacie trouvée pour "${searchTerm}"`
                          : 'Aucune pharmacie disponible'
                        }
                      </p>
                      {pharmacies.length === 0 && (
                        <p className="text-gray-400 text-sm mt-2">
                          Vérifiez votre connexion ou contactez l'administrateur
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredPharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy._id}
                      onClick={() => setSelectedPharmacy(pharmacy)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedPharmacy?._id === pharmacy._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Building className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-gray-900">{pharmacy.pharmacyName}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pharmacy.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{pharmacy.ownerName || pharmacy.userId?.fullName || ''}</p>
                            <div className="flex items-center text-gray-500 text-sm mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>
                                {pharmacy.location?.street || pharmacy.address?.street || ''}
                                {pharmacy.location?.commune || pharmacy.address?.commune ? `, ${pharmacy.location?.commune || pharmacy.address?.commune}` : ''}
                                {pharmacy.location?.wilaya || pharmacy.address?.wilaya ? `, ${pharmacy.location?.wilaya || pharmacy.address?.wilaya}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Phone className="w-4 h-4 mr-1" />
                              <span>{pharmacy.contactInfo?.phone || pharmacy.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        {selectedPharmacy?._id === pharmacy._id && (
                          <CheckCircle className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmation de l'envoi</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Patient</h4>
                    <p className="text-gray-700">{selectedPatientData?.fullName}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Diagnostic</h4>
                    <p className="text-gray-700">{prescriptionData.diagnosis}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Médicaments</h4>
                    <div className="space-y-2">
                      {prescriptionData.medications.map((med, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-primary-600" />
                          <span className="text-gray-700">
                            {med.name} ({med.dosage}) - {med.frequency} pendant {med.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Pharmacie de destination</h4>
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedPharmacy?.pharmacyName}</p>
                        <p className="text-gray-600 text-sm">
                          {selectedPharmacy?.location?.commune || selectedPharmacy?.address?.commune || ''}
                          {selectedPharmacy?.location?.wilaya || selectedPharmacy?.address?.wilaya 
                            ? `, ${selectedPharmacy?.location?.wilaya || selectedPharmacy?.address?.wilaya}` 
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {prescriptionData.notes && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Notes médicales</h4>
                      <p className="text-gray-700">{prescriptionData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="btn btn-outline"
            >
              {step === 1 ? 'Annuler' : 'Précédent'}
            </button>
            
            <div className="flex space-x-3">
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !selectedPatientData) ||
                    (step === 2 && (!prescriptionData.diagnosis || prescriptionData.medications.some(m => !m.name))) ||
                    (step === 3 && !selectedPharmacy)
                  }
                  className="btn bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleSendPrescription}
                  disabled={isLoading}
                  className="btn bg-green-500 hover:bg-green-600 text-white flex items-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer l'ordonnance
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
