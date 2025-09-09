import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Calendar, Clock, User, Stethoscope, FileText, MessageSquare } from "lucide-react";
import api from "../api/axios.js";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPrescriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments for the selected date
      const appointmentsResponse = await api.get(`/api/appointments?date=${selectedDate}`);
      setAppointments(appointmentsResponse.data.appointments || []);
      
      // Fetch prescriptions
      const prescriptionsResponse = await api.get(`/api/doctors/${user.id}/prescriptions`);
      setPrescriptions(prescriptionsResponse.data.prescriptions || []);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointmentsResponse.data.appointments?.filter(apt => 
        apt.date === today
      ) || [];
      
      setStats({
        totalAppointments: appointmentsResponse.data.appointments?.length || 0,
        todayAppointments: todayAppts.length,
        pendingAppointments: appointmentsResponse.data.appointments?.filter(apt => 
          apt.status === 'pending'
        ).length || 0,
        totalPrescriptions: prescriptionsResponse.data.prescriptions?.length || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/api/appointments/${appointmentId}`, { status: newStatus });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const formatTime = (time) => {
    return time.substring(0, 5); // Format HH:MM
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Tableau de bord - Dr. {user?.fullName}
              </h1>
              <p className="text-secondary-600">
                Gérez vos rendez-vous et prescriptions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-secondary-500">Spécialisation</p>
                <p className="font-medium text-secondary-900">
                  {user?.specialization || 'Non spécifiée'}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Total RDV</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <Clock className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">RDV Aujourd'hui</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <User className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">En Attente</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.pendingAppointments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Prescriptions</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalPrescriptions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR')}
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-500">Aucun rendez-vous pour cette date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-secondary-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-secondary-900">
                              {appointment.patientId?.fullName || 'Patient inconnu'}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {formatTime(appointment.time)} • {appointment.type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`badge ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                          
                          {appointment.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                                className="btn btn-sm bg-success-600 hover:bg-success-700"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                                className="btn btn-sm bg-error-600 hover:bg-error-700"
                              >
                                Annuler
                              </button>
                            </div>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                              className="btn btn-sm"
                            >
                              Terminer
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {appointment.reason && (
                        <div className="mt-3 pt-3 border-t border-secondary-100">
                          <p className="text-sm text-secondary-600">
                            <span className="font-medium">Motif :</span> {appointment.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Recent Prescriptions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-3">
                <button className="w-full btn bg-success-600 hover:bg-success-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Nouvelle prescription
                </button>
                <button className="w-full btn">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages patients
                </button>
                <button className="w-full btn bg-primary-600 hover:bg-primary-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Planifier RDV
                </button>
              </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Prescriptions récentes
              </h3>
              {prescriptions.length === 0 ? (
                <p className="text-secondary-500 text-sm">Aucune prescription récente</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.slice(0, 5).map((prescription) => (
                    <div key={prescription._id} className="border border-secondary-200 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-secondary-900 text-sm">
                            {prescription.patientId?.fullName || 'Patient inconnu'}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {new Date(prescription.issueDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`badge ${
                          prescription.status === 'active' ? 'badge-success' : 'badge-secondary'
                        }`}>
                          {prescription.status === 'active' ? 'Active' : 'Expirée'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
