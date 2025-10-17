import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional for guest/anonymous card management
  },
  cardNumber: {
    type: String,
    required: [true, 'Card number is required'],
    // Store the masked version (last 4 digits with asterisks)
    // Validation is handled in the controller before saving
  },
  cardHolderName: {
    type: String,
    required: [true, 'Card holder name is required'],
    trim: true,
    minlength: [2, 'Card holder name must be at least 2 characters'],
    maxlength: [50, 'Card holder name cannot exceed 50 characters']
  },
  expiryMonth: {
    type: Number,
    required: [true, 'Expiry month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  expiryYear: {
    type: Number,
    required: [true, 'Expiry year is required'],
    min: [new Date().getFullYear(), 'Card has expired'],
    max: [new Date().getFullYear() + 20, 'Expiry year cannot be more than 20 years in the future']
  },
  cvv: {
    type: String,
    required: [true, 'CVV is required'],
    validate: {
      validator: function(v) {
        return /^\d{3,4}$/.test(v);
      },
      message: 'CVV must be 3 or 4 digits'
    }
  },
  cardType: {
    type: String,
    enum: ['Visa', 'MasterCard', 'American Express', 'Discover', 'Other'],
    required: [true, 'Card type is required']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      // Never return the full card number in JSON responses
      // CVV can be returned for payment form auto-fill
      return ret;
    }
  }
});

// Index for efficient queries
cardSchema.index({ userId: 1, isActive: 1 });
cardSchema.index({ userId: 1, isDefault: 1 });

// Pre-save middleware to ensure only one default card per user (if userId exists)
cardSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault') && this.userId) {
    // Unset other default cards for this user
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Virtual for checking if card is expired
cardSchema.virtual('isExpired').get(function() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  return this.expiryYear < currentYear || 
         (this.expiryYear === currentYear && this.expiryMonth < currentMonth);
});

// Instance method to get masked card number for display
cardSchema.methods.getMaskedCardNumber = function() {
  // Since we're already storing the masked version, just return it
  return this.cardNumber;
};

// Static method to validate card number using Luhn algorithm
cardSchema.statics.validateCardNumber = function(cardNumber) {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Static method to determine card type
cardSchema.statics.getCardType = function(cardNumber) {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  if (/^4/.test(cleanNumber)) return 'Visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'MasterCard';
  if (/^3[47]/.test(cleanNumber)) return 'American Express';
  if (/^6/.test(cleanNumber)) return 'Discover';
  
  return 'Other';
};

export default mongoose.model('Card', cardSchema);
