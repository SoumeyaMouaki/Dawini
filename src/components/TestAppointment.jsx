import { useState } from 'react'
import { Calendar, Clock, User, Stethoscope } from 'lucide-react'
import api from '../api/axios.js'

export default function TestAppointment({ doctor, patientId }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'consultation',
    reason: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      console.log('Sending appointment data:', {
        patientId,
        doctorId: doctor._id,
        ...formData
      })

      const appointmentData = {
        patientId,
        doctorId: doctor._id,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        reason: formData.reason,
        notes: { patient: formData.notes }
      }

      const { data } = await api.post('/api/appointments', appointmentData)
      
      console.log('Appointment response:', data)
      setSuccess('Rendez-vous réservé avec succès !')
      
    } catch (err) {
      console.error('Booking error:', err)
      setError(err.response?.data?.error || 'Erreur lors de la réservation du rendez-vous')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!doctor) return null

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test de Réservation</h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Médecin sélectionné :</h4>
        <p className="text-sm text-gray-600">{doctor.userId?.fullName}</p>
        <p className="text-sm text-gray-600">{doctor.specialization}</p>
        <p className="text-sm text-gray-600">ID: {doctor._id}</p>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Patient ID :</h4>
        <p className="text-sm text-gray-600">{patientId}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date du rendez-vous
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heure du rendez-vous
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motif de la consultation
          </label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Motif de la consultation"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!formData.date || !formData.time || isSubmitting}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Réservation...' : 'Tester la Réservation'}
        </button>
      </form>
    </div>
  )
}
