import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import {
  validatePaymentCreation,
  validatePaymentId,
  validatePaymentStatusUpdate
} from '../middleware/paymentValidation.js';
import {
  validateUserId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

/**
 * Payment Routes
 * Following RESTful conventions and proper middleware usage
 * Note: No edit/delete routes as per requirements
 */

// POST /api/payments - Create a new payment
router.post('/', 
  validatePaymentCreation,
  PaymentController.createPayment
);

// GET /api/payments - Get all payments for a user (or all payments if no userId)
router.get('/',
  validateUserId,
  validatePagination,
  PaymentController.getUserPayments
);

// GET /api/payments/stats - Get payment statistics
router.get('/stats',
  validateUserId,
  PaymentController.getPaymentStats
);

// GET /api/payments/transaction/:transactionId - Get payment by transaction ID
router.get('/transaction/:transactionId',
  validateUserId,
  PaymentController.getPaymentByTransactionId
);

// GET /api/payments/:paymentId - Get a specific payment by ID
router.get('/:paymentId',
  validatePaymentId,
  validateUserId,
  PaymentController.getPaymentById
);

// PATCH /api/payments/:paymentId/status - Update payment status (for processing)
router.patch('/:paymentId/status',
  validatePaymentId,
  validateUserId,
  validatePaymentStatusUpdate,
  PaymentController.updatePaymentStatus
);

export default router;
