// src/routes/reportRoutes.js
import { Router } from 'express';
import { getReports } from '../controllers/reportController.js';

const router = Router();

router.get('/', getReports); // GET /api/reports

export default router;