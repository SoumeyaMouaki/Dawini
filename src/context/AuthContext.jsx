import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    console.log('AuthContext: Checking stored auth data', { token: !!token, userStr: !!userStr })
    
    if (token && userStr) {
      try {
        const parsed = JSON.parse(userStr)
        console.log('AuthContext: Parsed user data', parsed)
        // Normalize to always have `id` alongside Mongo `_id`
        const normalized = { ...parsed, id: parsed.id || parsed._id }
        console.log('AuthContext: Normalized user data', normalized)
        setUser(normalized)
        // Persist normalized structure to keep consistency
        localStorage.setItem('user', JSON.stringify(normalized))
      } catch (error) {
        console.error('AuthContext: Error parsing user data', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login for', email)
      // Expected backend: POST /api/auth/login -> { token, user }
      const { data } = await api.post('/api/auth/login', { email, password })
      console.log('AuthContext: Login response', data)
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server')
      }
      
      const normalizedUser = { ...data.user, id: data.user._id || data.user.id }
      console.log('AuthContext: Normalized user after login', normalizedUser)
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      setUser(normalizedUser)
      return normalizedUser
    } catch (error) {
      console.error('AuthContext: Login error', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
