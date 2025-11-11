// ======================================================
// 🌐 API CLIENT - Backend Supabase (con JWT y roles)
// ======================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ======================================================
// 🧩 Helper genérico
// ======================================================
async function request(url, method = 'GET', body = null) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${url}`, options)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401) throw new Error('No autorizado. Inicia sesión nuevamente.')
    if (res.status === 403) throw new Error('Acceso denegado: no tienes permisos.')
    throw new Error(data.error || `Error ${res.status}`)
  }

  return data
}

// ======================================================
// 🧍 USERS (solo admin)
// ======================================================
export const UsersAPI = {
  getAll: () => request('/users'),
  create: (user) => request('/users', 'POST', user),
}

// ======================================================
// 🤖 DISPOSITIVOS
// ======================================================
export const DispositivosAPI = {
  getAll: () => request('/dispositivos'),
  create: (data) => request('/dispositivos', 'POST', data),
  update: (id, data) => request(`/dispositivos/${id}`, 'PUT', data),
}

// ======================================================
// 📅 RESERVAS
// ======================================================
export const ReservasAPI = {
  getAll: () => request('/reservas'),
  create: (data) => request('/reservas', 'POST', data),
  delete: (id) => request(`/reservas/${id}`, 'DELETE'),
}

// ======================================================
// 📋 SERVICIOS (bitácora)
// ======================================================
export const ServiciosAPI = {
  getAll: () => request('/servicios'),
  create: (data) => request('/servicios', 'POST', data),
}

// ======================================================
// 🌦️ CLIMA
// ======================================================
export const ClimaAPI = {
  getAll: () => request('/clima'),
  getByDia: (dia) => request(`/clima/${dia}`),
}

// ======================================================
// 🧾 LOGS (solo admin)
// ======================================================
export const LogsAPI = {
  getAll: () => request('/logs'),
}

// ======================================================
// 🧠 Utilidades de sesión
// ======================================================
export const Auth = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  clear: () => localStorage.removeItem('token'),
  isLoggedIn: () => !!localStorage.getItem('token')
}

// Decode token (safe) to extract payload
Auth.decodeToken = (token) => {
  try {
    const parts = token?.split('.')
    if (!parts || parts.length < 2) return null
    const payload = parts[1]
    // atob is available in browsers; handle padding
    const json = decodeURIComponent(Array.from(atob(payload)).map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(json)
  } catch (err) {
    try {
      // fallback simpler decode
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      return null
    }
  }
}

Auth.logout = () => {
  Auth.clear()
}
