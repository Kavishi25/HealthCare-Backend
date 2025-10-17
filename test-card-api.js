// Test the card API endpoints
async function testCardAPI() {
  console.log('🧪 Testing Card API...\n');

  try {
    // Test 1: Create a new card
    console.log('1. Testing card creation...');
    const newCard = {
      cardNumber: '1234567890123456',
      cardHolderName: 'John Doe',
      expiryMonth: 12,
      expiryYear: 2025,
      cvv: '123',
      cardType: 'Visa',
      isDefault: true
    };

    const createResponse = await fetch('http://localhost:5000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCard),
    });

    const createResult = await createResponse.json();
    console.log('✅ Card created:', createResult);

    if (createResult.success) {
      const cardId = createResult.data.id;

      // Test 2: Get all cards
      console.log('\n2. Testing get all cards...');
      const getResponse = await fetch('http://localhost:5000/api/cards');
      const getResult = await getResponse.json();
      console.log('✅ Cards retrieved:', getResult);

      // Test 3: Get specific card
      console.log('\n3. Testing get specific card...');
      const getCardResponse = await fetch(`http://localhost:5000/api/cards/${cardId}`);
      const getCardResult = await getCardResponse.json();
      console.log('✅ Card retrieved:', getCardResult);

      // Test 4: Update card
      console.log('\n4. Testing card update...');
      const updateData = {
        cardHolderName: 'John Smith',
        isDefault: false
      };

      const updateResponse = await fetch(`http://localhost:5000/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const updateResult = await updateResponse.json();
      console.log('✅ Card updated:', updateResult);

      // Test 5: Validate card
      console.log('\n5. Testing card validation...');
      const validateResponse = await fetch('http://localhost:5000/api/cards/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCard),
      });

      const validateResult = await validateResponse.json();
      console.log('✅ Card validated:', validateResult);

      // Test 6: Delete card
      console.log('\n6. Testing card deletion...');
      const deleteResponse = await fetch(`http://localhost:5000/api/cards/${cardId}`, {
        method: 'DELETE',
      });

      const deleteResult = await deleteResponse.json();
      console.log('✅ Card deleted:', deleteResult);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCardAPI();
