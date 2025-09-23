import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Stethoscope, X, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../api/axios.js'

export default function AppointmentBooking({ isOpen, onClose, doctor, patientId }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'consultation',
    reason: '',
    notes: ''
  })
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actualPatientId, setActualPatientId] = useState(null)

  useEffect(() => {
    if (isOpen && doctor) {
      // Reset form when modal opens
      setFormData({
        date: '',
        time: '',
        type: 'consultation',
        reason: '',
        notes: ''
      })
      setError('')
      setSuccess('')
      
      // Fetch the actual patient profile ID
      fetchPatientProfileId()
    }
  }, [isOpen, doctor])

  const fetchPatientProfileId = async () => {
    try {
      // If patientId is a User ID, we need to find the Patient Profile ID
      // The backend will handle the conversion, so we pass the User ID directly
      setActualPatientId(patientId)
    } catch (err) {
      console.error('Error setting patient ID:', err)
      setError('Erreur lors du chargement du profil patient')
    }
  }

  const handleDateChange = async (date) => {
    setFormData({ ...formData, date, time: '' })
    setAvailableSlots([])
    
    if (date) {
      try {
        setIsLoading(true)
        const { data } = await api.get(`/api/doctors/${doctor._id}/availability?date=${date}`)
        
        // Generate time slots based on working hours
        const slots = generateTimeSlots(data.workingHours, data.bookedSlots || [])
        setAvailableSlots(slots)
      } catch (err) {
        console.error('Error fetching availability:', err)
        setError('Erreur lors du chargement des créneaux disponibles')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const generateTimeSlots = (workingHours, bookedSlots) => {
    const slots = []
    const selectedDate = new Date(formData.date)
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const daySchedule = workingHours[dayOfWeek]

    if (!daySchedule || !daySchedule.isWorking) {
      return []
    }

    const startTime = daySchedule.start
    const endTime = daySchedule.end
    const duration = doctor.consultationDuration || 30

    // Parse start and end times
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      
      // Check if this slot is not booked
      if (!bookedSlots.includes(timeString)) {
        slots.push({
          time: timeString,
          available: true
        })
      }

      // Move to next slot
      currentMin += duration
      if (currentMin >= 60) {
        currentMin = 0
        currentHour += 1
      }
    }

    return slots
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (!actualPatientId) {
        setError('Profil patient non trouvé. Veuillez réessayer.')
        return
      }

      const appointmentData = {
        patientId: actualPatientId,
        doctorId: doctor._id,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        reason: formData.reason,
        notes: { patient: formData.notes }
      }

      const { data } = await api.post('/api/appointments', appointmentData)
      
      setSuccess('Rendez-vous réservé avec succès !')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        // Refresh parent component if needed
        if (window.location.pathname.includes('/patient/dashboard')) {
          window.location.reload()
        }
      }, 2000)

    } catch (err) {
      console.error('Booking error:', err)
      setError(err.response?.data?.error || 'Erreur lors de la réservation du rendez-vous')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !doctor) return null

  // Show loading state while fetching patient profile
  if (!actualPatientId && !error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil patient...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Prendre un rendez-vous</h2>
              <p className="text-gray-600 mt-1">avec {doctor.userId?.fullName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <Stethoscope className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{doctor.userId?.fullName}</h3>
                <p className="text-primary-600">{doctor.specialization}</p>
                <p className="text-sm text-gray-600">
                  {doctor.userId?.address?.wilaya}, {doctor.userId?.address?.commune}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date du rendez-vous
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time Selection */}
          {formData.date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heure du rendez-vous
              </label>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Chargement des créneaux...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot.time })}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        formData.time === slot.time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun créneau disponible pour cette date</p>
              )}
            </div>
          )}

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de consultation
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Suivi</option>
              <option value="emergency">Urgence</option>
              {doctor.services?.homeVisit && <option value="home-visit">Visite à domicile</option>}
              {doctor.services?.videoConsultation && <option value="video">Consultation vidéo</option>}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de la consultation
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Décrivez brièvement le motif de votre consultation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes supplémentaires (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ajoutez des informations supplémentaires..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!formData.date || !formData.time || isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Réservation...
                </>
              ) : (
                'Confirmer le RDV'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
