import { Router } from 'express';
import { createSalle, getAllSalles, updateEtatSalle } from '../controllers/salle.controller';
import { protect, restrictTo} from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), createSalle);
router.get('/', protect, restrictTo('ADMIN_PRINCIPAL'), getAllSalles);
router.patch('/:id/etat', protect, restrictTo('ADMIN_PRINCIPAL'), updateEtatSalle);
export default router;