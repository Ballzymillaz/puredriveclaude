import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(setUser)
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const u = await authApi.login(email, password)
    setUser(u)
    return u
  }

  const logout = () => {
    setUser(null)
    authApi.logout()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Aliases qui correspondent aux noms Base44 pour faciliter la migration
export const useCurrentUser = () => {
  const { user } = useAuth()
  return user
}
