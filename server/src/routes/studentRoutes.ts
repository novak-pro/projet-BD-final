import { Router } from 'express';
import * as studentController from '../controllers/studentController';

const router = Router();

router.get('/', studentController.getAllStudents);
router.get('/:matricule', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:matricule', studentController.updateStudent);
router.delete('/:matricule', studentController.deleteStudent);
router.get('/class/:classroomId', studentController.getStudentsByClass);

export default router;
