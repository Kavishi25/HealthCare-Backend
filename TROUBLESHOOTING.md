# Card Management System - Troubleshooting Guide

## Issue: Request to localhost:3000/api/cards not working

### Problem
The frontend is making requests to `http://localhost:3000/api/cards` but the backend server is configured to run on port 5000.

### Solution

1. **Update Frontend API URL** ✅ (Already Fixed)
   - Changed `API_BASE_URL` in `HealthCare-Frontend/src/services/cardService.js` from port 3000 to 5000

2. **Set up Environment Variables**
   ```bash
   cd HealthCare-Backend
   node setup.js
   ```
   This will create a `.env` file with the correct configuration.

3. **Start MongoDB** (Required)
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows (if installed as service)
   net start MongoDB
   
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

4. **Start the Backend Server**
   ```bash
   cd HealthCare-Backend
   npm install  # If not already done
   npm start
   ```
   You should see: `✅ Server is running on port 5000`

5. **Start the Frontend**
   ```bash
   cd HealthCare-Frontend
   npm install  # If not already done
   npm run dev
   ```

## Testing the API

### Manual Test
You can test the API directly using the test script:
```bash
cd HealthCare-Backend
node test-card-api.js
```

### Browser Test
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try adding a card in the frontend
4. Check if the request goes to `http://localhost:5000/api/cards`

## Common Issues

### 1. MongoDB Connection Error
**Error**: `MongoDB connection failed`
**Solution**: 
- Ensure MongoDB is running
- Check if the connection string in `.env` is correct
- Default: `mongodb://localhost:27017/healthcare`

### 2. CORS Error
**Error**: `Access to fetch at 'http://localhost:5000/api/cards' from origin 'http://localhost:5173' has been blocked by CORS policy`
**Solution**: 
- The backend already has CORS enabled
- Make sure both servers are running on their respective ports

### 3. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`
**Solution**:
```bash
# Find and kill the process using port 5000
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# On macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### 4. Card Validation Errors
**Error**: `Invalid card number`
**Solution**:
- Use valid test card numbers:
  - Visa: `4111111111111111`
  - MasterCard: `5555555555554444`
  - American Express: `378282246310005`

## Expected Behavior

### Successful Card Creation
When you submit a card form, you should see:
1. Loading state in the modal
2. Modal closes automatically
3. New card appears in the cards list
4. Card is automatically selected

### Network Request
The request should go to:
- **URL**: `http://localhost:5000/api/cards`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**: Card data with masked number

## Debug Steps

1. **Check Backend Logs**
   ```bash
   cd HealthCare-Backend
   npm start
   ```
   Look for any error messages in the console.

2. **Check Frontend Console**
   Open browser developer tools and check for JavaScript errors.

3. **Test API Directly**
   Use curl or Postman to test the API:
   ```bash
   curl -X POST http://localhost:5000/api/cards \
     -H "Content-Type: application/json" \
     -d '{
       "cardNumber": "4111111111111111",
       "cardHolderName": "Test User",
       "expiryMonth": 12,
       "expiryYear": 2025,
       "cvv": "123",
       "isDefault": false
     }'
   ```

4. **Check Database**
   If using MongoDB Compass or similar tool, check if the `cards` collection is being created.

## Still Having Issues?

If you're still experiencing problems:

1. **Check the exact error message** in browser console
2. **Verify both servers are running** (backend on 5000, frontend on 5173)
3. **Check MongoDB connection** 
4. **Try the test script** to isolate the issue

The system should work once both servers are running and MongoDB is connected!
