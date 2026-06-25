import { Router } from 'express';
import {
  sendAnnouncement,
  sendPersonalMessage,
  sendTeacherMessage,
  moderateMessage,
  getMessages,
  getParentsList,
} from '../controllers/messageController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getMessages);
router.get('/parents', restrictTo('ADMIN_PRINCIPAL'), getParentsList);

router.post('/announcement', restrictTo('ADMIN_PRINCIPAL'), sendAnnouncement);
router.post('/personal', restrictTo('ADMIN_PRINCIPAL'), sendPersonalMessage);
router.post('/teacher', restrictTo('PERSONNEL'), sendTeacherMessage);

router.patch('/:id/moderate', restrictTo('ADMIN_PRINCIPAL'), moderateMessage);

export default router;
