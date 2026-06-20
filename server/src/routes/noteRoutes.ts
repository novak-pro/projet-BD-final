import { Router } from 'express';
import { enregistrerNotesGroupees, getNotesByEleve } from '../controllers/note.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/eleve/:eleveId', protect, getNotesByEleve);
router.post('/bulk', protect, restrictTo('PERSONNEL'), enregistrerNotesGroupees);
export default router;
