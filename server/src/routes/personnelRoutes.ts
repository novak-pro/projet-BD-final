import { Router } from 'express';
import { getAllPersonnel, affecterEnseignant } from '../controllers/personnel.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/', protect, restrictTo('ADMIN_PRINCIPAL'), getAllPersonnel);
router.post('/affecter', protect, restrictTo('ADMIN_PRINCIPAL'), affecterEnseignant);
export default router;