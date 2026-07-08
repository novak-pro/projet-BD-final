import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { uploadStudentPhoto } from '../middlewares/uploadStudentPhotoMiddleware';

const router = Router();

router.get('/', protect, studentController.getAllStudents);
router.get('/with-frequente', protect, studentController.getStudentsWithFrequente);
router.get('/:matricule', protect, studentController.getStudentById);
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), studentController.createStudent);
router.put('/:matricule', protect, restrictTo('ADMIN_PRINCIPAL'), studentController.updateStudent);
router.delete('/:matricule', protect, restrictTo('ADMIN_PRINCIPAL'), studentController.deleteStudent);
router.get('/class/:classroomId', protect, studentController.getStudentsByClass);
router.put('/:matricule/photo', protect, restrictTo('ADMIN_PRINCIPAL'), uploadStudentPhoto, studentController.uploadAdminPhoto);

export default router;
