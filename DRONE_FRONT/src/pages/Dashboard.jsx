import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Auth, UsersAPI, DispositivosAPI, ReservasAPI, ServiciosAPI, ClimaAPI, LogsAPI } from '../api'

export default function Dashboard({ onLogout }) {
  const [role, setRole] = useState(null)
  const [view, setView] = useState('Reservas')
  const [data, setData] = useState([])
  const [error, setError] = useState(null)

  // 🔹 Obtener el rol del usuario actual desde el token y (si es posible) desde la API
  useEffect(() => {
    async function fetchRole() {
      try {
        const token = Auth.getToken()
        if (!token) return setRole(null)

        const decoded = Auth.decodeToken(token)
        const userId = decoded?.sub

        // Intentar obtener detalles del usuario desde el backend
        try {
          const users = await UsersAPI.getAll()
          const user = users.find(u => u.id === userId)
          if (user && user.role) return setRole(user.role)
        } catch (err) {
          // Si falla (403/401) asumimos que el backend no permite listar users
          console.warn('No se pudo consultar /users para resolver rol, aplicando fallback')
        }

        // Fallback: si no podemos consultar, marcar como 'consultor' por seguridad
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

    async function loadData() {
      try {
        if (view === 'Usuarios') setData(await UsersAPI.getAll())
        if (view === 'Dispositivos') setData(await DispositivosAPI.getAll())
        if (view === 'Reservas') setData(await ReservasAPI.getAll())
        if (view === 'Servicios') setData(await ServiciosAPI.getAll())
        if (view === 'Clima') setData(await ClimaAPI.getAll())
        if (view === 'Logs') setData(await LogsAPI.getAll())
      } catch (err) {
        setError(err.message || String(err))
      }
    }

    loadData()
  }, [view])

  // 🔹 Mostrar carga inicial
  if (!role) return <p>Cargando sesión...</p>

  return (
    <div className="app-root">
      <Navbar role={role} onSelect={setView} onLogout={() => { Auth.clear(); onLogout?.() }} current={view} />

      <main className="app-content">
        <section className="page-head">
          <h2>{view}</h2>
        </section>

        {error && <p className="error">{error}</p>}

        <section className="page-body">
          {data.length === 0 ? (
            <div className="card">Sin registros disponibles.</div>
          ) : (
            <div className="card">
              <GenericTable data={data} view={view} />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function GenericTable({ data = [], view }) {
  // Si es un listado de objetos similares, renderizamos claves como columnas
  const keys = Array.from(new Set(data.flatMap(d => Object.keys(d || {}))))

  return (
    <table className="data-table">
      <thead>
        <tr>
          {keys.map(k => (
            <th key={k}>{k}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {keys.map(k => (
              <td key={k}>{renderCell(row[k])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function renderCell(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
