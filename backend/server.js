import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import doctorRoutes from './routes/doctorRoutes.js';

dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app = express();

// ----------- Middleware
app.use(cors());
app.use(express.json());

// 1??  Archivos estáticos — SPA de administración
app.use(
  express.static(
    path.join(__dirname, '../frontend/dist/frontend/browser'),
  ),
);

// 2??  Archivos estáticos — Mapa (ajusta solo un nombre)
app.use(
  express.static(
    path.join(__dirname, '../appMapas/dist'),   // ?  mismo nombre
  ),
);

// 3??  Rutas API
app.use('/api/doctores', doctorRoutes);

// 4??  Entrada directa a “/adminDoctores”
app.get('/adminDoctores', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../frontend/dist/frontend/browser/index.html'),
  );
});

// 5??  Catch-all del mapa (nota la barra) ?
app.get('/mapa', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../appMapas/dist/index.html'),  // ? mismo nombre
  );
});

// ----------- Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Servidor corriendo en puerto ${PORT}`),
);
