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

  // NUEVOS ESTADOS PARA FEEDBACK
  const [comentarios, setComentarios] = useState("");
  const [rating, setRating] = useState("");

  // ================================
  // 1. Cargar drones
  // ================================
  const cargarDatos = () => {
    fetch("http://localhost:4000/api/dispositivos/disponibles")
      .then((res) => res.json())
      .then((data) => setDrones(data || []));

    fetch("http://localhost:4000/api/trayectos")
      .then((res) => res.json())
      .then((data) => setRutas(data || []));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ===========================================
  // 2. Enviar pedido
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

      const rutaSeleccionada = rutas.find((r) => r.id === trayectoId);
      setImagenesTrayecto(rutaSeleccionada.imagenes);

      setFase("recorrido");
    } else {
      alert(data.mensaje || "Error creando pedido");
    }
  };

  // ======================================
  // 3. Mostrar recorrido
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
  // 4. Verificar código
  // ======================================
  const verificarCodigo = async () => {
    const res = await fetch(
      `http://localhost:4000/api/pedido/${pedidoId}/verificar`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoVerificacion }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      setFase("completado");
    } else {
      alert(data.mensaje || "Código incorrecto");
    }
  };

  // ======================================
  // 5. Guardar feedback
  // ======================================
  const guardarFeedback = async () => {
    if (!rating) {
      alert("Por favor selecciona una calificación");
      return;
    }

    const res = await fetch("http://localhost:4000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pedidoId,
        rating,
        comentarios,
      }),
    });

    if (res.ok) {
      alert("¡Gracias por tu opinión!");
      reiniciar();
    } else {
      alert("Error guardando el feedback");
    }
  };

  // ======================================
  // 6. Reiniciar flujo
  // ======================================
  const reiniciar = () => {
    setDispositivoId("");
    setTrayectoId("");
    setCorreo("");
    setPedidoId(null);
    setImagenesTrayecto([]);
    setImagenActual(0);
    setCodigoVerificacion("");
    setComentarios("");
    setRating("");
    setFase("form");
    cargarDatos();
  };

  // ================================
  // 7. Render por fase
  // ================================

  if (fase === "form") {
    return (
      <div className="reserva-container">
        <h2>Realizar Pedido</h2>
        <form onSubmit={enviarPedido} className="reserva-form">

          <label>Dron disponible</label>
          <select
            value={dispositivoId}
            onChange={(e) => setDispositivoId(e.target.value)}
            required
          >
            <option value="">Seleccione un dron</option>
            {drones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.modelo} ({d.tipo})
              </option>
            ))}
          </select>

          <label>Ruta</label>
          <select
            value={trayectoId}
            onChange={(e) => setTrayectoId(e.target.value)}
            required
          >
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

 if (fase === "completado") {
  return (
    <div className="page-container">
      <div className="reserva-container">   {/* MISMA CAJA DEL FORM */}

        <h2 style={{ textAlign: "center" }}>Pedido completado ✔</h2>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Gracias por usar DroneDelivery 🚁
        </p>

        <h3 style={{ marginBottom: "10px" }}>¿Cómo fue tu experiencia?</h3>

        <textarea
          className="reserva-input"    
          placeholder="Escribe tus comentarios..."
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
        />

        <label style={{ marginTop: "15px", fontWeight: "600" }}>Calificación:</label>

        <select
          className="reserva-input"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">Selecciona ⭐</option>
          <option value="1">⭐</option>
          <option value="2">⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
        </select>

        <button className="reserva-button" onClick={guardarFeedback}>
          Enviar Opinión
        </button>

        <button className="reserva-secondary" onClick={reiniciar}>
          Hacer otro pedido
        </button>

      </div>
    </div>
    );
  } 
}
