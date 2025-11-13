import { useState } from 'react'
import { supabase } from '../supabaseClient'
import '../styles/forgot-password.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setMessage('Te hemos enviado un correo con las instrucciones para recuperar tu contraseña.')
    } catch (err) {
      setError(err.message || 'Error al enviar el correo de recuperación')
    } finally {
      setLoading(false)
    }
  }

const goBack = () => {
    onBack?.()
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-background">
        <div className="drone-icon">🚁</div>
        <div className="drone-icon drone-2">🔑</div>
        <div className="drone-icon drone-3">📧</div>
      </div>

      <div className="forgot-password-container">
        {/* Botón de regresar */}
        <button onClick={goBack} className="back-button">
          <span>←</span> Volver al inicio
        </button>

        <div className="forgot-password-header">
          <div className="logo">
            <span className="logo-icon">🔑</span>
            <h1>Recuperar Contraseña</h1>
          </div>
          <p className="subtitle">
            Ingresa tu correo electrónico y te enviaremos las instrucciones
          </p>
        </div>

        {!message ? (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
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
                  className="forgot-password-input"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`forgot-password-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <span>Enviar instrucciones</span>
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
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>¡Correo enviado!</h3>
            <p>{message}</p>
            <button onClick={goBack} className="return-button">
              Volver al inicio de sesión
            </button>
          </div>
        )}

        <div className="forgot-password-footer">
          <p>¿Recordaste tu contraseña? <button onClick={goBack} className="login-link">Iniciar sesión</button></p>
        </div>
      </div>
    </div>
  )
}