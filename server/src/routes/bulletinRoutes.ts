import { Router } from 'express';
import { calculerBulletinsClasse } from '../controllers/bulletin.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/classe', protect, restrictTo('admin'), calculerBulletinsClasse);
export default router;