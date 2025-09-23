import { useState } from 'react'
import { Search, User, Mail, FileText, Calendar, MapPin, Phone, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function PatientSearch({ doctorId }) {
  const [search, setSearch] = useState({ name: '', email: '', nss: '' })
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const runSearch = async (e) => {
    e && e.preventDefault()
    try {
      setIsSearching(true)
      setSearchError('')
      
      const params = new URLSearchParams()
      if (search.name) params.append('name', search.name)
      if (search.email) params.append('email', search.email)
      if (search.nss) params.append('nss', search.nss)
      
      const { data } = await api.get(`/api/doctors/${doctorId}/patients/search?${params.toString()}`)
      
      if (data.success) {
        // Results will be handled by the query
        refetch()
      } else {
        setSearchError(data.message || 'Erreur lors de la recherche')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Erreur de connexion. Vérifiez votre connexion internet.')
    } finally {
      setIsSearching(false)
    }
  }

  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['patients-search', doctorId, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search.name) params.append('name', search.name)
      if (search.email) params.append('email', search.email)
      if (search.nss) params.append('nss', search.nss)
      
      const { data } = await api.get(`/api/doctors/${doctorId}/patients/search?${params.toString()}`)
      return data
    },
    enabled: false, // Only run when manually triggered
    retry: 1
  })

  const patients = searchResults?.patients || []
  const total = searchResults?.total || 0

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-primary-600" />
          Rechercher un patient
        </h3>
        
        <form onSubmit={runSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Nom du patient"
              value={search.name}
              onChange={e => setSearch({ ...search, name: e.target.value })}
            />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Email"
              value={search.email}
              onChange={e => setSearch({ ...search, email: e.target.value })}
            />
          </div>
          
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="N° Sécurité Sociale"
              value={search.nss}
              onChange={e => setSearch({ ...search, nss: e.target.value })}
            />
          </div>
          
          <div className="md:col-span-3 flex justify-end">
            <button 
              type="submit" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recherche...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2"/>
                  Rechercher
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Error Message */}
        {searchError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{searchError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Résultats de recherche
            </h3>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {total} patient{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Recherche en cours...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun patient trouvé</p>
              <p className="text-gray-400">Essayez avec d'autres critères de recherche</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {patients.map(patient => (
                <div key={patient._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        {patient.userId?.fullName}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {patient.age} ans • {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-1" />
                        NSS: {patient.nss}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Mail className="w-4 h-4 mr-1" />
                        {patient.userId?.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {patient.userId?.phone}
                      </div>
                    </div>
                  </div>
                  
                  {/* Medical Information */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Allergies */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                        Allergies
                      </h5>
                      {patient.allergies && patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((allergy, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Aucune allergie connue</p>
                      )}
                    </div>
                    
                    {/* Chronic Conditions */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-1 text-orange-500" />
                        Maladies chroniques
                      </h5>
                      {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.chronicConditions.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Aucune maladie chronique</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Groupe sanguin:</span>
                      <span className="ml-2 text-gray-600">{patient.bloodType || 'Non renseigné'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Langue préférée:</span>
                      <span className="ml-2 text-gray-600">
                        {patient.preferredLanguage === 'fr' ? 'Français' : 
                         patient.preferredLanguage === 'en' ? 'Anglais' : 
                         patient.preferredLanguage === 'ar' ? 'Arabe' : 'Non renseigné'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Assurance:</span>
                      <span className="ml-2 text-gray-600">{patient.insuranceProvider || 'Non renseigné'}</span>
                    </div>
                  </div>
                  
                  {/* Emergency Contact */}
                  {patient.emergencyContact && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Contact d'urgence</h5>
                      <div className="text-sm text-gray-600">
                        <p><strong>Nom:</strong> {patient.emergencyContact.name}</p>
                        <p><strong>Téléphone:</strong> {patient.emergencyContact.phone}</p>
                        <p><strong>Relation:</strong> {patient.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
