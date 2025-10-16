# Card Management API Documentation

## Overview
This API provides comprehensive CRUD operations for managing bank card details with security best practices and data validation.

## Base URL
```
/api/cards
```

## Authentication
User authentication is **optional**. The user ID can be provided through:
- `req.user.id` (from authentication middleware)
- `userId` in request body/query parameters

**Note**: If no `userId` is provided, the system will work with anonymous/guest cards.

## Endpoints

### 1. Create Card
**POST** `/api/cards`

Creates a new bank card for a user.

**Request Body:**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0", // Optional - omit for guest cards
  "cardNumber": "4111111111111111",
  "cardHolderName": "John Doe",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Card added successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "cardNumber": "************1111",
    "cardHolderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cardType": "Visa",
    "isDefault": false,
    "isActive": true
  }
}
```

### 2. Get User Cards
**GET** `/api/cards?userId=USER_ID&page=1&limit=10&isActive=true`

Retrieves all cards for a specific user with pagination. If no `userId` is provided, returns all cards.

**Query Parameters:**
- `userId` (optional): User ID - omit for guest/anonymous cards
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `isActive` (optional): Filter by active status (default: true)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "cardNumber": "************1111",
        "cardHolderName": "John Doe",
        "expiryMonth": 12,
        "expiryYear": 2025,
        "cardType": "Visa",
        "isDefault": true,
        "isActive": true,
        "lastUsed": "2024-01-15T10:30:00.000Z"
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

### 3. Get Card by ID
**GET** `/api/cards/:cardId?userId=USER_ID`

Retrieves a specific card by its ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "cardNumber": "************1111",
    "cardHolderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cardType": "Visa",
    "isDefault": true,
    "isActive": true,
    "lastUsed": "2024-01-15T10:30:00.000Z",
    "isExpired": false
  }
}
```

### 4. Update Card
**PUT** `/api/cards/:cardId`

Updates an existing card. Note: Card number and CVV cannot be updated for security reasons.

**Request Body:**
```json
{
  "cardHolderName": "John Smith",
  "expiryMonth": 6,
  "expiryYear": 2026,
  "isDefault": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Card updated successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "cardNumber": "************1111",
    "cardHolderName": "John Smith",
    "expiryMonth": 6,
    "expiryYear": 2026,
    "cardType": "Visa",
    "isDefault": true,
    "isActive": true
  }
}
```

### 5. Set Default Card
**PATCH** `/api/cards/:cardId/default`

Sets a specific card as the default card for the user.

**Response (200):**
```json
{
  "success": true,
  "message": "Default card updated successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "cardNumber": "************1111",
    "cardHolderName": "John Doe",
    "isDefault": true
  }
}
```

### 6. Get Default Card
**GET** `/api/cards/default?userId=USER_ID`

Retrieves the default card for a user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "cardNumber": "************1111",
    "cardHolderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cardType": "Visa",
    "isDefault": true,
    "isExpired": false
  }
}
```

### 7. Delete Card
**DELETE** `/api/cards/:cardId?userId=USER_ID`

Soft deletes a card (marks as inactive).

**Response (200):**
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

### 8. Validate Card
**POST** `/api/cards/validate`

Validates card details without saving them to the database.

**Request Body:**
```json
{
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "validation": {
      "cardNumber": true,
      "expiryDate": true,
      "cvv": true,
      "cardType": "Visa"
    },
    "cardType": "Visa"
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Card number must be between 13-19 digits",
    "Card holder name must be at least 2 characters"
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Card not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Card already exists"
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

1. **Card Number Masking**: Only last 4 digits are stored and returned
2. **CVV Exclusion**: CVV is never returned in API responses
3. **Soft Delete**: Cards are marked as inactive rather than permanently deleted
4. **Input Validation**: Comprehensive validation for all inputs
5. **Luhn Algorithm**: Card number validation using industry standard
6. **Single Default**: Only one card can be default per user

## Validation Rules

### Card Number
- Must be 13-19 digits
- Validated using Luhn algorithm
- Automatically detects card type (Visa, MasterCard, etc.)

### Card Holder Name
- Required, 2-50 characters
- Trimmed of whitespace

### Expiry Date
- Month: 1-12
- Year: Current year to 20 years in future
- Cannot be in the past

### CVV
- 3 or 4 digits
- Numeric only

## Usage Examples

### Creating a Card (with User ID)
```bash
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "cardNumber": "4111111111111111",
    "cardHolderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123",
    "isDefault": true
  }'
```

### Creating a Guest Card (without User ID)
```bash
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "4111111111111111",
    "cardHolderName": "Guest User",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123",
    "isDefault": true
  }'
```

### Getting User Cards
```bash
curl "http://localhost:3000/api/cards?userId=64f8a1b2c3d4e5f6a7b8c9d0&page=1&limit=10"
```

### Getting All Cards (Guest/Anonymous)
```bash
curl "http://localhost:3000/api/cards?page=1&limit=10"
```

### Updating a Card
```bash
curl -X PUT http://localhost:3000/api/cards/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "cardHolderName": "John Smith",
    "isDefault": true
  }'
```

## Notes

- All timestamps are in ISO 8601 format
- Card numbers are automatically masked for security
- Only one card can be set as default per user
- Expired cards are identified but not automatically removed
- Soft delete preserves data for audit purposes
