import './Navbar.css'

export default function Navbar({ role, onSelect, onLogout, current }) {
  // Opciones visibles según el rol
  const menuOptions = {
    admin: ['Usuarios', 'Dispositivos', 'Reservas', 'Servicios', 'Clima', 'Logs'],
    operador: ['Dispositivos', 'Reservas', 'Servicios', 'Clima'],
    consultor: ['Reservas', 'Servicios', 'Clima']
  }

  const items = menuOptions[role] || []

  return (
    <header className="app-navbar">
      <div className="nav-left">
        <div className="brand" onClick={() => onSelect('Reservas')} role="button" tabIndex={0}>
          <strong>Transporte UA</strong>
        </div>

        <nav className="nav-items" aria-label="Main navigation">
          {items.map(item => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`nav-button ${current === item ? 'active' : ''}`}
              aria-pressed={current === item}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="nav-right">
        <button className="nav-logout" onClick={onLogout}>Salir</button>
      </div>
    </header>
  )
}
