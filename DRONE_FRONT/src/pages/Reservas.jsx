import { useEffect, useState } from "react";
import "../styles/reservas.css";

export default function Reservas() {
  const [drones, setDrones] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [dispositivoId, setDispositivoId] = useState("");
  const [trayectoId, setTrayectoId] = useState("");
  const [correo, setCorreo] = useState("");
  const [fecha, setFecha] = useState("");

  // 🔥 Nuevo: clima y bloqueo
  const [clima, setClima] = useState(null);
  const [bloqueadoPorClima, setBloqueadoPorClima] = useState(false);

  // feedback
  const [comentarios, setComentarios] = useState("");
  const [rating, setRating] = useState("");

  const [pedidoId, setPedidoId] = useState(null);
  const [fase, setFase] = useState("form");
  const [imagenesTrayecto, setImagenesTrayecto] = useState([]);
  const [imagenActual, setImagenActual] = useState(0);
  const [codigoVerificacion, setCodigoVerificacion] = useState("");

  // carga inicial
  const cargarDatos = () => {
    fetch("http://localhost:4000/api/dispositivos/disponibles")
      .then((r) => r.json())
      .then(setDrones);

    fetch("http://localhost:4000/api/trayectos")
      .then((r) => r.json())
      .then(setRutas);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔥 Cargar clima según día seleccionado
  const cargarClima = async (nuevaFecha) => {
    const dia = nuevaFecha.split("-")[2]; // "2025-11-24" → "24"

    const res = await fetch(`http://localhost:4000/api/clima/${Number(dia)}`);
    const data = await res.json();
    setClima(data);

    // BLOQUEO por lluvia (tu BD usa TRUE/FALSE)
    if (data.lluvia === true) {
      setBloqueadoPorClima(true);
    } else {
      setBloqueadoPorClima(false);
    }
  };

  const enviarPedido = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dispositivoId,
        trayectoId,
        correo,
        fecha, // 🔥 enviamos la fecha
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setPedidoId(data.pedidoId);

      const ruta = rutas.find((r) => r.id === trayectoId);
      setImagenesTrayecto(ruta.imagenes);

      setFase("recorrido");
    } else {
      alert(data.mensaje || "Error creando pedido");
    }
  };

  // Recorrido automático
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

  // Verificar código
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

  // Guardar feedback
  const guardarFeedback = async () => {
    if (!rating) return alert("Selecciona una calificación");

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
      alert("Error guardando feedback");
    }
  };

  // Reiniciar flujo
  const reiniciar = () => {
    setDispositivoId("");
    setTrayectoId("");
    setCorreo("");
    setFecha("");
    setClima(null);
    setBloqueadoPorClima(false);
    setPedidoId(null);
    setImagenesTrayecto([]);
    setImagenActual(0);
    setCodigoVerificacion("");
    setComentarios("");
    setRating("");
    setFase("form");
    cargarDatos();
  };

  // =========================
  // FORMULARIO INICIAL
  // =========================
  if (fase === "form") {
    return (
      <div className="page-container">
        <div className="reserva-container">
          <h2>Realizar Pedido</h2>

          <form onSubmit={enviarPedido} className="reserva-form">

            {/* DRON */}
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

            {/* RUTA */}
            <label>Ruta</label>
            <select
              value={trayectoId}
              onChange={(e) => setTrayectoId(e.target.value)}
              required
            >
              <option value="">Seleccione ruta</option>
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>

            {/* FECHA */}
            <label>Fecha del pedido</label>
            <input
              type="date"
              className="reserva-input"
              min={new Date().toISOString().split("T")[0]}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                cargarClima(e.target.value);
              }}
              required
            />

            {/* CLIMA */}
            {clima && (
              <div className="clima-box">
                <p><strong>Clima para ese día:</strong></p>
                <p>🌡 Temperatura: {clima.temperatura}°C</p>
                <p>💨 Viento: {clima.viento} km/h</p>
                <p>🌧 Lluvia: {clima.lluvia ? "Sí" : "No"}</p>
                <p>👁 Visibilidad: {clima.visibilidad} km</p>
                <p>📝 {clima.descripcion}</p>
              </div>
            )}

            {/* ALERTA POR LLUVIA */}
            {bloqueadoPorClima && (
              <div className="clima-alerta">
                📛 <strong>No se puede solicitar el dron este día.</strong><br />
                La predicción indica <strong>lluvia</strong>.<br />
                Por favor selecciona otra fecha para garantizar un vuelo seguro.
              </div>
            )}

            {/* CORREO */}
            <label>Correo del cliente</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="cliente@correo.com"
              required
            />

            {/* BOTÓN */}
            <button type="submit" disabled={bloqueadoPorClima}>
              Enviar Pedido
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RECORRIDO
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

  // VERIFICAR
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

  // FEEDBACK
  if (fase === "completado") {
    return (
      <div className="page-container">
        <div className="reserva-container">
          <h2 style={{ textAlign: "center" }}>Pedido completado ✔</h2>
          <p style={{ textAlign: "center", marginBottom: "20px" }}>
            Gracias por usar DroneDelivery 🚁
          </p>

          <h3>¿Cómo fue tu experiencia?</h3>

          <textarea
            className="reserva-input"
            placeholder="Escribe tus comentarios..."
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
          />

          <label style={{ marginTop: "15px", fontWeight: "600" }}>
            Calificación:
          </label>

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
