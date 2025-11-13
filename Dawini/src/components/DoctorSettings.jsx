import { useState } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Save,
  Camera,
  MapPin,
  Phone,
  Mail,
  Building,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Stethoscope,
  GraduationCap,
  Award
} from 'lucide-react'

export default function DoctorSettings({ user, onSave }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Dr. Ahmed Benali',
    email: user?.email || 'dr.ahmed@dawini.com',
    phone: user?.phone || '+213 555 123 456',
    specialization: user?.specialization || 'Cardiologie',
    licenseNumber: 'MD-2024-001',
    experience: '15 ans',
    education: 'Doctorat en Médecine - Université d\'Alger',
    certifications: [
      'Certification en Cardiologie Interventionnelle',
      'Diplôme de Médecine d\'Urgence',
      'Formation en Échocardiographie'
    ],
    address: {
      street: user?.address?.street || '456 Avenue de la Santé',
      commune: user?.address?.commune || 'Alger Centre',
      wilaya: user?.address?.wilaya || 'Alger',
      postalCode: user?.address?.postalCode || '16000'
    },
    consultationFees: {
      general: 2000,
      specialist: 3000,
      emergency: 5000
    },
    availability: {
      monday: '08:00-17:00',
      tuesday: '08:00-17:00',
      wednesday: '08:00-17:00',
      thursday: '08:00-17:00',
      friday: '08:00-17:00',
      saturday: '08:00-12:00',
      sunday: 'Fermé'
    },
    notifications: {
      newAppointments: true,
      appointmentReminders: true,
      patientMessages: true,
      systemUpdates: false,
      emergencyAlerts: true
    }
  })

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleNotificationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(formData)
      }
      console.log('Settings saved:', formData)
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'professional', label: 'Professionnel', icon: Stethoscope },
    { id: 'schedule', label: 'Planning', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-primary-600" />
            Paramètres du Médecin
          </h2>
          <p className="text-gray-600 mt-2">Gérez vos informations professionnelles et préférences</p>
        </div>
        
        <button
          onClick={handleSave}
          className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
        >
          <Save className="w-5 h-5 mr-2" />
          Sauvegarder
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de licence
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Adresse du cabinet
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rue
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commune
                    </label>
                    <input
                      type="text"
                      value={formData.address.commune}
                      onChange={(e) => handleInputChange('address.commune', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wilaya
                    </label>
                    <input
                      type="text"
                      value={formData.address.wilaya}
                      onChange={(e) => handleInputChange('address.wilaya', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spécialisation
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Années d'expérience
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formation
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Consultation Fees */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                  Tarifs de consultation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation générale (DA)
                    </label>
                    <input
                      type="number"
                      value={formData.consultationFees.general}
                      onChange={(e) => handleInputChange('consultationFees.general', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation spécialisée (DA)
                    </label>
                    <input
                      type="number"
                      value={formData.consultationFees.specialist}
                      onChange={(e) => handleInputChange('consultationFees.specialist', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgence (DA)
                    </label>
                    <input
                      type="number"
                      value={formData.consultationFees.emergency}
                      onChange={(e) => handleInputChange('consultationFees.emergency', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Certifications et formations
                </h3>
                <div className="space-y-2">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                Horaires de consultation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.availability).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900 capitalize">{day}</span>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => handleInputChange(`availability.${day}`, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary-600" />
                Préférences de notification
              </h3>
              
              <div className="space-y-4">
                {Object.entries(formData.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {key === 'newAppointments' && 'Nouveaux rendez-vous'}
                        {key === 'appointmentReminders' && 'Rappels de rendez-vous'}
                        {key === 'patientMessages' && 'Messages des patients'}
                        {key === 'systemUpdates' && 'Mises à jour système'}
                        {key === 'emergencyAlerts' && 'Alertes d\'urgence'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {key === 'newAppointments' && 'Recevoir une notification pour chaque nouveau rendez-vous'}
                        {key === 'appointmentReminders' && 'Recevoir des rappels avant les rendez-vous'}
                        {key === 'patientMessages' && 'Être notifié des nouveaux messages des patients'}
                        {key === 'systemUpdates' && 'Être informé des mises à jour de la plateforme'}
                        {key === 'emergencyAlerts' && 'Recevoir des alertes pour les urgences'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNotificationChange(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary-600" />
                Sécurité du compte
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-gray-900"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Conseils de sécurité</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Utilisez un mot de passe fort avec au moins 8 caractères</li>
                  <li>• Incluez des lettres majuscules, minuscules, chiffres et symboles</li>
                  <li>• Ne partagez jamais votre mot de passe avec d'autres personnes</li>
                  <li>• Changez régulièrement votre mot de passe</li>
                  <li>• Activez l'authentification à deux facteurs si disponible</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
