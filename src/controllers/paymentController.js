import Payment from '../models/Payment.js';
import Card from '../models/Card.js';

/**
 * Payment Controller - Handles all payment-related operations
 * Following SOLID principles with single responsibility
 * Note: No edit/delete operations as per requirements
 */
class PaymentController {
  
  /**
   * Create a new payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createPayment(req, res) {
    try {
      const {
        paymentType,
        amount,
        currency = 'USD',
        appointmentId,
        serviceId,
        cardId,
        cardDetails,
        insuranceDetails,
        cashDetails,
        metadata
      } = req.body;
      
      const userId = req.user?.id || req.body.userId;

      // Validate payment type specific requirements
      const validationResult = await PaymentController.validatePaymentData({
        paymentType,
        cardId,
        cardDetails,
        insuranceDetails,
        userId
      });

      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
          errors: validationResult.errors
        });
      }

      // Prepare payment method data based on type
      const paymentMethod = await PaymentController.preparePaymentMethod({
        paymentType,
        cardId,
        cardDetails,
        insuranceDetails,
        cashDetails,
        userId
      });

      const paymentData = {
        userId,
        paymentType,
        amount,
        currency,
        appointmentId,
        serviceId,
        paymentMethod,
        metadata
      };

      const payment = new Payment(paymentData);
      await payment.save();

      // Process payment based on type
      const processingResult = await PaymentController.processPayment(payment);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: {
          id: payment._id,
          transactionId: payment.transactionId,
          paymentType: payment.paymentType,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethodSummary: payment.paymentMethodSummary,
          createdAt: payment.createdAt
        }
      });

    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all payments for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserPayments(req, res) {
    try {
      const userId = req.user?.id || req.params.userId || req.query.userId;
      const { 
        page = 1, 
        limit = 10, 
        paymentType, 
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};
      if (userId) query.userId = userId;
      if (paymentType) query.paymentType = paymentType;
      if (status) query.status = status;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const payments = await Payment.find(query)
        .populate('appointmentId', 'doctorName appointmentDate')
        .populate('serviceId', 'serviceName')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get a specific payment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPaymentById(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user?.id || req.query.userId;

      const query = { _id: paymentId };
      if (userId) query.userId = userId;

      const payment = await Payment.findOne(query)
        .populate('appointmentId', 'doctorName appointmentDate')
        .populate('serviceId', 'serviceName')
        .populate('paymentMethod.cardId', 'cardNumber cardHolderName cardType');

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get payment by transaction ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPaymentByTransactionId(req, res) {
    try {
      const { transactionId } = req.params;
      const userId = req.user?.id || req.query.userId;

      const query = { transactionId };
      if (userId) query.userId = userId;

      const payment = await Payment.findOne(query)
        .populate('appointmentId', 'doctorName appointmentDate')
        .populate('serviceId', 'serviceName')
        .populate('paymentMethod.cardId', 'cardNumber cardHolderName cardType');

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Error fetching payment by transaction ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get payment statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPaymentStats(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;
      const { startDate, endDate } = req.query;

      const dateRange = (startDate || endDate) ? { start: startDate, end: endDate } : null;
      
      const stats = await Payment.getPaymentStats(userId, dateRange);
      const paymentsByType = await Payment.getPaymentsByType(userId, 10);

      res.json({
        success: true,
        data: {
          overview: stats,
          byType: paymentsByType
        }
      });

    } catch (error) {
      console.error('Error fetching payment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update payment status (for processing payments)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updatePaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const { status, externalTransactionId, errorDetails } = req.body;
      const userId = req.user?.id || req.query.userId;

      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }

      const query = { _id: paymentId };
      if (userId) query.userId = userId;

      const payment = await Payment.findOne(query);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Update payment status
      payment.status = status;
      if (externalTransactionId) payment.externalTransactionId = externalTransactionId;
      if (errorDetails) payment.errorDetails = errorDetails;

      await payment.save();

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          id: payment._id,
          transactionId: payment.transactionId,
          status: payment.status,
          updatedAt: payment.updatedAt
        }
      });

    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Validate payment data based on payment type
   * @param {Object} data - Payment data to validate
   * @returns {Object} Validation result
   */
  static async validatePaymentData({ paymentType, cardId, cardDetails, insuranceDetails, userId }) {
    const errors = [];

    switch (paymentType) {
      case 'card':
        if (!cardId && !cardDetails) {
          errors.push('Card ID or card details are required for card payments');
        }
        
        if (cardId) {
          const card = await Card.findOne({ _id: cardId, isActive: true });
          if (!card) {
            errors.push('Invalid or inactive card');
          } else if (card.isExpired) {
            errors.push('Card has expired');
          }
        }
        
        if (cardDetails) {
          if (!cardDetails.cardNumber || !cardDetails.cardHolderName || 
              !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
            errors.push('All card details are required');
          }
          
          if (cardDetails.cardNumber) {
            const cleanNumber = cardDetails.cardNumber.replace(/[\s-]/g, '');
            if (!/^\d{13,19}$/.test(cleanNumber)) {
              errors.push('Card number must be between 13-19 digits');
            }
          }
        }
        break;

      case 'insurance':
        if (!insuranceDetails) {
          errors.push('Insurance details are required for insurance payments');
        } else {
          if (!insuranceDetails.provider) errors.push('Insurance provider is required');
          if (!insuranceDetails.policyNumber) errors.push('Policy number is required');
          if (!insuranceDetails.policyHolderName) errors.push('Policy holder name is required');
        }
        break;

      case 'cash':
        // Cash payments don't require additional validation
        break;

      default:
        errors.push('Invalid payment type');
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? 'Validation failed' : 'Validation successful',
      errors
    };
  }

  /**
   * Prepare payment method data based on payment type
   * @param {Object} data - Payment method data
   * @returns {Object} Prepared payment method
   */
  static async preparePaymentMethod({ paymentType, cardId, cardDetails, insuranceDetails, cashDetails }) {
    const paymentMethod = {};

    switch (paymentType) {
      case 'card':
        if (cardId) {
          const card = await Card.findById(cardId);
          paymentMethod.cardId = cardId;
          paymentMethod.cardDetails = {
            lastFourDigits: card.cardNumber.slice(-4),
            cardType: card.cardType,
            cardHolderName: card.cardHolderName
          };
        } else if (cardDetails) {
          paymentMethod.cardDetails = {
            lastFourDigits: cardDetails.cardNumber.slice(-4),
            cardType: Card.getCardType(cardDetails.cardNumber),
            cardHolderName: cardDetails.cardHolderName
          };
        }
        break;

      case 'insurance':
        paymentMethod.insuranceDetails = {
          provider: insuranceDetails.provider,
          policyNumber: insuranceDetails.policyNumber,
          policyHolderName: insuranceDetails.policyHolderName,
          coverageAmount: insuranceDetails.coverageAmount,
          deductible: insuranceDetails.deductible
        };
        break;

      case 'cash':
        paymentMethod.cashDetails = {
          paymentLocation: cashDetails?.paymentLocation || 'Ground Floor, Main Building, Payment Counter #1',
          paymentInstructions: cashDetails?.paymentInstructions || 'Please arrive 15 minutes before your appointment time for payment processing'
        };
        break;
    }

    return paymentMethod;
  }

  /**
   * Process payment based on type
   * @param {Object} payment - Payment object
   * @returns {Object} Processing result
   */
  static async processPayment(payment) {
    try {
      // Update status to processing
      payment.status = 'processing';
      await payment.save();

      // Simulate payment processing based on type
      switch (payment.paymentType) {
        case 'card':
          // Simulate card payment processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          payment.status = 'completed';
          payment.paidAt = new Date();
          break;

        case 'insurance':
          // Simulate insurance verification
          await new Promise(resolve => setTimeout(resolve, 2000));
          payment.status = 'completed';
          payment.paidAt = new Date();
          break;

        case 'cash':
          // Cash payments are marked as pending until confirmed at counter
          payment.status = 'pending';
          break;
      }

      await payment.save();

      return {
        success: true,
        status: payment.status,
        message: 'Payment processed successfully'
      };

    } catch (error) {
      payment.status = 'failed';
      payment.errorDetails = {
        code: 'PROCESSING_ERROR',
        message: error.message
      };
      await payment.save();

      return {
        success: false,
        status: payment.status,
        message: 'Payment processing failed'
      };
    }
  }
}

export default PaymentController;
