import { useState, useEffect } from 'react'
import { Auth } from './api'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'

export default function App() {
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    setLogged(Auth.isLoggedIn())
  }, [])

  return logged ? (
    <Dashboard onLogout={() => setLogged(false)} />
  ) : (
    <Login onLogin={() => setLogged(true)} />
  )
}


