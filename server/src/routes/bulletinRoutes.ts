import { Router } from 'express';
import { calculerBulletinsClasse, getDetailBulletin } from '../controllers/bulletin.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/classe', protect, restrictTo('ADMIN_PRINCIPAL'), calculerBulletinsClasse);
router.get('/details', protect, restrictTo('ADMIN_PRINCIPAL'), getDetailBulletin);
export default router;
