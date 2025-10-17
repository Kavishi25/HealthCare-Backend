import Card from '../models/Card.js';

/**
 * Card Controller - Handles all card-related operations
 * Following SOLID principles with single responsibility
 */
class CardController {
  
  /**
   * Create a new card
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createCard(req, res) {
    try {
      const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, isDefault } = req.body;
      const userId = req.user?.id || req.body.userId; // Optional - can be null for guest cards

      // Basic card number validation - just check if it's numeric and reasonable length
      const cleanNumber = cardNumber.replace(/[\s-]/g, '');
      if (!/^\d{13,19}$/.test(cleanNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Card number must be between 13-19 digits'
        });
      }

      // Check if card already exists for this user (if userId provided)
      if (userId) {
        const lastFourDigits = cleanNumber.slice(-4);
        
        const existingCard = await Card.findOne({
          userId,
          cardNumber: { $regex: `.*${lastFourDigits}$` }, // Check if card ends with same last 4 digits
          isActive: true
        });

        if (existingCard) {
          return res.status(409).json({
            success: false,
            message: 'Card already exists for this user'
          });
        }
      }

      // Use provided card type or determine from card number
      const cardType = req.body.cardType || Card.getCardType(cardNumber);

      // Mask the card number for storage (keep only last 4 digits)
      const maskedCardNumber = cleanNumber.slice(-4).padStart(cleanNumber.length, '*');

      const cardData = {
        userId,
        cardNumber: maskedCardNumber, // Store masked version
        cardHolderName,
        expiryMonth,
        expiryYear,
        cvv,
        cardType,
        isDefault: isDefault || false
      };

      const card = new Card(cardData);
      await card.save();

      res.status(201).json({
        success: true,
        message: 'Card added successfully',
        data: {
          id: card._id,
          cardNumber: card.getMaskedCardNumber(),
          cardHolderName: card.cardHolderName,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          cardType: card.cardType,
          isDefault: card.isDefault,
          isActive: card.isActive
        }
      });

    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all cards for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserCards(req, res) {
    try {
      const userId = req.user?.id || req.params.userId || req.query.userId;
      const { page = 1, limit = 10, isActive } = req.query;

      // Build query - if no userId provided, get all cards (for guest/anonymous cards)
      const query = userId ? { userId } : {};
      
      // Handle isActive filter - default to true if not specified
      if (isActive === undefined) {
        query.isActive = true; // Default to active cards only
      } else {
        query.isActive = isActive === 'true';
      }

      const cards = await Card.find(query)
        .sort({ isDefault: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Card.countDocuments(query);

      // Map _id to id for consistency
      const mappedCards = cards.map(card => ({
        id: card._id,
        cardNumber: card.getMaskedCardNumber(),
        cardHolderName: card.cardHolderName,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        cvv: card.cvv, // Include CVV for payment form auto-fill
        cardType: card.cardType,
        isDefault: card.isDefault,
        isActive: card.isActive,
        lastUsed: card.lastUsed,
        isExpired: card.isExpired,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt
      }));

      res.json({
        success: true,
        data: {
          cards: mappedCards,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get a specific card by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCardById(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.user?.id || req.query.userId;

      // Build query - if userId provided, filter by user, otherwise get any card
      const query = { _id: cardId, isActive: true };
      if (userId) {
        query.userId = userId;
      }

      const card = await Card.findOne(query);

      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Card not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: card._id,
          cardNumber: card.getMaskedCardNumber(),
          cardHolderName: card.cardHolderName,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          cvv: card.cvv, // Include CVV for payment form auto-fill
          cardType: card.cardType,
          isDefault: card.isDefault,
          isActive: card.isActive,
          lastUsed: card.lastUsed,
          isExpired: card.isExpired
        }
      });

    } catch (error) {
      console.error('Error fetching card:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update a card
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateCard(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.user?.id || req.body.userId;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.cardNumber;
      delete updateData.cvv;

      // Build query - if userId provided, filter by user, otherwise get any card
      const query = { _id: cardId, isActive: true };
      if (userId) {
        query.userId = userId;
      }

      const card = await Card.findOne(query);

      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Card not found'
        });
      }

      // Update card data
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          card[key] = updateData[key];
        }
      });

      await card.save();

      res.json({
        success: true,
        message: 'Card updated successfully',
        data: {
          id: card._id,
          cardNumber: card.getMaskedCardNumber(),
          cardHolderName: card.cardHolderName,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          cardType: card.cardType,
          isDefault: card.isDefault,
          isActive: card.isActive
        }
      });

    } catch (error) {
      console.error('Error updating card:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Soft delete a card (mark as inactive)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteCard(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.user?.id || req.query.userId;

      // Build query - if userId provided, filter by user, otherwise get any card
      const query = { _id: cardId, isActive: true };
      if (userId) {
        query.userId = userId;
      }

      const card = await Card.findOne(query);

      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Card not found'
        });
      }

      // Soft delete - mark as inactive
      card.isActive = false;
      await card.save();

      res.json({
        success: true,
        message: 'Card deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting card:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Set a card as default
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async setDefaultCard(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.user?.id || req.body.userId;

      // Build query - if userId provided, filter by user, otherwise get any card
      const query = { _id: cardId, isActive: true };
      if (userId) {
        query.userId = userId;
      }

      const card = await Card.findOne(query);

      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Card not found'
        });
      }

      // Set this card as default (pre-save middleware will handle unsetting others)
      card.isDefault = true;
      await card.save();

      res.json({
        success: true,
        message: 'Default card updated successfully',
        data: {
          id: card._id,
          cardNumber: card.getMaskedCardNumber(),
          cardHolderName: card.cardHolderName,
          isDefault: card.isDefault
        }
      });

    } catch (error) {
      console.error('Error setting default card:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get default card for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDefaultCard(req, res) {
    try {
      const userId = req.user?.id || req.params.userId;

      // Build query - if userId provided, filter by user, otherwise get any default card
      const query = { isDefault: true, isActive: true };
      if (userId) {
        query.userId = userId;
      }

      const defaultCard = await Card.findOne(query);

      if (!defaultCard) {
        return res.status(404).json({
          success: false,
          message: 'No default card found'
        });
      }

      res.json({
        success: true,
        data: {
          id: defaultCard._id,
          cardNumber: defaultCard.getMaskedCardNumber(),
          cardHolderName: defaultCard.cardHolderName,
          expiryMonth: defaultCard.expiryMonth,
          expiryYear: defaultCard.expiryYear,
          cardType: defaultCard.cardType,
          isDefault: defaultCard.isDefault,
          isExpired: defaultCard.isExpired
        }
      });

    } catch (error) {
      console.error('Error fetching default card:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Validate card details without saving
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async validateCard(req, res) {
    try {
      const { cardNumber, expiryMonth, expiryYear, cvv } = req.body;

      const cleanNumber = cardNumber.replace(/[\s-]/g, '');
      const validation = {
        cardNumber: /^\d{13,19}$/.test(cleanNumber),
        expiryDate: expiryMonth >= 1 && expiryMonth <= 12 && 
                   expiryYear >= new Date().getFullYear() &&
                   expiryYear <= new Date().getFullYear() + 20,
        cvv: /^\d{3,4}$/.test(cvv),
        cardType: Card.getCardType(cardNumber)
      };

      const isValid = Object.values(validation).every(result => 
        typeof result === 'boolean' ? result : true
      );

      res.json({
        success: true,
        data: {
          isValid,
          validation,
          cardType: validation.cardType
        }
      });

    } catch (error) {
      console.error('Error validating card:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default CardController;
