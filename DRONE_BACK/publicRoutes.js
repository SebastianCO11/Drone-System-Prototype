import express from "express"
import { supabase } from "./supabaseClient.js"
import transporter from "./transporter.js"

const router = express.Router()

// ======================================================
// 🚀 CREAR PEDIDO (PÚBLICO)
// ======================================================
router.post("/pedido", async (req, res) => {
  try {
    const { dispositivoId, trayectoId, correo } = req.body

    if (!dispositivoId || !trayectoId || !correo) {
      return res.status(400).json({ mensaje: "Faltan datos" })
    }

    // Obtener imágenes del trayecto
    const { data: trayecto, error: trayectoError } = await supabase
      .from("trayectos")
      .select("imagenes")
      .eq("id", trayectoId)
      .single()

    if (trayectoError)
      return res.status(404).json({ mensaje: "Trayecto no encontrado" })

    const imagenes = Array.isArray(trayecto.imagenes)
      ? trayecto.imagenes
      : []

    // Crear código
    const codigo = Math.floor(1000 + Math.random() * 9000).toString()

    // Crear pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
        dispositivo_id: dispositivoId,
        trayecto_id: trayectoId,
        correo,
        codigo_acceso: codigo,
        estado: "en_camino",
        fecha_inicio: new Date().toISOString()
      })
      .select()
      .single()

    if (pedidoError) return res.status(500).json({ mensaje: "Error creando pedido" })

    // Enviar correo
    await transporter.sendMail({
      from: `"Drone Delivery" <${process.env.SMTP_USER}>`,
      to: correo,
      subject: "Código de entrega del dron",
      html: `
        <h2>Tu código de entrega</h2>
        <p>Utiliza este código para confirmar la entrega:</p>
        <h1 style="font-size: 40px; letter-spacing: 4px;">${codigo}</h1>
      `
    })

    return res.json({
      mensaje: "Pedido creado y correo enviado",
      pedidoId: pedido.id,
      imagenes
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ mensaje: "Error interno" })
  }
})


// ======================================================
// 🚀 VERIFICAR CÓDIGO Y REGISTRAR SERVICIO
// ======================================================
router.post("/pedido/:id/verificar", async (req, res) => {
  try {
    const { id } = req.params
    const { codigo } = req.body

    const { data: pedido } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .single()

    if (!pedido) return res.status(404).json({ mensaje: "Pedido no existe" })
    if (pedido.codigo_acceso !== codigo)
      return res.status(400).json({ mensaje: "Código incorrecto" })

    // Completar pedido
    await supabase
      .from("pedidos")
      .update({
        estado: "completado",
        fecha_entrega: new Date().toISOString()
      })
      .eq("id", id)

    // Crear registro en servicios
    await supabase
      .from("servicios")
      .insert({
        pedido_id: id,
        dispositivo_id: pedido.dispositivo_id,
        trayecto_id: pedido.trayecto_id,
        hora_salida: pedido.fecha_inicio,
        hora_llegada: new Date().toISOString(),
        estado: "completado"
      })

    return res.json({ mensaje: "Entrega confirmada" })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: "Error verificando" })
  }
})


// ======================================================
// 🔓 DRONES DISPONIBLES
// ======================================================
router.get("/dispositivos/disponibles", async (req, res) => {
  const { data } = await supabase
    .from("dispositivos")
    .select("*")
    .eq("estado", "disponible")

  res.json(data || [])
})


// ======================================================
// 🔓 TRAYECTOS
// ======================================================
router.get("/trayectos", async (req, res) => {
  const { data } = await supabase
    .from("trayectos")
    .select("*")

  res.json(data || [])
})
router.post("/feedback", async (req, res) => {
  try {
    const { pedidoId, rating, comentarios } = req.body;

    if (!pedidoId || !rating) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // Buscar servicio asociado al pedido
    const { data: servicio, error: servicioError } = await supabase
      .from("servicios")
      .select("id")
      .eq("pedido_id", pedidoId)
      .maybeSingle();

    if (servicioError) {
      console.error("Error buscando servicio:", servicioError);
      return res.status(500).json({ mensaje: "No se pudo buscar el servicio" });
    }

    if (!servicio) {
      return res.status(404).json({ mensaje: "No existe un servicio para este pedido" });
    }

    // Guardar feedback en columnas reales: comentario + calificacion
    const { error: updateError } = await supabase
      .from("servicios")
      .update({
        comentario_cliente: comentarios,     // <-- CAMPO REAL
        calificacion: Number(rating) // <-- CAMPO REAL
      })
      .eq("id", servicio.id);

    if (updateError) {
      console.error("Error actualizando servicio:", updateError);
      return res.status(500).json({ mensaje: "No se pudo guardar el feedback" });
    }

    return res.json({ mensaje: "Feedback guardado correctamente" });

  } catch (e) {
    console.error("Error guardando feedback:", e);
    res.status(500).json({ mensaje: "Error interno guardando feedback" });
  }
});



export default router


