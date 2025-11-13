import '../styles/Datatable.css'
export default function DataTable({ data = [], view }) {
  // Obtener todas las claves únicas de los objetos
  const keys = Array.from(new Set(data.flatMap(d => Object.keys(d || {}))))

  // Función para formatear nombres de columnas
  const formatColumnName = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Función para renderizar valores de celdas
  const renderCell = (value) => {
    if (value === null || value === undefined) {
      return <span className="cell-empty">—</span>
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`cell-badge ${value ? 'badge-success' : 'badge-error'}`}>
          {value ? '✓ Activo' : '✗ Inactivo'}
        </span>
      )
    }
    
    if (typeof value === 'object') {
      return <code className="cell-json">{JSON.stringify(value)}</code>
    }
    
    // Detectar fechas
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value)
        return <span className="cell-date">{date.toLocaleDateString('es-ES')}</span>
      } catch {
        return String(value)
      }
    }
    
    return String(value)
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {keys.map(key => (
              <th key={key}>
                {formatColumnName(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {keys.map(key => (
                <td key={key}>
                  {renderCell(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}