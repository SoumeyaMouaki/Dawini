// Service pour gérer les ordonnances en temps réel
class PrescriptionService {
  constructor() {
    this.prescriptions = this.loadFromStorage()
    this.listeners = []
  }

  // Charger depuis le localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('dawini_prescriptions')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading prescriptions from storage:', error)
      return []
    }
  }

  // Sauvegarder dans le localStorage
  saveToStorage() {
    try {
      localStorage.setItem('dawini_prescriptions', JSON.stringify(this.prescriptions))
    } catch (error) {
      console.error('Error saving prescriptions to storage:', error)
    }
  }

  // Ajouter une nouvelle ordonnance
  addPrescription(prescription) {
    const newPrescription = {
      ...prescription,
      _id: `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'sent_by_doctor',
      isNewFromDoctor: true
    }
    
    this.prescriptions.unshift(newPrescription)
    this.saveToStorage()
    this.notifyListeners()
    
    console.log('✅ Prescription added:', newPrescription)
    return newPrescription
  }

  // Mettre à jour le statut d'une ordonnance
  updatePrescriptionStatus(prescriptionId, newStatus) {
    const prescription = this.prescriptions.find(p => p._id === prescriptionId)
    if (prescription) {
      prescription.status = newStatus
      prescription.updatedAt = new Date().toISOString()
      
      if (newStatus === 'completed') {
        prescription.isNewFromDoctor = false
        prescription.completedAt = new Date().toISOString()
      }
      
      this.saveToStorage()
      this.notifyListeners()
      
      console.log('✅ Prescription status updated:', prescriptionId, '->', newStatus)
      return prescription
    }
    return null
  }

  // Obtenir les ordonnances pour un pharmacien
  getPrescriptionsForPharmacy(pharmacyId) {
    return this.prescriptions.filter(p => p.pharmacyId === pharmacyId)
  }

  // Obtenir les ordonnances pour un médecin
  getPrescriptionsForDoctor(doctorId) {
    return this.prescriptions.filter(p => p.doctorId === doctorId)
  }

  // Obtenir toutes les ordonnances
  getAllPrescriptions() {
    return [...this.prescriptions]
  }

  // Filtrer les ordonnances
  filterPrescriptions(filters = {}) {
    let filtered = [...this.prescriptions]

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status)
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.patientId?.userId?.fullName?.toLowerCase().includes(term) ||
        p.doctorId?.userId?.fullName?.toLowerCase().includes(term) ||
        p.diagnosis?.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  // Ajouter un listener pour les changements
  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Notifier tous les listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.prescriptions)
      } catch (error) {
        console.error('Error in prescription listener:', error)
      }
    })
  }

  // Obtenir les statistiques
  getStats() {
    const total = this.prescriptions.length
    const sentByDoctor = this.prescriptions.filter(p => p.status === 'sent_by_doctor').length
    const pending = this.prescriptions.filter(p => p.status === 'pending').length
    const completed = this.prescriptions.filter(p => p.status === 'completed').length
    const cancelled = this.prescriptions.filter(p => p.status === 'cancelled').length

    return {
      total,
      sentByDoctor,
      pending,
      completed,
      cancelled
    }
  }

  // Nettoyer les anciennes ordonnances (optionnel)
  cleanup() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    this.prescriptions = this.prescriptions.filter(p => 
      new Date(p.createdAt) > thirtyDaysAgo
    )
    
    this.saveToStorage()
    this.notifyListeners()
  }
}

// Instance globale
const prescriptionService = new PrescriptionService()

export default prescriptionService
