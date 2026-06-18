import { Router } from 'express';
import { getAllPersonnel, affecterEnseignant } from '../controllers/personnel.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/', protect, restrictTo('admin'), getAllPersonnel);
router.post('/affecter', protect, restrictTo('admin'), affecterEnseignant);
export default router;