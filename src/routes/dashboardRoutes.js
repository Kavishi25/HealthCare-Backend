// src/routes/dashboardRoutes.js
import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = Router();

router.get('/', getDashboardStats); // GET /api/dashboard

export default router;