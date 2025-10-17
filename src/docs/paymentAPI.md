# Payment API Documentation

## Overview
The Payment API provides comprehensive payment processing functionality for healthcare services, supporting three payment types: Card, Insurance, and Cash payments.

## Base URL
```
http://localhost:5000/api/payments
```

## Authentication
All endpoints support optional user authentication. If no user is authenticated, payments can still be processed for guest users.

## Payment Types

### 1. Card Payment
- Uses existing saved cards or new card details
- Supports Visa, MasterCard, American Express, Discover
- Validates card numbers using Luhn algorithm
- Masks sensitive information

### 2. Insurance Payment
- Requires insurance provider details
- Supports policy verification
- Handles insurance card photo uploads
- Manages coverage and deductible information

### 3. Cash Payment
- For payments made at hospital counter
- Provides payment location and instructions
- Tracks payment status until confirmed

## API Endpoints

### 1. Create Payment
**POST** `/api/payments`

Creates a new payment for any of the three payment types.

#### Request Body

**Card Payment:**
```json
{
  "paymentType": "card",
  "amount": 120.00,
  "currency": "USD",
  "appointmentId": "64a1b2c3d4e5f6789012345",
  "cardId": "64a1b2c3d4e5f6789012346",
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "notes": "Card payment for consultation"
  }
}
```

**Card Payment with New Card Details:**
```json
{
  "paymentType": "card",
  "amount": 120.00,
  "currency": "USD",
  "appointmentId": "64a1b2c3d4e5f6789012345",
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "cardHolderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  },
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "notes": "New card payment"
  }
}
```

**Insurance Payment:**
```json
{
  "paymentType": "insurance",
  "amount": 120.00,
  "currency": "USD",
  "appointmentId": "64a1b2c3d4e5f6789012345",
  "insuranceDetails": {
    "provider": "Blue Cross Blue Shield",
    "policyNumber": "BC123456789",
    "policyHolderName": "John Doe",
    "insuranceCardPhoto": "https://example.com/insurance-card.jpg",
    "coverageAmount": 1000.00,
    "deductible": 100.00
  },
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "notes": "Insurance payment"
  }
}
```

**Cash Payment:**
```json
{
  "paymentType": "cash",
  "amount": 120.00,
  "currency": "USD",
  "appointmentId": "64a1b2c3d4e5f6789012345",
  "cashDetails": {
    "paymentLocation": "Ground Floor, Main Building, Payment Counter #1",
    "paymentInstructions": "Please arrive 15 minutes before your appointment time for payment processing"
  },
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "notes": "Cash payment at counter"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "64a1b2c3d4e5f6789012347",
    "transactionId": "PAY_1K2J3L4M5N6O7P8Q9R0S",
    "paymentType": "card",
    "amount": 120.00,
    "currency": "USD",
    "status": "completed",
    "paymentMethodSummary": "Visa ending in 1111",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get User Payments
**GET** `/api/payments`

Retrieves all payments for a user with optional filtering and pagination.

#### Query Parameters
- `userId` (optional): User ID to filter payments
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `paymentType` (optional): Filter by payment type (card, insurance, cash)
- `status` (optional): Filter by status (pending, processing, completed, failed, cancelled, refunded)
- `startDate` (optional): Filter payments from this date
- `endDate` (optional): Filter payments until this date
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc, default: desc)

#### Example Request
```
GET /api/payments?userId=64a1b2c3d4e5f6789012345&paymentType=card&status=completed&page=1&limit=10
```

#### Response
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "64a1b2c3d4e5f6789012347",
        "transactionId": "PAY_1K2J3L4M5N6O7P8Q9R0S",
        "paymentType": "card",
        "amount": 120.00,
        "currency": "USD",
        "status": "completed",
        "paymentMethod": {
          "cardId": "64a1b2c3d4e5f6789012346",
          "cardDetails": {
            "lastFourDigits": "1111",
            "cardType": "Visa",
            "cardHolderName": "John Doe"
          }
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "paidAt": "2024-01-15T10:30:05.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1
    }
  }
}
```

### 3. Get Payment by ID
**GET** `/api/payments/:paymentId`

Retrieves a specific payment by its ID.

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012347",
    "transactionId": "PAY_1K2J3L4M5N6O7P8Q9R0S",
    "userId": "64a1b2c3d4e5f6789012345",
    "paymentType": "card",
    "amount": 120.00,
    "currency": "USD",
    "status": "completed",
    "appointmentId": {
      "_id": "64a1b2c3d4e5f6789012345",
      "doctorName": "Dr. Sarah Johnson",
      "appointmentDate": "2024-01-20T10:00:00.000Z"
    },
    "paymentMethod": {
      "cardId": "64a1b2c3d4e5f6789012346",
      "cardDetails": {
        "lastFourDigits": "1111",
        "cardType": "Visa",
        "cardHolderName": "John Doe"
      }
    },
    "processingFee": 0,
    "taxAmount": 0,
    "discountAmount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "paidAt": "2024-01-15T10:30:05.000Z"
  }
}
```

### 4. Get Payment by Transaction ID
**GET** `/api/payments/transaction/:transactionId`

Retrieves a payment by its transaction ID.

#### Example Request
```
GET /api/payments/transaction/PAY_1K2J3L4M5N6O7P8Q9R0S
```

#### Response
Same as Get Payment by ID.

### 5. Get Payment Statistics
**GET** `/api/payments/stats`

Retrieves payment statistics for a user or overall system.

#### Query Parameters
- `userId` (optional): User ID to get stats for specific user
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPayments": 25,
      "totalAmount": 3000.00,
      "completedPayments": 23,
      "completedAmount": 2760.00,
      "failedPayments": 2,
      "pendingPayments": 0
    },
    "byType": [
      {
        "_id": "card",
        "count": 15,
        "totalAmount": 1800.00,
        "completedCount": 14,
        "completedAmount": 1680.00
      },
      {
        "_id": "insurance",
        "count": 8,
        "totalAmount": 960.00,
        "completedCount": 8,
        "completedAmount": 960.00
      },
      {
        "_id": "cash",
        "count": 2,
        "totalAmount": 240.00,
        "completedCount": 1,
        "completedAmount": 120.00
      }
    ]
  }
}
```

### 6. Update Payment Status
**PATCH** `/api/payments/:paymentId/status`

Updates the status of a payment (typically used by payment processors).

#### Request Body
```json
{
  "status": "completed",
  "externalTransactionId": "TXN_123456789",
  "errorDetails": {
    "code": "SUCCESS",
    "message": "Payment processed successfully"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "id": "64a1b2c3d4e5f6789012347",
    "transactionId": "PAY_1K2J3L4M5N6O7P8Q9R0S",
    "status": "completed",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

## Payment Statuses

- `pending`: Payment created but not yet processed
- `processing`: Payment is being processed
- `completed`: Payment successfully completed
- `failed`: Payment failed during processing
- `cancelled`: Payment was cancelled
- `refunded`: Payment was refunded

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Payment type is required",
    "Amount must be a positive number"
  ]
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Payment not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message (development only)"
}
```

## Security Features

1. **Card Data Protection**: Card numbers are masked and CVV is never stored
2. **Input Validation**: Comprehensive validation for all payment types
3. **Transaction IDs**: Unique transaction identifiers for tracking
4. **Error Handling**: Secure error messages without sensitive data exposure
5. **Optional Authentication**: Supports both authenticated and guest payments

## Integration Notes

1. **Card Payments**: Integrates with existing Card model for saved cards
2. **Insurance Verification**: Designed for integration with insurance verification services
3. **Cash Payments**: Tracks offline payments until confirmed at counter
4. **Appointment Integration**: Links payments to appointments and services
5. **Audit Trail**: Complete payment history with timestamps and metadata

## Testing

Use the following test data for development:

**Test Card Numbers:**
- Visa: 4111111111111111
- MasterCard: 5555555555554444
- American Express: 378282246310005

**Test CVV:** 123 (for all test cards)

**Test Expiry:** Any future month/year combination
