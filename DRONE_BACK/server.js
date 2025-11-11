import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './apiRoutes.js'
import { verifyToken } from './verifyToken.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

// Rutas públicas
app.get('/', (req, res) => res.send('🚀 API Supabase activa'))

// Rutas protegidas (requieren JWT)
app.use('/api', verifyToken, apiRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
