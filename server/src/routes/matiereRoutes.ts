import { Router } from 'express';
import { createMatiere, getMatieres, updateMatiere, deleteMatiere } from '../controllers/matiere.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';
const router = Router();
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), createMatiere);
router.get('/', protect, restrictTo('ADMIN_PRINCIPAL', 'PERSONNEL'), getMatieres);
router.put('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateMatiere);
router.delete('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteMatiere);
export default router;