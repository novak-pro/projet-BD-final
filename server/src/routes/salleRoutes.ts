import { Router } from 'express';
import { createSalle, getAllSalles, updateEtatSalle } from '../controllers/salle.controller';
import { protect, restrictTo} from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('admin'), createSalle);
router.get('/', protect, restrictTo('admin'), getAllSalles);
router.patch('/:id/etat', protect, restrictTo('admin'), updateEtatSalle);
export default router;