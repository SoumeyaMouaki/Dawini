import { useQuery } from '@tanstack/react-query'
import api from '../api/axios.js'
import Card from '../components/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Calendar, Clock, User, Stethoscope, Search, Plus, FileText, MapPin } from 'lucide-react'

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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      // Expected backend: GET /api/patients/:id/appointments
      const { data } = await api.get(`/api/patients/${user.id}/appointments`)
      return data
    },
    enabled: !!user
  })

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

  const upcoming = (data || []).filter(a => a.status === 'upcoming' || a.status === 'confirmed')
  const past = (data || []).filter(a => a.status === 'completed' || a.status === 'cancelled')

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
              <button className="btn btn-sm">
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

        {/* Appointments */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card title="Rendez-vous à venir">
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-500">Aucun rendez-vous à venir</p>
                <button className="btn btn-sm mt-4">
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
    </div>
  )
}
