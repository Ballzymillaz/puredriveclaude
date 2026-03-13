import { useState, useEffect, createContext, useContext } from 'react'
import { auth } from './api/client.js'
import Layout from './components/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Drivers from './pages/Drivers.jsx'
import Vehicles from './pages/Vehicles.jsx'
import Payments from './pages/Payments.jsx'
import Loans from './pages/Loans.jsx'
import UPI from './pages/UPI.jsx'
import Purchases from './pages/Purchases.jsx'
import Maintenance from './pages/Maintenance.jsx'
import Messages from './pages/Messages.jsx'
import Reports from './pages/Reports.jsx'
import FleetManagers from './pages/FleetManagers.jsx'
import Users from './pages/Users.jsx'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const PAGES = {
  dashboard: Dashboard,
  drivers: Drivers,
  vehicles: Vehicles,
  payments: Payments,
  loans: Loans,
  upi: UPI,
  purchases: Purchases,
  maintenance: Maintenance,
  messages: Messages,
  reports: Reports,
  fleet_managers: FleetManagers,
  users: Users,
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      auth.me().then(u => { setUser(u); setLoading(false) })
               .catch(() => { localStorage.clear(); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [])

  // Handle browser back/forward
  useEffect(() => {
    const path = window.location.pathname.replace('/', '') || 'dashboard'
    if (PAGES[path]) setPage(path)
  }, [])

  const navigate = (p) => {
    setPage(p)
    window.history.pushState({}, '', '/' + p)
  }

  const handleLogin = (data) => {
    setUser(data.user)
    navigate('dashboard')
  }

  const handleLogout = () => {
    auth.logout()
    setUser(null)
  }

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" style={{width:32,height:32}}/>
    </div>
  )

  if (!user) return <LoginPage onLogin={handleLogin} />

  const PageComponent = PAGES[page] || Dashboard

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Layout user={user} page={page} navigate={navigate} onLogout={handleLogout}>
        <PageComponent user={user} navigate={navigate} />
      </Layout>
    </AuthContext.Provider>
  )
}
