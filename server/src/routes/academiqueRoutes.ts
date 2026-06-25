import { Router } from 'express';
import {
  getAllAnnees, createAnnee, updateAnnee, deleteAnnee, setActiveAnnee,
  createTrimestre, deleteTrimestre,
  createSession, deleteSession,
} from '../controllers/academiqueController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

// Années académiques
router.get('/annees', protect, restrictTo('ADMIN_PRINCIPAL'), getAllAnnees);
router.post('/annees', protect, restrictTo('ADMIN_PRINCIPAL'), createAnnee);
router.put('/annees/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateAnnee);
router.delete('/annees/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteAnnee);
router.patch('/annees/:id/active', protect, restrictTo('ADMIN_PRINCIPAL'), setActiveAnnee);

// Trimestres
router.post('/trimestres', protect, restrictTo('ADMIN_PRINCIPAL'), createTrimestre);
router.delete('/trimestres/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteTrimestre);

// Sessions
router.post('/sessions', protect, restrictTo('ADMIN_PRINCIPAL'), createSession);
router.delete('/sessions/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteSession);

export default router;
