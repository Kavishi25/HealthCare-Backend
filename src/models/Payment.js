import mongoose from "mongoose";

/**
 * Payment Schema - Handles all payment types (Card, Insurance, Cash)
 * Following SOLID principles with single responsibility
 */
const paymentSchema = new mongoose.Schema({
  // Basic payment information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest payments
  },
  
  // Payment type: 'card', 'insurance', 'cash'
  paymentType: {
    type: String,
    enum: ['card', 'insurance', 'cash'],
    required: [true, 'Payment type is required']
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Amount information
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'LKR']
  },
  
  // Appointment/Service information
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  
  // Payment method specific data
  paymentMethod: {
    // For card payments
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: function() { return this.paymentType === 'card'; }
    },
    cardDetails: {
      lastFourDigits: String,
      cardType: String,
      cardHolderName: String
    },
    
    // For insurance payments
    insuranceDetails: {
      provider: {
        type: String,
        required: function() { return this.paymentType === 'insurance'; }
      },
      policyNumber: {
        type: String,
        required: function() { return this.paymentType === 'insurance'; }
      },
      policyHolderName: {
        type: String,
        required: function() { return this.paymentType === 'insurance'; }
      },
      coverageAmount: {
        type: Number,
        required: false
      },
      deductible: {
        type: Number,
        required: false
      }
    },
    
    // For cash payments
    cashDetails: {
      paymentLocation: {
        type: String,
        default: 'Ground Floor, Main Building, Payment Counter #1'
      },
      paymentInstructions: {
        type: String,
        default: 'Please arrive 15 minutes before your appointment time for payment processing'
      }
    }
  },
  
  // Transaction details
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  externalTransactionId: {
    type: String, // ID from payment gateway
    required: false
  },
  
  // Payment processing information
  processingFee: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  paidAt: {
    type: Date,
    required: false
  },
  processedAt: {
    type: Date,
    required: false
  },
  
  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    notes: String
  },
  
  // Error handling
  errorDetails: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      // Remove sensitive information from JSON output
      return ret;
    }
  }
});

// Indexes for efficient queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ paymentType: 1, status: 1 });
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paidAt: -1 });

// Pre-save middleware to generate transaction ID
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    // Generate unique transaction ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transactionId = `PAY_${timestamp}_${random}`.toUpperCase();
  }
  
  // Set paidAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  // Set processedAt when status changes to processing
  if (this.isModified('status') && this.status === 'processing' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  next();
});

// Virtual for total amount including fees and taxes
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + this.processingFee + this.taxAmount - this.discountAmount;
});

// Virtual for payment method summary
paymentSchema.virtual('paymentMethodSummary').get(function() {
  switch (this.paymentType) {
    case 'card':
      return `${this.paymentMethod.cardDetails.cardType} ending in ${this.paymentMethod.cardDetails.lastFourDigits}`;
    case 'insurance':
      return `${this.paymentMethod.insuranceDetails.provider} - ${this.paymentMethod.insuranceDetails.policyNumber}`;
    case 'cash':
      return 'Cash payment at counter';
    default:
      return 'Unknown payment method';
  }
});

// Instance method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

// Instance method to check if payment is pending
paymentSchema.methods.isPending = function() {
  return ['pending', 'processing'].includes(this.status);
};

// Instance method to check if payment failed
paymentSchema.methods.isFailed = function() {
  return ['failed', 'cancelled'].includes(this.status);
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(userId = null, dateRange = null) {
  const matchStage = {};
  
  if (userId) {
    matchStage.userId = new mongoose.Types.ObjectId(userId);
  }
  
  if (dateRange && dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $in: ['$status', ['failed', 'cancelled']] }, 1, 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $in: ['$status', ['pending', 'processing']] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    completedAmount: 0,
    failedPayments: 0,
    pendingPayments: 0
  };
};

// Static method to get payments by type
paymentSchema.statics.getPaymentsByType = async function(userId = null, limit = 10) {
  const matchStage = {};
  
  if (userId) {
    matchStage.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Check if model exists before creating it (fixes hot-reload issues)
export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
