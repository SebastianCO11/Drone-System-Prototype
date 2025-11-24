import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Auth } from '../api'
import "../styles/login.css";

export default function Login({ onLogin, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('Credenciales inválidas o usuario no encontrado')
      setLoading(false)
      return
    }

    const token = data.session?.access_token
    if (!token) {
      setError('Error obteniendo token de sesión')
      setLoading(false)
      return
    }

    Auth.setToken(token)
    setLoading(false)
    onLogin?.()
  }

  const handleForgotPasswordClick = () => {
    if (onForgotPassword) {
      onForgotPassword()
    }
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="drone-icon">🚁</div>
        <div className="drone-icon drone-2">🤖</div>
        <div className="drone-icon drone-3">📦</div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <h1>DroneDelivery</h1>
          </div>
          <p className="subtitle">Sistema de entregas autónomas</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Verificando...
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <button 
            type="button"
            onClick={handleForgotPasswordClick}
            className="forgot-password-link"
          >
            ¿Olvidaste tu contraseña?
          </button>
          <p>Sistema seguro de autenticación</p>
        </div>
      </div>
    </div>
  )
}