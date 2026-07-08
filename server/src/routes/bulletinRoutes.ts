import { Router } from 'express';
import { calculerBulletinsClasse, getDetailBulletin, getBulletinComplet } from '../controllers/bulletin.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/classe', protect, restrictTo('ADMIN_PRINCIPAL'), calculerBulletinsClasse);
router.get('/details', protect, getDetailBulletin);
router.get('/complet', protect, getBulletinComplet);
export default router;
