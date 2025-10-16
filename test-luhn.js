// Test Luhn algorithm for card numbers
function validateCardNumber(cardNumber) {
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
}

// Test the problematic card number
const testNumber = "12548456321145";
console.log(`Testing card number: ${testNumber}`);
console.log(`Length: ${testNumber.length}`);
console.log(`Valid: ${validateCardNumber(testNumber)}`);

// Test some valid numbers
const validNumbers = [
  "4111111111111111",
  "5555555555554444", 
  "378282246310005",
  "6011111111111117"
];

console.log('\nValid test numbers:');
validNumbers.forEach(num => {
  console.log(`${num}: ${validateCardNumber(num)}`);
});
