import { Router } from 'express';
import { createSalle, getAllSalles, updateSalle, deleteSalle, updateEtatSalle, updatePositionSalle } from '../controllers/salle.controller';
import { protect, restrictTo} from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), createSalle);
router.get('/', protect, restrictTo('ADMIN_PRINCIPAL'), getAllSalles);
router.put('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateSalle);
router.delete('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteSalle);
router.patch('/:id/etat', protect, restrictTo('ADMIN_PRINCIPAL'), updateEtatSalle);
router.patch('/:id/position', protect, restrictTo('ADMIN_PRINCIPAL'), updatePositionSalle);
export default router;
