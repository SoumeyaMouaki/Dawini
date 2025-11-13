import { useState, useEffect } from 'react'
import { Search, User, Stethoscope, Pill, X } from 'lucide-react'
import api from '../api/axios.js'

export default function NewConversation({ isOpen, onClose, onConversationCreated, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  // Search for users to start conversation with
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      setError('')

      // Search based on user type
      let searchEndpoint = ''
      if (currentUser.userType === 'patient') {
        // Patients can message doctors and pharmacists
        searchEndpoint = '/api/users/search?type=doctor,pharmacist'
      } else if (currentUser.userType === 'doctor') {
        // Doctors can message patients and pharmacists
        searchEndpoint = '/api/users/search?type=patient,pharmacist'
      } else if (currentUser.userType === 'pharmacist') {
        // Pharmacists can message patients and doctors
        searchEndpoint = '/api/users/search?type=patient,doctor'
      }

      const response = await api.get(`${searchEndpoint}&q=${encodeURIComponent(query)}`)
      setSearchResults(response.data.users || [])

    } catch (error) {
      console.error('Error searching users:', error)
      setError('Erreur lors de la recherche d\'utilisateurs')
    } finally {
      setIsSearching(false)
    }
  }

  // Create new conversation
  const createConversation = async (selectedUser) => {
    try {
      setIsCreating(true)
      setError('')

      // Check if trying to create conversation with self
      if (selectedUser._id === currentUser._id) {
        setError('Vous ne pouvez pas créer une conversation avec vous-même')
        return
      }

      console.log('Creating conversation with:', {
        currentUser: currentUser._id,
        selectedUser: selectedUser._id,
        participantType: selectedUser.userType
      })

      const response = await api.post('/api/messages/conversations', {
        participantId: selectedUser._id,
        participantType: selectedUser.userType
      })

      onConversationCreated(response.data.conversation)
      onClose()

    } catch (error) {
      console.error('Error creating conversation:', error)
      console.error('Error details:', error.response?.data)
      setError('Erreur lors de la création de la conversation')
    } finally {
      setIsCreating(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const getUserIcon = (userType) => {
    switch (userType) {
      case 'doctor':
        return <Stethoscope className="w-5 h-5 text-blue-600" />
      case 'pharmacist':
        return <Pill className="w-5 h-5 text-green-600" />
      case 'patient':
        return <User className="w-5 h-5 text-purple-600" />
      default:
        return <User className="w-5 h-5 text-gray-600" />
    }
  }

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'doctor':
        return 'Médecin'
      case 'pharmacist':
        return 'Pharmacien'
      case 'patient':
        return 'Patient'
      default:
        return 'Utilisateur'
    }
  }

  if (!isOpen) return null

  console.log('NewConversation modal is rendering...', { isOpen, currentUser })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Nouvelle conversation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto">
            {searchQuery.length < 2 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Tapez au moins 2 caractères pour rechercher</p>
              </div>
            ) : searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(user => (
                  <button
                    key={user._id}
                    onClick={() => createConversation(user)}
                    disabled={isCreating}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getUserIcon(user.userType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getUserTypeLabel(user.userType)}
                        </p>
                        {user.specialization && (
                          <p className="text-xs text-gray-600 truncate">
                            {user.specialization}
                          </p>
                        )}
                      </div>
                      {isCreating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
