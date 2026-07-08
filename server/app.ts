import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Créer les dossiers uploads s'ils n'existent pas
['epreuves', 'livres', 'eleves'].forEach(sub => {
  const dir = path.join(__dirname, '..', 'uploads', sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Import des routes ──
import authRoutes       from './src/routes/authRoutes';
import adminRoutes      from './src/routes/adminRoutes';
import enrollmentRoutes from './src/routes/enrollmentRoutes';
import studentRoutes    from './src/routes/studentRoutes';
import salleRoutes      from './src/routes/salleRoutes';
import matiereRoutes    from './src/routes/matiereRoutes';
import personnelRoutes  from './src/routes/personnelRoutes';
import planningRoutes   from './src/routes/planningRoutes';
import bulletinRoutes   from './src/routes/bulletinRoutes';
import disciplineRoutes from './src/routes/disciplineRoutes';
import noteRoutes       from './src/routes/noteRoutes';
import epreuveRoutes    from './src/routes/epreuveRoutes';
import paymentRoutes    from './src/routes/paymentRoutes';
import bibliothequeRoutes from './src/routes/bibliothequeRoutes';
import messageRoutes from './src/routes/messageRoutes';
import coursRoutes from './src/routes/coursRoutes';
import academiqueRoutes from './src/routes/academiqueRoutes';
import userRoutes from './src/routes/userRoutes';
import procedureRoutes from './src/routes/procedureRoutes';
import scolariteRoutes from './src/routes/scolariteRoutes';

// ── Déclaration des routes ──
app.use('/api/auth',        authRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/salles',      salleRoutes);
app.use('/api/matieres',    matiereRoutes);
app.use('/api/personnel',   personnelRoutes);
app.use('/api/planning',    planningRoutes);
app.use('/api/bulletins',   bulletinRoutes);
app.use('/api/discipline',  disciplineRoutes);
app.use('/api/notes',       noteRoutes);
app.use('/api/epreuves',    epreuveRoutes);
app.use('/api/payments',    paymentRoutes);
app.use('/api/bibliotheque', bibliothequeRoutes);
app.use('/api/messages',    messageRoutes);
app.use('/api/cours',       coursRoutes);
app.use('/api/academique',  academiqueRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/procedure',   procedureRoutes);
app.use('/api/scolarite',   scolariteRoutes);

export default app;
