import { useAuth } from '../context/AuthContext.jsx'

export default function TestPage() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page de Test</h1>
        <div className="space-y-4">
          <p><strong>Utilisateur connecté:</strong> {user ? 'Oui' : 'Non'}</p>
          {user && (
            <div>
              <p><strong>Type:</strong> {user.userType}</p>
              <p><strong>Nom:</strong> {user.fullName}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          )}
          <div className="space-y-2">
            <a href="/contact" className="block bg-blue-500 text-white px-4 py-2 rounded text-center">
              Aller à Contact
            </a>
            <a href="/patient/dashboard" className="block bg-green-500 text-white px-4 py-2 rounded text-center">
              Aller au Dashboard Patient
            </a>
            <a href="/login" className="block bg-purple-500 text-white px-4 py-2 rounded text-center">
              Aller à Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
