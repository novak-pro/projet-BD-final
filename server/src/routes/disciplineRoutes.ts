import { Router } from 'express';
import { rapporterIncident } from '../controllers/discipline.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/incident', protect, restrictTo('PARENT'), rapporterIncident);
export default router;