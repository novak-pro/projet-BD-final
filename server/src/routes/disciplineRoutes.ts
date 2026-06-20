import { Router } from 'express';
import { rapporterIncident, getIncidentsByEleve } from '../controllers/discipline.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/incident', protect, restrictTo('ADMIN_PRINCIPAL', 'PERSONNEL'), rapporterIncident);
router.get('/eleve/:eleveId', protect, getIncidentsByEleve);
export default router;