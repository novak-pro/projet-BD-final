import { Router } from 'express';
import {
  rapporterIncident,
  getIncidentsByEleve,
  getPendingIncidents,
  updateIncident,
  deleteIncident
} from '../controllers/discipline.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/incident', protect, restrictTo('ADMIN_PRINCIPAL', 'PERSONNEL'), rapporterIncident);
router.get('/incident/pending', protect, restrictTo('ADMIN_PRINCIPAL'), getPendingIncidents);
router.put('/incident/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateIncident);
router.get('/eleve/:eleveId', protect, getIncidentsByEleve);
router.delete('/incident/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteIncident);
export default router;
