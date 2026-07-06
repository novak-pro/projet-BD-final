import { Router } from 'express';
import {
  rapporterIncident,
  getIncidentsByEleve,
  getPendingIncidents,
  updateIncident,
  deleteIncident,
  getTypeInfractions,
  createTypeInfraction,
  updateTypeInfraction,
  deleteTypeInfraction,
} from '../controllers/discipline.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

// Incidents
router.post('/incident', protect, restrictTo('ADMIN_PRINCIPAL', 'PERSONNEL'), rapporterIncident);
router.get('/incident/pending', protect, restrictTo('ADMIN_PRINCIPAL'), getPendingIncidents);
router.put('/incident/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateIncident);
router.get('/eleve/:eleveId', protect, getIncidentsByEleve);
router.delete('/incident/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteIncident);

// Types d'infractions (admin only)
router.get('/types', protect, restrictTo('ADMIN_PRINCIPAL'), getTypeInfractions);
router.post('/types', protect, restrictTo('ADMIN_PRINCIPAL'), createTypeInfraction);
router.put('/types/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateTypeInfraction);
router.delete('/types/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteTypeInfraction);

export default router;
