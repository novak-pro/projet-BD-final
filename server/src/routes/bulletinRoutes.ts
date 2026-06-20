import { Router } from 'express';
import { calculerBulletinsClasse } from '../controllers/bulletin.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/classe', protect, restrictTo('ADMIN_PRINCIPAL'), calculerBulletinsClasse);
export default router;