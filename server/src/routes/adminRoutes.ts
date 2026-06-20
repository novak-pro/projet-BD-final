import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';

import { getPendingUsers, handleUserValidation, getStats } from '../controllers/adminController';
import { createSalle, getAllSalles, updateEtatSalle } from '../controllers/salle.controller';
import { createMatiere, getMatieres } from '../controllers/matiere.controller';
import { getAllPersonnel, affecterEnseignant } from '../controllers/personnel.controller';

const router = Router();

// Toutes les routes admin nécessitent d'être connecté + être ADMIN_PRINCIPAL
router.use(protect, restrictTo('ADMIN_PRINCIPAL'));

// --- Stats Dashboard ---
router.get('/stats', getStats);

// --- Validation des comptes ---
router.get('/pending', getPendingUsers);
router.post('/validate', handleUserValidation);

// --- Salles ---
router.post('/salles', createSalle);
router.get('/salles', getAllSalles);
router.patch('/salles/:id/etat', updateEtatSalle);

// --- Matières ---
router.post('/matieres', createMatiere);
router.get('/matieres', getMatieres);

// --- Personnel ---
router.get('/personnel', getAllPersonnel);
router.post('/personnel/affecter', affecterEnseignant);

export default router;