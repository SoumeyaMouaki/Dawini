import { useState } from 'react'
import { Settings, User, Bell, Shield, Heart, Save, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../api/axios.js'

export default function PatientSettings({ user, onUserUpdate }) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      commune: user?.address?.commune || '',
      wilaya: user?.address?.wilaya || '',
      postalCode: user?.address?.postalCode || ''
    }
  })

  // Medical settings
  const [medicalData, setMedicalData] = useState({
    allergies: user?.allergies || [],
    chronicConditions: user?.chronicConditions || [],
    bloodType: user?.bloodType || '',
    emergencyContact: user?.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    prescriptionReminders: true,
    healthTips: false
  })

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user data
      if (onUserUpdate) {
        onUserUpdate({ ...user, ...profileData })
      }
      
      setSuccess('Profil mis à jour avec succès !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Erreur lors de la mise à jour du profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveMedical = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Informations médicales mises à jour avec succès !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating medical info:', error)
      setError('Erreur lors de la mise à jour des informations médicales')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Préférences de notification mises à jour !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating notifications:', error)
      setError('Erreur lors de la mise à jour des notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const addAllergy = () => {
    const allergy = prompt('Ajouter une allergie:')
    if (allergy && allergy.trim()) {
      setMedicalData({
        ...medicalData,
        allergies: [...medicalData.allergies, allergy.trim()]
      })
    }
  }

  const removeAllergy = (index) => {
    setMedicalData({
      ...medicalData,
      allergies: medicalData.allergies.filter((_, i) => i !== index)
    })
  }

  const addChronicCondition = () => {
    const condition = prompt('Ajouter une maladie chronique:')
    if (condition && condition.trim()) {
      setMedicalData({
        ...medicalData,
        chronicConditions: [...medicalData.chronicConditions, condition.trim()]
      })
    }
  }

  const removeChronicCondition = (index) => {
    setMedicalData({
      ...medicalData,
      chronicConditions: medicalData.chronicConditions.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Settings className="w-8 h-8 mr-3 text-primary-500" />
          Paramètres du compte
        </h3>
        <p className="text-gray-600">Gérez vos informations personnelles et préférences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'profile'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4 mr-2 inline" />
          Profil
        </button>
        <button
          onClick={() => setActiveTab('medical')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'medical'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Heart className="w-4 h-4 mr-2 inline" />
          Médical
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'notifications'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Bell className="w-4 h-4 mr-2 inline" />
          Notifications
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Code postal</label>
              <input
                type="text"
                value={profileData.address.postalCode}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  address: { ...profileData.address, postalCode: e.target.value }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rue</label>
              <input
                type="text"
                value={profileData.address.street}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  address: { ...profileData.address, street: e.target.value }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Commune</label>
              <input
                type="text"
                value={profileData.address.commune}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  address: { ...profileData.address, commune: e.target.value }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Wilaya</label>
              <input
                type="text"
                value={profileData.address.wilaya}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  address: { ...profileData.address, wilaya: e.target.value }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Sauvegarder le profil
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Medical Tab */}
      {activeTab === 'medical' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Groupe sanguin</label>
            <select
              value={medicalData.bloodType}
              onChange={(e) => setMedicalData({ ...medicalData, bloodType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
            >
              <option value="">Sélectionner</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {medicalData.allergies.map((allergy, index) => (
                  <span key={index} className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-xl border border-red-200 flex items-center">
                    {allergy}
                    <button
                      onClick={() => removeAllergy(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={addAllergy}
                className="btn-outline border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-4 py-2 rounded-xl"
              >
                + Ajouter une allergie
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Maladies chroniques</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {medicalData.chronicConditions.map((condition, index) => (
                  <span key={index} className="px-3 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-xl border border-orange-200 flex items-center">
                    {condition}
                    <button
                      onClick={() => removeChronicCondition(index)}
                      className="ml-2 text-orange-500 hover:text-orange-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={addChronicCondition}
                className="btn-outline border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold px-4 py-2 rounded-xl"
              >
                + Ajouter une maladie chronique
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSaveMedical}
              disabled={isLoading}
              className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Sauvegarder les informations médicales
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {key === 'emailNotifications' && 'Notifications par email'}
                    {key === 'smsNotifications' && 'Notifications par SMS'}
                    {key === 'appointmentReminders' && 'Rappels de rendez-vous'}
                    {key === 'prescriptionReminders' && 'Rappels de médicaments'}
                    {key === 'healthTips' && 'Conseils de santé'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {key === 'emailNotifications' && 'Recevez des notifications par email'}
                    {key === 'smsNotifications' && 'Recevez des notifications par SMS'}
                    {key === 'appointmentReminders' && 'Rappels automatiques avant vos rendez-vous'}
                    {key === 'prescriptionReminders' && 'Rappels pour prendre vos médicaments'}
                    {key === 'healthTips' && 'Conseils et astuces santé personnalisés'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      [key]: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleSaveNotifications}
              disabled={isLoading}
              className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Sauvegarder les préférences
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
