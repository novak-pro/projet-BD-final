import { Router } from 'express';
import { enregistrerNotesGroupees } from '../controllers/note.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/bulk', protect, restrictTo('professeur'), enregistrerNotesGroupees);
export default router;
