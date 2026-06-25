import { Router } from 'express';
import { getMesCours, getCoursDetail, getMesEleves } from '../controllers/cours.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

router.get('/mes-cours', protect, restrictTo('PERSONNEL'), getMesCours);
router.get('/mes-eleves', protect, restrictTo('PERSONNEL'), getMesEleves);
router.get('/:id', protect, restrictTo('PERSONNEL'), getCoursDetail);

export default router;
