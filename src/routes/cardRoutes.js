import express from 'express';
import CardController from '../controllers/cardController.js';
import {
  validateCardCreation,
  validateCardUpdate,
  validateCardId,
  validateUserId,
  validatePagination,
  validateCardValidation
} from '../middleware/validation.js';

const router = express.Router();

/**
 * Card Routes
 * Following RESTful conventions and proper middleware usage
 */

// POST /api/cards - Create a new card
router.post('/', 
  validateCardCreation,
  CardController.createCard
);

// GET /api/cards - Get all cards for a user (or all cards if no userId)
router.get('/',
  validateUserId,
  validatePagination,
  CardController.getUserCards
);

// GET /api/cards/default - Get default card for a user (or any default card if no userId)
router.get('/default',
  validateUserId,
  CardController.getDefaultCard
);

// GET /api/cards/validate - Validate card details without saving
router.post('/validate',
  validateCardValidation,
  CardController.validateCard
);

// GET /api/cards/:cardId - Get a specific card by ID (with optional userId filter)
router.get('/:cardId',
  validateCardId,
  validateUserId,
  CardController.getCardById
);

// PUT /api/cards/:cardId - Update a specific card (with optional userId filter)
router.put('/:cardId',
  validateCardId,
  validateUserId,
  validateCardUpdate,
  CardController.updateCard
);

// PATCH /api/cards/:cardId/default - Set a card as default (with optional userId filter)
router.patch('/:cardId/default',
  validateCardId,
  validateUserId,
  CardController.setDefaultCard
);

// DELETE /api/cards/:cardId - Delete a specific card (soft delete, with optional userId filter)
router.delete('/:cardId',
  validateCardId,
  validateUserId,
  CardController.deleteCard
);

export default router;
