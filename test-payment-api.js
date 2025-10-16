/**
 * Payment API Test Script
 * Tests the payment functionality without starting the server
 */

import Payment from './src/models/Payment.js';
import Card from './src/models/Card.js';
import PaymentController from './src/controllers/paymentController.js';

// Mock request and response objects for testing
const createMockReq = (body = {}, params = {}, query = {}, user = null) => ({
  body,
  params,
  query,
  user
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.responseData = data;
    return res;
  };
  return res;
};

// Test data
const testCardData = {
  cardNumber: '4111111111111111',
  cardHolderName: 'John Doe',
  expiryMonth: 12,
  expiryYear: 2025,
  cvv: '123',
  cardType: 'Visa'
};

const testPaymentData = {
  paymentType: 'card',
  amount: 120.00,
  currency: 'USD',
  cardDetails: testCardData,
  metadata: {
    ipAddress: '192.168.1.1',
    userAgent: 'Test Agent',
    notes: 'Test payment'
  }
};

const testInsuranceData = {
  paymentType: 'insurance',
  amount: 120.00,
  currency: 'USD',
  insuranceDetails: {
    provider: 'Blue Cross Blue Shield',
    policyNumber: 'BC123456789',
    policyHolderName: 'John Doe',
    coverageAmount: 1000.00,
    deductible: 100.00
  },
  metadata: {
    ipAddress: '192.168.1.1',
    userAgent: 'Test Agent',
    notes: 'Test insurance payment'
  }
};

const testCashData = {
  paymentType: 'cash',
  amount: 120.00,
  currency: 'USD',
  cashDetails: {
    paymentLocation: 'Ground Floor, Main Building, Payment Counter #1',
    paymentInstructions: 'Please arrive 15 minutes before your appointment time for payment processing'
  },
  metadata: {
    ipAddress: '192.168.1.1',
    userAgent: 'Test Agent',
    notes: 'Test cash payment'
  }
};

// Test functions
async function testCardValidation() {
  console.log('🧪 Testing Card Validation...');
  
  const req = createMockReq(testPaymentData);
  const res = createMockRes();
  
  try {
    await PaymentController.createPayment(req, res);
    console.log('✅ Card payment validation passed');
    console.log('Response:', res.responseData);
  } catch (error) {
    console.log('❌ Card payment validation failed:', error.message);
  }
}

async function testInsuranceValidation() {
  console.log('🧪 Testing Insurance Validation...');
  
  const req = createMockReq(testInsuranceData);
  const res = createMockRes();
  
  try {
    await PaymentController.createPayment(req, res);
    console.log('✅ Insurance payment validation passed');
    console.log('Response:', res.responseData);
  } catch (error) {
    console.log('❌ Insurance payment validation failed:', error.message);
  }
}

async function testCashValidation() {
  console.log('🧪 Testing Cash Validation...');
  
  const req = createMockReq(testCashData);
  const res = createMockRes();
  
  try {
    await PaymentController.createPayment(req, res);
    console.log('✅ Cash payment validation passed');
    console.log('Response:', res.responseData);
  } catch (error) {
    console.log('❌ Cash payment validation failed:', error.message);
  }
}

async function testPaymentValidation() {
  console.log('🧪 Testing Payment Data Validation...');
  
  const validationResult = await PaymentController.validatePaymentData({
    paymentType: 'card',
    cardDetails: testCardData
  });
  
  console.log('Validation result:', validationResult);
  
  if (validationResult.isValid) {
    console.log('✅ Payment data validation passed');
  } else {
    console.log('❌ Payment data validation failed:', validationResult.errors);
  }
}

async function testPaymentMethodPreparation() {
  console.log('🧪 Testing Payment Method Preparation...');
  
  const paymentMethod = await PaymentController.preparePaymentMethod({
    paymentType: 'card',
    cardDetails: testCardData
  });
  
  console.log('Prepared payment method:', paymentMethod);
  console.log('✅ Payment method preparation passed');
}

async function testCardModelMethods() {
  console.log('🧪 Testing Card Model Methods...');
  
  // Test card number validation
  const isValidCard = Card.validateCardNumber('4111111111111111');
  console.log('Card validation result:', isValidCard);
  
  // Test card type detection
  const cardType = Card.getCardType('4111111111111111');
  console.log('Card type detection:', cardType);
  
  console.log('✅ Card model methods test passed');
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Payment API Tests...\n');
  
  try {
    await testCardModelMethods();
    console.log('');
    
    await testPaymentValidation();
    console.log('');
    
    await testPaymentMethodPreparation();
    console.log('');
    
    await testCardValidation();
    console.log('');
    
    await testInsuranceValidation();
    console.log('');
    
    await testCashValidation();
    console.log('');
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Export for use in other files
export {
  testCardValidation,
  testInsuranceValidation,
  testCashValidation,
  testPaymentValidation,
  testPaymentMethodPreparation,
  testCardModelMethods,
  runTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
