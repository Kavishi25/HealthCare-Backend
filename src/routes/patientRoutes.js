import express from 'express';
import { registerPatient } from '../controllers/patientController.js';
const router = express.Router();

import { Router } from 'express';
import { getAllPatients } from '../controllers/patientController.js';

router.post("/register", registerPatient);



router.get('/', getAllPatients); // handles GET /api/patients

export default router;
