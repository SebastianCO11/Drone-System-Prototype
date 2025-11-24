import express from "express"
import { supabase } from "./supabaseClient.js"
import transporter from "./transporter.js"

const router = express.Router()

// ======================================================
// 🚀 CREAR PEDIDO (PÚBLICO)
// ======================================================
router.post("/pedido", async (req, res) => {
  try {
    const { dispositivoId, trayectoId, correo, fecha } = req.body;

    if (!dispositivoId || !trayectoId || !correo || !fecha) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }

    // Obtener imágenes del trayecto
    const { data: trayecto } = await supabase
      .from("trayectos")
      .select("imagenes")
      .eq("id", trayectoId)
      .single();

    const imagenes = Array.isArray(trayecto.imagenes) ? trayecto.imagenes : [];

    const codigo = Math.floor(1000 + Math.random() * 9000).toString();

    // Crear pedido
    const { data: pedido } = await supabase
      .from("pedidos")
      .insert({
        dispositivo_id: dispositivoId,
        trayecto_id: trayectoId,
        correo,
        codigo_acceso: codigo,
        estado: "en_camino",
        fecha_inicio: fecha,
        fecha_entrega: fecha,
      })
      .select()
      .single();

    // Enviar correo
    await transporter.sendMail({
      from: `"Drone Delivery" <${process.env.SMTP_USER}>`,
      to: correo,
      subject: "Código de entrega del dron",
      html: `
        <h2>Tu código de entrega</h2>
        <p>Utiliza este código para confirmar la entrega:</p>
        <h1 style="font-size: 40px; letter-spacing: 4px;">${codigo}</h1>
      `,
    });

    res.json({ mensaje: "Pedido creado", pedidoId: pedido.id, imagenes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// ======================================================
// 🚀 VERIFICAR CÓDIGO
// ======================================================
router.post("/pedido/:id/verificar", async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo } = req.body;

    const { data: pedido } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .single();

    if (!pedido) return res.status(404).json({ mensaje: "Pedido no existe" });
    if (pedido.codigo_acceso !== codigo)
      return res.status(400).json({ mensaje: "Código incorrecto" });

    await supabase
      .from("pedidos")
      .update({
        estado: "completado",
        fecha_entrega: pedido.fecha_inicio,
      })
      .eq("id", id);

    await supabase
      .from("servicios")
      .insert({
        pedido_id: id,
        dispositivo_id: pedido.dispositivo_id,
        trayecto_id: pedido.trayecto_id,
        hora_salida: pedido.fecha_inicio,
        hora_llegada: pedido.fecha_inicio,
        estado: "completado",
      });

    res.json({ mensaje: "Entrega confirmada" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// ======================================================
// 🌦️ CLIMA (PÚBLICO)
// ======================================================
router.get("/clima/:dia", async (req, res) => {
  const { dia } = req.params;

  const { data, error } = await supabase
    .from("clima")
    .select("*")
    .eq("dia", dia)
    .single();

  if (error) return res.status(404).json({ mensaje: "Clima no encontrado" });

  res.json(data);
});

// ======================================================
// DRONES DISPONIBLES
// ======================================================
router.get("/dispositivos/disponibles", async (req, res) => {
  const { data } = await supabase
    .from("dispositivos")
    .select("*")
    .eq("estado", "disponible");

  res.json(data);
});

// ======================================================
// TRAYECTOS
// ======================================================
router.get("/trayectos", async (req, res) => {
  const { data } = await supabase
    .from("trayectos")
    .select("*");

  res.json(data);
});

// ======================================================
// FEEDBACK
// ======================================================
router.post("/feedback", async (req, res) => {
  try {
    const { pedidoId, rating, comentarios } = req.body;

    const { data: servicio } = await supabase
      .from("servicios")
      .select("id")
      .eq("pedido_id", pedidoId)
      .maybeSingle();

    await supabase
      .from("servicios")
      .update({
        comentario_cliente: comentarios,
        calificacion: Number(rating),
      })
      .eq("id", servicio.id);

    res.json({ mensaje: "Feedback guardado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: "Error guardando feedback" });
  }
});

export default router;
