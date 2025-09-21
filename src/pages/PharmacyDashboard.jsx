import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Pill, FileText, CheckCircle, AlertCircle, Clock, Search } from "lucide-react";
import api from "../api/axios.js";

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    confirmedPrescriptions: 0,
    expiredPrescriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm, statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/pharmacies/${user.id}/prescriptions`);
      setPrescriptions(response.data.prescriptions || []);
      
      // Calculate stats
      const total = response.data.prescriptions?.length || 0;
      const pending = response.data.prescriptions?.filter(p => p.status === 'active').length || 0;
      const confirmed = response.data.prescriptions?.filter(p => p.status === 'filled').length || 0;
      const expired = response.data.prescriptions?.filter(p => p.isExpired).length || 0;
      
      setStats({
        totalPrescriptions: total,
        pendingPrescriptions: pending,
        confirmedPrescriptions: confirmed,
        expiredPrescriptions: expired
      });
      
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = prescriptions;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.doctorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prescriptionCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const confirmPrescription = async (prescriptionId) => {
    try {
      await api.put(`/api/prescriptions/${prescriptionId}/confirm`, {
        verificationCode: Math.random().toString(36).substr(2, 6).toUpperCase()
      });
      fetchPrescriptions(); // Refresh data
    } catch (error) {
      console.error('Error confirming prescription:', error);
    }
  };

  const reportIssue = async (prescriptionId, issue) => {
    try {
      await api.post(`/api/prescriptions/${prescriptionId}/report`, {
        issue: issue,
        details: "Problème signalé par le pharmacien"
      });
      fetchPrescriptions(); // Refresh data
    } catch (error) {
      console.error('Error reporting issue:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'filled': return 'badge-primary';
      case 'expired': return 'badge-error';
      case 'cancelled': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'filled': return 'Confirmée';
      case 'expired': return 'Expirée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
                Tableau de bord - {user?.pharmacyName || 'Pharmacie'}
              </h1>
              <p className="text-secondary-600">
                Gérez vos prescriptions et validations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-secondary-500">Licence</p>
                <p className="font-medium text-secondary-900">
                  {user?.licenseNumber || 'Non spécifiée'}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-warning-600" />
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
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Total Prescriptions</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalPrescriptions}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">En Attente</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.pendingPrescriptions}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Confirmées</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.confirmedPrescriptions}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-error-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-error-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Expirées</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.expiredPrescriptions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par patient, médecin ou code prescription..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="filled">Confirmée</option>
                <option value="expired">Expirée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6">
            Prescriptions ({filteredPrescriptions.length})
          </h2>
          
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Aucune prescription ne correspond aux critères de recherche"
                  : "Aucune prescription reçue"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="border border-secondary-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200"
                >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-900">
                              Code: {prescription.prescriptionCode}
                            </h3>
                            <p className="text-sm text-secondary-500">
                              Émise le {formatDate(prescription.issueDate)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-secondary-700">Patient</p>
                            <p className="text-secondary-900">
                              {prescription.patientId?.fullName || 'Patient inconnu'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-700">Médecin</p>
                            <p className="text-secondary-900">
                              Dr. {prescription.doctorId?.fullName || 'Médecin inconnu'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-700">Expire le</p>
                            <p className="text-secondary-900">
                              {formatDate(prescription.expiryDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-700">Statut</p>
                            <span className={`badge ${getStatusColor(prescription.status)}`}>
                              {getStatusLabel(prescription.status)}
                            </span>
                          </div>
                        </div>

                        {/* Medications */}
                        {prescription.medications && prescription.medications.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-secondary-700 mb-2">Médicaments</p>
                            <div className="bg-secondary-50 rounded-lg p-3">
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="text-sm text-secondary-900 mb-1">
                                  <span className="font-medium">{med.name}</span> - {med.dosage} - {med.frequency}
                                  {med.instructions && (
                                    <span className="text-secondary-600"> - {med.instructions}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        {prescription.instructions && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-secondary-700 mb-2">Instructions</p>
                            <p className="text-secondary-900 text-sm">{prescription.instructions}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-6 flex flex-col space-y-2">
                        {prescription.status === 'active' && !prescription.isExpired && (
                          <>
                            <button
                              onClick={() => confirmPrescription(prescription._id)}
                              className="btn btn-sm bg-success-600 hover:bg-success-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmer
                            </button>
                            <button
                              onClick={() => reportIssue(prescription._id, 'incompatibility')}
                              className="btn btn-sm bg-warning-600 hover:bg-warning-700"
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Incompatibilité
                            </button>
                            <button
                              onClick={() => reportIssue(prescription._id, 'shortage')}
                              className="btn btn-sm bg-error-600 hover:bg-error-700"
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Rupture
                            </button>
                          </>
                        )}
                        
                        {prescription.status === 'filled' && (
                          <div className="text-center">
                            <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
                            <p className="text-sm text-success-600 font-medium">Confirmée</p>
                            <p className="text-xs text-secondary-500">
                              {prescription.pharmacy?.filledAt && 
                                formatDate(prescription.pharmacy.filledAt)
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
