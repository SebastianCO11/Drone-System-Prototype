import '../styles/navbar.css'

export default function Navbar({ role, onSelect, onLogout, current }) {
  const menuItems = [
    { name: 'Reservas', icon: '📦', roles: ['admin', 'operador', 'consultor'] },
    { name: 'Rutas', icon: '📍', roles: ['admin', 'operador', 'consultor'] },
    { name: 'Dispositivos', icon: '🤖', roles: ['admin', 'operador'] },
    { name: 'Servicios', icon: '🚁', roles: ['admin', 'operador'] },
    { name: 'Clima', icon: '🌤️', roles: ['admin', 'operador', 'consultor'] },
    { name: 'Usuarios', icon: '👥', roles: ['admin'] },
    { name: 'Logs', icon: '📋', roles: ['admin'] }
  ]

  // Filtrar items según rol
  const visibleItems = menuItems.filter(item => item.roles.includes(role))

  return (
    <nav className="navbar">
      {/* Header del navbar */}
      <div className="navbar-header">
        <div className="navbar-logo">
          <span className="navbar-logo-icon">🚀</span>
          <h2>DroneDelivery</h2>
        </div>
        <p className="navbar-subtitle">Panel de Control</p>
      </div>

      {/* Items del menú */}
      <ul className="navbar-menu">
        {visibleItems.map(item => (
          <li key={item.name}>
            <button
              onClick={() => onSelect(item.name)}
              className={`navbar-item ${current === item.name ? 'active' : ''}`}
            >
              <span className="navbar-item-icon">{item.icon}</span>
              <span className="navbar-item-text">{item.name}</span>
              {current === item.name && <span className="navbar-item-indicator" />}
            </button>
          </li>
        ))}
      </ul>

      {/* Footer del navbar */}
      <div className="navbar-footer">
        <div className="navbar-user">
          <span className="navbar-user-icon">👤</span>
          <div className="navbar-user-info">
            <span className="navbar-user-role">{role}</span>
            <span className="navbar-user-status">En línea</span>
          </div>
        </div>
        <button onClick={onLogout} className="navbar-logout">
          <span>🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}