/**
 * Payment Validation Middleware
 * Following single responsibility principle
 */

/**
 * Validates payment creation data
 */
export const validatePaymentCreation = (req, res, next) => {
  const { paymentType, amount, currency, cardId, cardDetails, insuranceDetails } = req.body;
  const errors = [];

  // Payment type validation
  if (!paymentType) {
    errors.push('Payment type is required');
  } else if (!['card', 'insurance', 'cash'].includes(paymentType)) {
    errors.push('Payment type must be one of: card, insurance, cash');
  }

  // Amount validation
  if (!amount) {
    errors.push('Payment amount is required');
  } else if (isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push('Payment amount must be a positive number');
  }

  // Currency validation (optional)
  if (currency && !['USD', 'EUR', 'GBP', 'INR'].includes(currency)) {
    errors.push('Currency must be one of: USD, EUR, GBP, INR');
  }

  // Payment type specific validation
  if (paymentType === 'card') {
    if (!cardId && !cardDetails) {
      errors.push('Either cardId or cardDetails is required for card payments');
    }
    
    if (cardDetails) {
      const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv } = cardDetails;
      
      if (!cardNumber) {
        errors.push('Card number is required');
      } else {
        const cleanNumber = cardNumber.replace(/[\s-]/g, '');
        if (!/^\d{13,19}$/.test(cleanNumber)) {
          errors.push('Card number must be between 13-19 digits');
        }
      }
      
      if (!cardHolderName || cardHolderName.trim().length < 2) {
        errors.push('Card holder name must be at least 2 characters');
      }
      
      if (!expiryMonth || expiryMonth < 1 || expiryMonth > 12) {
        errors.push('Expiry month must be between 1 and 12');
      }
      
      if (!expiryYear) {
        errors.push('Expiry year is required');
      } else {
        const currentYear = new Date().getFullYear();
        if (expiryYear < currentYear) {
          errors.push('Card has expired');
        }
      }
      
      if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        errors.push('CVV must be 3 or 4 digits');
      }
    }
  }

  if (paymentType === 'insurance') {
    if (!insuranceDetails) {
      errors.push('Insurance details are required for insurance payments');
    } else {
      const { provider, policyNumber, policyHolderName } = insuranceDetails;
      
      if (!provider || provider.trim().length < 2) {
        errors.push('Insurance provider is required');
      }
      
      if (!policyNumber || policyNumber.trim().length < 3) {
        errors.push('Policy number is required');
      }
      
      if (!policyHolderName || policyHolderName.trim().length < 2) {
        errors.push('Policy holder name is required');
      }
    }
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
 * Validates payment ID parameter
 */
export const validatePaymentId = (req, res, next) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    return res.status(400).json({
      success: false,
      message: 'Payment ID is required'
    });
  }

  // Check if paymentId is a valid MongoDB ObjectId
  if (!/^[0-9a-fA-F]{24}$/.test(paymentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment ID format'
    });
  }

  next();
};

/**
 * Validates payment status update
 */
export const validatePaymentStatusUpdate = (req, res, next) => {
  const { status, externalTransactionId, errorDetails } = req.body;
  const errors = [];

  if (!status) {
    errors.push('Status is required');
  } else if (!['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'].includes(status)) {
    errors.push('Status must be one of: pending, processing, completed, failed, cancelled, refunded');
  }

  if (externalTransactionId && typeof externalTransactionId !== 'string') {
    errors.push('External transaction ID must be a string');
  }

  if (errorDetails && typeof errorDetails !== 'object') {
    errors.push('Error details must be an object');
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
