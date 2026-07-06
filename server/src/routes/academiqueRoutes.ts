import { Router } from 'express';
import {
  getAllAnnees, createAnnee, updateAnnee, deleteAnnee, setActiveAnnee,
  createTrimestre, updateTrimestre, deleteTrimestre,
  createSession, updateSession, deleteSession,
  duplicateAnnee, generateTrimestres,
} from '../controllers/academiqueController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

// Années académiques
router.get('/annees', protect, restrictTo('ADMIN_PRINCIPAL'), getAllAnnees);
router.post('/annees', protect, restrictTo('ADMIN_PRINCIPAL'), createAnnee);
router.put('/annees/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateAnnee);
router.delete('/annees/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteAnnee);
router.patch('/annees/:id/active', protect, restrictTo('ADMIN_PRINCIPAL'), setActiveAnnee);
router.post('/annees/:id/duplicate', protect, restrictTo('ADMIN_PRINCIPAL'), duplicateAnnee);
router.post('/annees/:id/trimestres/generate', protect, restrictTo('ADMIN_PRINCIPAL'), generateTrimestres);

// Trimestres
router.post('/trimestres', protect, restrictTo('ADMIN_PRINCIPAL'), createTrimestre);
router.put('/trimestres/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateTrimestre);
router.delete('/trimestres/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteTrimestre);

// Sessions
router.post('/sessions', protect, restrictTo('ADMIN_PRINCIPAL'), createSession);
router.put('/sessions/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateSession);
router.delete('/sessions/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteSession);

export default router;
