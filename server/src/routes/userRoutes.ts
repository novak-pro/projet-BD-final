import { Router } from 'express';
import { getDeactivatedAccounts, reactivateAccount, deactivateAccount } from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect, restrictTo('ADMIN_PRINCIPAL'));

router.get('/deactivated', getDeactivatedAccounts);
router.post('/reactivate', reactivateAccount);
router.post('/deactivate', deactivateAccount);

export default router;
