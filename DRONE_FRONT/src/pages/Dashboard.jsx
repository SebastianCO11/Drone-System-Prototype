import { useState, useEffect } from 'react'
import Navbar from '../pages/Navbar'
import DataTable from '../pages/DataTable'
import RoutesPanel from '../pages/RoutesPanel'
import { Auth, UsersAPI, DispositivosAPI, ReservasAPI, ServiciosAPI, ClimaAPI, LogsAPI } from '../api'
import '../styles/dashboard.css'

export default function Dashboard({ onLogout }) {
  const [role, setRole] = useState(null)
  const [view, setView] = useState('Reservas')
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // 🔹 Obtener el rol del usuario actual desde el token
  useEffect(() => {
    async function fetchRole() {
      try {
        const token = Auth.getToken()
        if (!token) return setRole(null)

        const decoded = Auth.decodeToken(token)
        const userId = decoded?.sub

        try {
          const users = await UsersAPI.getAll()
          const user = users.find(u => u.id === userId)
          if (user && user.role) return setRole(user.role)
        } catch (err) {
          console.warn('No se pudo consultar /users, aplicando fallback')
        }

        setRole('consultor')
      } catch (err) {
        console.error('Error obteniendo rol:', err)
        setRole('consultor')
      }
    }

    fetchRole()
  }, [])

  // 🔹 Cargar datos según vista
  useEffect(() => {
    setData([])
    setError(null)
    setLoading(true)

    async function loadData() {
      try {
        let result = []

        switch (view) {
          case 'Usuarios':
            result = await UsersAPI.getAll()
            break
          case 'Dispositivos':
            result = await DispositivosAPI.getAll()
            break
          case 'Reservas':
            result = await ReservasAPI.getAll()
            break
          case 'Servicios':
            result = await ServiciosAPI.getAll()
            break
          case 'Clima':
            result = await ClimaAPI.getAll()
            break
          case 'Logs':
            result = await LogsAPI.getAll()
            break
          case 'Rutas':
            // Rutas se carga internamente en RoutesPanel
            result = []
            break
          default:
            result = []
        }

        setData(result)
      } catch (err) {
        setError(err.message || String(err))
      } finally {
        setLoading(false)
      }
    }

    if (view !== 'Rutas') {
      loadData()
    } else {
      setLoading(false)
    }
  }, [view])

  // 🔹 Iconos para cada vista
  const viewIcons = {
    'Usuarios': '👥',
    'Dispositivos': '🤖',
    'Reservas': '📦',
    'Servicios': '🚁',
    'Clima': '🌤️',
    'Logs': '📋',
    'Rutas': '📍'
  }

  // 🔹 Mostrar carga inicial
  if (!role) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando sesión...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-root">
      <Navbar
        role={role}
        onSelect={setView}
        onLogout={() => { Auth.clear(); onLogout?.() }}
        current={view}
      />

      <main className="dashboard-content">
        {/* Header de la página actual */}
        <header className="dashboard-header">
          <div className="header-title">
            <span className="header-icon">{viewIcons[view] || '📊'}</span>
            <h1>{view}</h1>
          </div>
          <div className="header-info">
            <span className="user-badge">👤 {role}</span>
            <span className="records-count">
              {view === 'Rutas' ? '-' : `${data.length} ${data.length === 1 ? 'registro' : 'registros'}`}
            </span>
          </div>
        </header>

        {/* Mensajes de error */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Contenido principal */}
        <section className="dashboard-body">
          {view === 'Rutas' ? (
            <RoutesPanel />
          ) : loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>Sin registros disponibles</h3>
              <p>No hay datos para mostrar en esta sección</p>
            </div>
          ) : (
            <div className="data-card">
              <DataTable data={data} view={view} />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}