import { Router } from 'express';
import { deposerEpreuve, getEpreuves } from '../controllers/epreuve.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('PERSONNEL'), deposerEpreuve);
router.get('/', protect, getEpreuves);
export default router;
