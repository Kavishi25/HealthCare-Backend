/**
 * Validation middleware for card operations
 * Following single responsibility principle
 */

/**
 * Validates card creation data
 */
export const validateCardCreation = (req, res, next) => {
  const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv } = req.body;
  const errors = [];

  // Card number validation - basic format check only
  if (!cardNumber) {
    errors.push('Card number is required');
  } else {
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      errors.push('Card number must be between 13-19 digits');
    }
  }

  // Card holder name validation
  if (!cardHolderName) {
    errors.push('Card holder name is required');
  } else if (cardHolderName.trim().length < 2) {
    errors.push('Card holder name must be at least 2 characters');
  } else if (cardHolderName.trim().length > 50) {
    errors.push('Card holder name cannot exceed 50 characters');
  }

  // Expiry month validation
  if (!expiryMonth) {
    errors.push('Expiry month is required');
  } else if (expiryMonth < 1 || expiryMonth > 12) {
    errors.push('Expiry month must be between 1 and 12');
  }

  // Expiry year validation
  if (!expiryYear) {
    errors.push('Expiry year is required');
  } else {
    const currentYear = new Date().getFullYear();
    if (expiryYear < currentYear) {
      errors.push('Card has expired');
    } else if (expiryYear > currentYear + 20) {
      errors.push('Expiry year cannot be more than 20 years in the future');
    }
  }

  // CVV validation
  if (!cvv) {
    errors.push('CVV is required');
  } else if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('CVV must be 3 or 4 digits');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validates card update data
 */
export const validateCardUpdate = (req, res, next) => {
  const { cardHolderName, expiryMonth, expiryYear, isDefault } = req.body;
  const errors = [];

  // Card holder name validation (if provided)
  if (cardHolderName !== undefined) {
    if (!cardHolderName || cardHolderName.trim().length < 2) {
      errors.push('Card holder name must be at least 2 characters');
    } else if (cardHolderName.trim().length > 50) {
      errors.push('Card holder name cannot exceed 50 characters');
    }
  }

  // Expiry month validation (if provided)
  if (expiryMonth !== undefined) {
    if (expiryMonth < 1 || expiryMonth > 12) {
      errors.push('Expiry month must be between 1 and 12');
    }
  }

  // Expiry year validation (if provided)
  if (expiryYear !== undefined) {
    const currentYear = new Date().getFullYear();
    if (expiryYear < currentYear) {
      errors.push('Card has expired');
    } else if (expiryYear > currentYear + 20) {
      errors.push('Expiry year cannot be more than 20 years in the future');
    }
  }

  // isDefault validation (if provided)
  if (isDefault !== undefined && typeof isDefault !== 'boolean') {
    errors.push('isDefault must be a boolean value');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validates card ID parameter
 */
export const validateCardId = (req, res, next) => {
  const { cardId } = req.params;

  if (!cardId) {
    return res.status(400).json({
      success: false,
      message: 'Card ID is required'
    });
  }

  // Check if cardId is a valid MongoDB ObjectId
  if (!/^[0-9a-fA-F]{24}$/.test(cardId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid card ID format'
    });
  }

  next();
};

/**
 * Validates user ID parameter (optional)
 */
export const validateUserId = (req, res, next) => {
  const userId = req.user?.id || req.params.userId || req.query.userId;

  // If userId is provided, validate its format
  if (userId && !/^[0-9a-fA-F]{24}$/.test(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }

  next();
};

/**
 * Validates pagination parameters
 */
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }

  next();
};

/**
 * Validates card validation request
 */
export const validateCardValidation = (req, res, next) => {
  const { cardNumber, expiryMonth, expiryYear, cvv } = req.body;
  const errors = [];

  if (!cardNumber) {
    errors.push('Card number is required for validation');
  }

  if (!expiryMonth) {
    errors.push('Expiry month is required for validation');
  }

  if (!expiryYear) {
    errors.push('Expiry year is required for validation');
  }

  if (!cvv) {
    errors.push('CVV is required for validation');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};
