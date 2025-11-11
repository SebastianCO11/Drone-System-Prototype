// verifyToken.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // usa la service key para leer roles
)

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader)
      return res.status(401).json({ error: 'No token provided' })

    const token = authHeader.split(' ')[1]

    // Validar token con Supabase
    const { data: tokenData, error: tokenError } = await supabase.auth.getUser(token)
    if (tokenError || !tokenData?.user)
      return res.status(401).json({ error: 'Invalid or expired token' })

    const userId = tokenData.user.id

    // Buscar rol en la tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, nombre, cedula')
      .eq('id', userId)
      .single()

    if (userError || !userData)
      return res.status(403).json({ error: 'User not found in database' })

    req.user = { ...userData } // ahora contiene role
    next()
  } catch (err) {
    console.error('verifyToken error:', err)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
