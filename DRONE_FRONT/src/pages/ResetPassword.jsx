import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import '../styles/ResetPassword.css'

export default function ResetPassword({ onBack }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    // Verificar si hay una sesión de recuperación activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidToken(true)
      } else {
        setError('El enlace de recuperación es inválido o ha expirado')
      }
    })

    // Escuchar eventos de autenticación (cuando Supabase procesa el token del email)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidToken(true)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Validaciones
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.')
      setPassword('')
      setConfirmPassword('')

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        if (onBack) onBack()
      }, 3000)
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (onBack) onBack()
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-background">
        <div className="drone-icon">🚁</div>
        <div className="drone-icon drone-2">🔒</div>
        <div className="drone-icon drone-3">🔑</div>
      </div>

      <div className="reset-password-container">
        <button onClick={goBack} className="back-button">
          <span>←</span> Volver al inicio
        </button>

        <div className="reset-password-header">
          <div className="logo">
            <span className="logo-icon">🔐</span>
            <h1>Restablecer Contraseña</h1>
          </div>
          <p className="subtitle">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {!isValidToken && !message ? (
          <div className="error-state">
            <span className="error-icon-large">⚠️</span>
            <h3>Enlace inválido o expirado</h3>
            <p>El enlace de recuperación ha expirado o ya fue usado.</p>
            <p>Por favor, solicita uno nuevo.</p>
            <button onClick={goBack} className="return-button">
              Volver al inicio
            </button>
          </div>
        ) : !message ? (
          <form onSubmit={handleResetPassword} className="reset-password-form">
            <div className="input-group">
              <label htmlFor="password">Nueva contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="reset-password-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="reset-password-input"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`reset-password-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Actualizando...
                </>
              ) : (
                <>
                  <span>Cambiar contraseña</span>
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
            <h3>¡Contraseña actualizada!</h3>
            <p>{message}</p>
            <p className="redirect-notice">Redirigiendo al login...</p>
          </div>
        )}
      </div>
    </div>
  )
}