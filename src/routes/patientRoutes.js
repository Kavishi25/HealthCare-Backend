import { Router } from 'express';
import { getAllPatients } from '../controllers/patientController.js';

const router = Router();

router.get('/', getAllPatients); // handles GET /api/patients

export default router;
