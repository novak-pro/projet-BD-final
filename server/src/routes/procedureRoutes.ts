import { Router } from 'express';
import { getProcedure, updateProcedure } from '../controllers/procedureController';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getProcedure);
router.put('/', authenticateToken, isAdmin, updateProcedure);

export default router;
