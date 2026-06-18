import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});