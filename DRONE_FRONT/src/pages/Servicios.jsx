import { useEffect, useState } from "react";
import { ServiciosAPI } from "../api";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await ServiciosAPI.getAll();
        setServicios(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="servicios-container">
      <h2>Historial de Servicios</h2>

      {servicios.length === 0 && <p>No hay servicios registrados.</p>}

      <table className="servicios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pedido</th>
            <th>Dron</th>
            <th>Ruta</th>
            <th>Salida</th>
            <th>Llegada</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {servicios.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.pedido_id}</td>
              <td>{s.dispositivo_id}</td>
              <td>{s.trayecto_id}</td>
              <td>{new Date(s.hora_salida).toLocaleString()}</td>
              <td>{new Date(s.hora_llegada).toLocaleString()}</td>
              <td>{s.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
