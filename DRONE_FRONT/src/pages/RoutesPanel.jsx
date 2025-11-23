import { useState, useEffect } from 'react'
import { TrayectosAPI } from '../api'
import '../styles/routes-panel.css'

// Datos simulados para las descripciones de los pasos
// En un futuro esto podría venir de la base de datos (columna 'detalles' o 'checkpoints')
const MOCK_STEPS = [
    "Saliendo del punto de recolección",
    "En tránsito por zona principal",
    "Punto de control intermedio",
    "Acercándose al destino",
    "Llegando al punto de entrega",
    "Entrega finalizada / Retorno"
]

export default function RoutesPanel() {
    const [routes, setRoutes] = useState([])
    const [selectedRoute, setSelectedRoute] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadRoutes()
    }, [])

    async function loadRoutes() {
        try {
            setLoading(true)
            const data = await TrayectosAPI.getAll()
            setRoutes(data)
        } catch (err) {
            setError("Error al cargar las rutas")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="loading-spinner"></div>
    if (error) return <div className="error-banner">{error}</div>

    // Vista de Detalle de Ruta
    if (selectedRoute) {
        return (
            <div className="routes-container">
                <button className="back-button" onClick={() => setSelectedRoute(null)}>
                    ← Volver a Rutas
                </button>

                <div className="header-title" style={{ marginBottom: '30px' }}>
                    <h1>📍 {selectedRoute.nombre}</h1>
                    <span className="user-badge">ID: {selectedRoute.id.slice(0, 8)}...</span>
                </div>

                <div className="timeline">
                    {selectedRoute.imagenes && selectedRoute.imagenes.map((imgUrl, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-marker">
                                {String.fromCharCode(65 + index)}
                            </div>
                            <div className="timeline-content">
                                <h3 className="timeline-description">
                                    {MOCK_STEPS[index] || `Paso ${index + 1}`}
                                </h3>
                                <img
                                    src={imgUrl}
                                    alt={`Paso ${index + 1}`}
                                    className="timeline-image"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Imagen+No+Disponible'}
                                />
                            </div>
                        </div>
                    ))}

                    {(!selectedRoute.imagenes || selectedRoute.imagenes.length === 0) && (
                        <div className="empty-state">
                            <p>No hay imágenes registradas para esta ruta.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Vista de Lista de Rutas
    return (
        <div className="routes-container">
            <div className="routes-grid">
                {routes.map(route => (
                    <div
                        key={route.id}
                        className="route-card"
                        onClick={() => setSelectedRoute(route)}
                    >
                        <h3>📍 {route.nombre}</h3>
                        <p>📅 Creado: {new Date(route.created_at).toLocaleDateString()}</p>
                        <p>📷 {route.imagenes ? route.imagenes.length : 0} puntos de control</p>
                    </div>
                ))}

                {routes.length === 0 && (
                    <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                        <p>No hay rutas registradas en el sistema.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
