import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  
  console.log('ProtectedRoute: Current user state', user)
  
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  console.log('ProtectedRoute: User authenticated, rendering children')
  return children
}
