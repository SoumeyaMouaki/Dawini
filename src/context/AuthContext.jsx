import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      const parsed = JSON.parse(userStr)
      // Normalize to always have `id` alongside Mongo `_id`
      const normalized = { ...parsed, id: parsed.id || parsed._id }
      setUser(normalized)
      // Persist normalized structure to keep consistency
      localStorage.setItem('user', JSON.stringify(normalized))
    }
  }, [])

  const login = async (email, password) => {
    // Expected backend: POST /api/auth/login -> { token, user }
    const { data } = await api.post('/api/auth/login', { email, password })
    const normalizedUser = { ...data.user, id: data.user._id }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(normalizedUser))
    setUser(normalizedUser)
    return normalizedUser
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
