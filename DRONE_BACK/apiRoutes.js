import express from 'express'
import { supabase } from './supabaseClient.js'
import { verifyToken } from './verifyToken.js'
import { checkRole } from './checkRole.js'

const router = express.Router()

// Aplica verifyToken globalmente a todas las rutas
router.use(verifyToken)

// ======================================================
// 🧍 USERS (solo admin puede ver o crear)
// ======================================================
router.get('/users', checkRole('admin'), async (req, res) => {
  const { data, error } = await supabase.from('users').select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.post('/users', checkRole('admin'), async (req, res) => {
  const { nombre, cedula, role, email, password } = req.body
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  if (authError) return res.status(400).json({ error: authError.message })

  const { data, error } = await supabase.from('users').insert({
    id: authData.user.id,
    nombre,
    cedula,
    role
  })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ======================================================
// 🤖 DISPOSITIVOS
// ======================================================
// Solo admin y operador pueden crear o editar
router.get('/dispositivos', checkRole('admin', 'operador', 'consultor'), async (req, res) => {
  const { data, error } = await supabase.from('dispositivos').select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.post('/dispositivos', checkRole('admin', 'operador'), async (req, res) => {
  const { tipo, modelo, numero_serie, capacidad_carga, bateria, firmware, sensores } = req.body
  const { data, error } = await supabase.from('dispositivos').insert({
    tipo, modelo, numero_serie, capacidad_carga, bateria, firmware, sensores
  })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.put('/dispositivos/:id', checkRole('admin', 'operador'), async (req, res) => {
  const { id } = req.params
  const { estado, bateria } = req.body
  const { data, error } = await supabase.from('dispositivos').update({ estado, bateria }).eq('id', id)
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ======================================================
// 📅 RESERVAS
// ======================================================
// Todos pueden ver, solo admin/operador crean o borran
router.get('/reservas', checkRole('admin', 'operador', 'consultor'), async (req, res) => {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, dispositivos(modelo, tipo), users(nombre)')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.post('/reservas', checkRole('admin', 'operador'), async (req, res) => {
  const { usuario_id, dispositivo_id, tipo_servicio, fecha_inicio, fecha_fin } = req.body
  const { data, error } = await supabase.from('reservas').insert({
    usuario_id, dispositivo_id, tipo_servicio, fecha_inicio, fecha_fin
  })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.delete('/reservas/:id', checkRole('admin'), async (req, res) => {
  const { id } = req.params
  const { error } = await supabase.from('reservas').delete().eq('id', id)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Reserva eliminada correctamente' })
})

// ======================================================
// 📋 SERVICIOS (bitácora)
// ======================================================
router.get('/servicios', checkRole('admin', 'operador', 'consultor'), async (req, res) => {
  const { data, error } = await supabase.from('servicios').select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.post('/servicios', checkRole('admin', 'operador'), async (req, res) => {
  const { reserva_id, dispositivo_id, operador_id, tipo_servicio, estado, observaciones } = req.body
  const { data, error } = await supabase.from('servicios').insert({
    reserva_id, dispositivo_id, operador_id, tipo_servicio, estado, observaciones
  })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ======================================================
// 🌦️ CLIMA (datos simulados)
// ======================================================
router.get('/clima', checkRole('admin', 'operador', 'consultor'), async (req, res) => {
  const { data, error } = await supabase.from('clima').select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.get('/clima/:dia', checkRole('admin', 'operador', 'consultor'), async (req, res) => {
  const { dia } = req.params
  const { data, error } = await supabase.from('clima').select('*').eq('dia', dia).single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ======================================================
// 🧾 LOGS (solo admin)
// ======================================================
router.get('/logs', checkRole('admin'), async (req, res) => {
  const { data, error } = await supabase.from('logs').select('*').order('created_at', { ascending: false })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

export default router
