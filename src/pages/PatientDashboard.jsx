import { useQuery } from '@tanstack/react-query'
import api from '../api/axios.js'
import Card from '../components/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Calendar, Clock, User, Stethoscope, Search, Plus, FileText, MapPin } from 'lucide-react'
import L from 'leaflet'
import { useState } from 'react'

function AppointmentItem({ appointment }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-primary';
      case 'cancelled': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="border border-secondary-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-secondary-900">{appointment.doctorName}</h4>
            <p className="text-sm text-secondary-600">{appointment.specialty}</p>
            <div className="flex items-center text-sm text-secondary-500 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(appointment.date).toLocaleDateString('fr-FR')}
              <Clock className="w-4 h-4 ml-3 mr-1" />
              {appointment.time}
            </div>
          </div>
        </div>
        <span className={`badge ${getStatusColor(appointment.status)}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isMedicalOpen, setIsMedicalOpen] = useState(false)
  const [booking, setBooking] = useState({ doctorId: '', date: '', time: '', reason: '' })
  const [medical, setMedical] = useState({ allergies: [], chronicConditions: [] })
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState({ specialization: '', wilaya: '', commune: '', date: '', time: '' })
  const [mapInstance, setMapInstance] = useState(null)
  const [markers, setMarkers] = useState([])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments', user?.id || user?._id],
    queryFn: async () => {
      // Expected backend: GET /api/patients/:id/appointments
      const userId = user?.id || user?._id
      const { data } = await api.get(`/api/patients/${userId}/appointments`)
      return data
    },
    enabled: Boolean(user && (user.id || user._id))
  })
  
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-basic'],
    queryFn: async () => {
      const { data } = await api.get('/api/doctors?available=true&limit=50')
      return data.doctors || []
    }
  })
  
  if (doctors !== doctorsData) {
    if (Array.isArray(doctorsData)) setDoctors(doctorsData)
  }

  const runSearch = async (e) => {
    e && e.preventDefault()
    const userId = user.id || user._id
    const params = new URLSearchParams()
    if (search.specialization) params.append('specialization', search.specialization)
    if (search.wilaya) params.append('wilaya', search.wilaya)
    if (search.commune) params.append('commune', search.commune)
    if (search.date) params.append('date', search.date)
    if (search.time) params.append('time', search.time)
    const { data } = await api.get(`/api/patients/${userId}/doctors/search?${params.toString()}`)
    const found = data.doctors || []
    setDoctors(found)
    // plot on map
    if (mapInstance) {
      markers.forEach(m => m.remove())
      const newMarkers = []
      found.forEach(d => {
        const lat = d.address?.coordinates?.latitude || d.userId?.address?.lat
        const lng = d.address?.coordinates?.longitude || d.userId?.address?.lng
        if (typeof lat === 'number' && typeof lng === 'number') {
          const marker = L.marker([lat, lng]).addTo(mapInstance).bindPopup(`<b>${d.userId?.fullName || ''}</b><br/>${d.specialization || ''}`)
          newMarkers.push(marker)
        }
      })
      setMarkers(newMarkers)
    }
  }
console.log(data);

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Connexion requise</h2>
          <p className="text-secondary-600">Veuillez vous connecter pour accéder à votre tableau de bord.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement de vos rendez-vous...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-error-600" />
          </div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Erreur de chargement</h2>
          <p className="text-secondary-600">Impossible de charger vos rendez-vous. Veuillez réessayer.</p>
        </div>
      </div>
    )
  }

  const upcoming = (data.appointments || []).filter(a => a.status === 'upcoming' || a.status === 'confirmed')
  const past = (data.appointments || []).filter(a => a.status === 'completed' || a.status === 'cancelled')

  // Initialize Leaflet map once
  if (!mapInstance) {
    setTimeout(() => {
      try {
        const map = L.map('map').setView([36.75, 3.06], 10)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map)
        setMapInstance(map)
      } catch {}
    }, 0)
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Bonjour, {user.fullName}
              </h1>
              <p className="text-secondary-600">
                Gérez vos rendez-vous et votre santé
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn btn-outline btn-sm">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </button>
              <button onClick={() => setIsBookingOpen(true)} className="btn btn-sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau RDV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-1">{upcoming.length}</h3>
            <p className="text-secondary-600">Rendez-vous à venir</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-1">{past.length}</h3>
            <p className="text-secondary-600">Rendez-vous passés</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-1">0</h3>
            <p className="text-secondary-600">Prescriptions actives</p>
          </div>
        </div>

        {/* Search + Map */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card title="Rechercher un médecin">
            <form onSubmit={runSearch} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input" placeholder="Spécialité" value={search.specialization} onChange={e => setSearch({ ...search, specialization: e.target.value })} />
              <input className="input" placeholder="Wilaya" value={search.wilaya} onChange={e => setSearch({ ...search, wilaya: e.target.value })} />
              <input className="input" placeholder="Commune" value={search.commune} onChange={e => setSearch({ ...search, commune: e.target.value })} />
              <input type="date" className="input" value={search.date} onChange={e => setSearch({ ...search, date: e.target.value })} />
              <input type="time" className="input" value={search.time} onChange={e => setSearch({ ...search, time: e.target.value })} />
              <div className="md:col-span-2 flex justify-end"><button type="submit" className="btn btn-sm"><Search className="w-4 h-4 mr-2"/>Chercher</button></div>
            </form>
          </Card>
          <div className="lg:col-span-2">
            <div id="map" className="w-full h-80 rounded-2xl border border-secondary-200"></div>
          </div>
        </div>

        {/* Appointments */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card title="Rendez-vous à venir">
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-500">Aucun rendez-vous à venir</p>
                <button onClick={() => setIsBookingOpen(true)} className="btn btn-sm mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Prendre un RDV
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map(appointment => (
                  <AppointmentItem key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </Card>

          <Card title="Rendez-vous passés">
            {past.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-500">Aucun rendez-vous passé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {past.map(appointment => (
                  <AppointmentItem key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Medical details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mt-8">
          <Card title="Dossier médical">
            <div className="flex items-center justify-between">
              <p className="text-secondary-600">Gérez vos allergies et maladies chroniques</p>
              <button onClick={() => setIsMedicalOpen(true)} className="btn btn-sm">Mettre à jour</button>
            </div>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Prendre un rendez-vous</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Médecin</label>
                <select className="input" value={booking.doctorId} onChange={e => setBooking({ ...booking, doctorId: e.target.value })}>
                  <option value="">Sélectionner un médecin</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>{d.userId?.fullName} • {d.specialization}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} />
                </div>
                <div>
                  <label className="label">Heure</label>
                  <input type="time" className="input" value={booking.time} onChange={e => setBooking({ ...booking, time: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Motif</label>
                <input type="text" className="input" placeholder="Ex: Consultation" value={booking.reason} onChange={e => setBooking({ ...booking, reason: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsBookingOpen(false)} className="btn-outline btn-sm">Annuler</button>
                <button onClick={async () => {
                  const payload = { patientId: user.id || user._id, doctorId: booking.doctorId, date: booking.date, time: booking.time, reason: booking.reason }
                  await api.post('/api/appointments', payload)
                  setIsBookingOpen(false)
                  window.location.reload()
                }} className="btn btn-sm">Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Modal */}
      {isMedicalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Détails médicaux</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Allergies (séparées par des virgules)</label>
                <input className="input" value={medical.allergies.join(', ')} onChange={e => setMedical({ ...medical, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <label className="label">Maladies chroniques (séparées par des virgules)</label>
                <input className="input" value={medical.chronicConditions.join(', ')} onChange={e => setMedical({ ...medical, chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsMedicalOpen(false)} className="btn-outline btn-sm">Annuler</button>
                <button onClick={async () => {
                  const userId = user.id || user._id
                  await api.put(`/api/patients/${userId}/profile`, medical)
                  setIsMedicalOpen(false)
                }} className="btn btn-sm">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
