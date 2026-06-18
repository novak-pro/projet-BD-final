import { Router } from 'express';
import { createMatiere, getMatieres } from '../controllers/matiere.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';
const router = Router();
router.post('/', protect, restrictTo('admin'), createMatiere);
router.get('/', protect, restrictTo('admin'), getMatieres);
export default router;