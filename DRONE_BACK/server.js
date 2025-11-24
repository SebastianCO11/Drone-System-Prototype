import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import publicRoutes from "./publicRoutes.js";
import privateRoutes from "./privateRoutes.js";
import { verifyToken } from "./verifyToken.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 👉 RUTAS PÚBLICAS (NO TOKEN)
app.use("/api", publicRoutes);

// 👉 RUTAS PRIVADAS (TOKEN OBLIGATORIO)
app.use("/api", verifyToken, privateRoutes);

app.listen(process.env.PORT || 4000, () =>
  console.log("Servidor corriendo en puerto 4000")
);
