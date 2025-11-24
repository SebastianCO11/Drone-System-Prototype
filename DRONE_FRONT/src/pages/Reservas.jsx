import { useEffect, useState } from "react";
import "../styles/reservas.css";

export default function Reservas() {
  const [drones, setDrones] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [dispositivoId, setDispositivoId] = useState("");
  const [trayectoId, setTrayectoId] = useState("");
  const [correo, setCorreo] = useState("");

  const [pedidoId, setPedidoId] = useState(null);
  const [fase, setFase] = useState("form"); 
  const [imagenesTrayecto, setImagenesTrayecto] = useState([]);
  const [imagenActual, setImagenActual] = useState(0);
  const [codigoVerificacion, setCodigoVerificacion] = useState("");

  // ================================
  // 1. Cargar drones disponibles
  // ================================
  useEffect(() => {
    fetch("http://localhost:4000/api/dispositivos/disponibles")
      .then((res) => res.json())
      .then((data) => setDrones(data || []));
  }, []);

  // ================================
  // 2. Cargar rutas disponibles
  // ================================
  useEffect(() => {
    fetch("http://localhost:4000/api/trayectos")
      .then((res) => res.json())
      .then((data) => setRutas(data || []));
  }, []);

  // ===========================================
  // 3. ENVIAR FORMULARIO Y COMENZAR RECORRIDO
  // ===========================================
  const enviarPedido = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dispositivoId, trayectoId, correo }),
    });

    const data = await res.json();

    if (res.ok) {
      setPedidoId(data.pedidoId);

      // OBTENER RUTA E IMÁGENES (NO JSON.parse)
      const ruta = rutas.find((r) => r.id === trayectoId);
      setImagenesTrayecto(ruta.imagenes); // ✔ CORREGIDO

      setFase("recorrido");
    } else {
      alert(data.mensaje || "Error creando pedido");
    }
  };

  // ======================================
  // 4. MOSTRAR IMÁGENES DEL RECORRIDO
  // ======================================
  useEffect(() => {
    if (fase !== "recorrido") return;

    if (imagenActual < imagenesTrayecto.length - 1) {
      const timer = setTimeout(() => {
        setImagenActual((i) => i + 1);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setFase("verificar");
      }, 4000);
    }
  }, [fase, imagenActual, imagenesTrayecto]);

  // ======================================
  // 5. VERIFICAR CÓDIGO
  // ======================================
  const verificarCodigo = async () => {
    const res = await fetch(`http://localhost:4000/api/pedido/${pedidoId}/verificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigoVerificacion }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Entrega confirmada exitosamente ✔🚁");
      setFase("completado");
    } else {
      alert(data.mensaje || "Código incorrecto");
    }
  };

  // ================================
  // RENDER SEGÚN FASE
  // ================================
  if (fase === "form") {
    return (
      <div className="reserva-container">
        <h2>Realizar Pedido</h2>
        <form onSubmit={enviarPedido} className="reserva-form">

          <label>Dron disponible</label>
          <select value={dispositivoId} onChange={(e) => setDispositivoId(e.target.value)} required>
            <option value="">Seleccione un dron</option>
            {drones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.modelo} ({d.tipo})
              </option>
            ))}
          </select>

          <label>Ruta</label>
          <select value={trayectoId} onChange={(e) => setTrayectoId(e.target.value)} required>
            <option value="">Seleccione ruta</option>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>

          <label>Correo del cliente</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="cliente@correo.com"
            required
          />

          <button type="submit">Enviar Pedido</button>
        </form>
      </div>
    );
  }

  // FASE: Recorrer imágenes
  if (fase === "recorrido") {
    return (
      <div className="recorrido-container">
        <h2>El dron está en camino...</h2>
        <p>Mostrando ruta</p>

        <img
          src={imagenesTrayecto[imagenActual]}
          alt="Dron en camino"
          className="recorrido-imagen"
        />
      </div>
    );
  }

  // FASE: Verificar código
  if (fase === "verificar") {
    return (
      <div className="codigo-container">
        <h2>El dron ha llegado 📦</h2>
        <p>Ingresa el código enviado al correo:</p>

        <input
          type="text"
          maxLength="4"
          value={codigoVerificacion}
          onChange={(e) => setCodigoVerificacion(e.target.value)}
        />

        <button onClick={verificarCodigo}>Confirmar Entrega</button>
      </div>
    );
  }

  // FASE: Completado
  if (fase === "completado") {
    return (
      <div className="finalizado-container">
        <h2>Pedido completado ✔</h2>
        <p>Gracias por usar DroneDelivery 🚁</p>
      </div>
    );
  }
}
