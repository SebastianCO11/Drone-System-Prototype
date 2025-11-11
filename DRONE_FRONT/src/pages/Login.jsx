import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Auth } from '../api'

export default function Login({ onLogin }) {
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 Iniciar Sesión</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '100px auto',
    textAlign: 'center',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 10
  },
  title: { marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: 5,
    border: '1px solid #bbb'
  },
  button: {
    padding: '10px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer'
  },
  error: { color: 'red', marginTop: 10 }
}
