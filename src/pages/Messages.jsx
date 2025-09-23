import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ChatSystem from '../components/ChatSystem.jsx'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Messages() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Connexion requise</h2>
          <p className="text-secondary-600">Veuillez vous connecter pour accéder aux messages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link 
              to={user.userType === 'patient' ? '/patient/dashboard' : 
                  user.userType === 'doctor' ? '/doctor/dashboard' : 
                  '/pharmacy/dashboard'}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
            <h1 className="text-2xl font-bold text-secondary-900">
              Messages
            </h1>
          </div>
        </div>
      </div>

      {/* Chat System */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChatSystem 
          currentUser={user}
          selectedConversation={selectedConversation}
          onConversationSelect={setSelectedConversation}
        />
      </div>
    </div>
  )
}