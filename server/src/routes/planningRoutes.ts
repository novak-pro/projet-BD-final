import { Router } from 'express';
import { createPlanning, getPlanningByClasse } from '../controllers/planning.controller';
import { protect, restrictTo} from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('admin'), createPlanning);
router.get('/classe/:idClasse', protect, restrictTo('admin'), getPlanningByClasse);
export default router;
