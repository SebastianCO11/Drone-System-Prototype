import { useState, useEffect } from 'react'
import { Auth } from './api'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  const [logged, setLogged] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  useEffect(() => {
    setLogged(Auth.isLoggedIn())
    
    // Detectar si viene desde el link de recuperación
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      setShowResetPassword(true)
    }
  }, [])

  // Si está logueado, mostrar Dashboard
  if (logged) {
    return <Dashboard onLogout={() => setLogged(false)} />
  }

  // Si está en proceso de restablecer contraseña
  if (showResetPassword) {
    return (
      <ResetPassword 
        onBack={() => {
          setShowResetPassword(false)
          window.location.hash = '' // Limpiar hash
        }}
      />
    )
  }

  // Si no está logueado y quiere recuperar contraseña
  if (showForgotPassword) {
    return (
      <ForgotPassword 
        onBack={() => setShowForgotPassword(false)} 
      />
    )
  }

  // Si no está logueado, mostrar Login
  return (
    <Login 
      onLogin={() => setLogged(true)} 
      onForgotPassword={() => setShowForgotPassword(true)}
    />
  )
}