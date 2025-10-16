// Simple setup script to create environment variables
import fs from 'fs';
import path from 'path';

const envContent = `# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/healthcare

# Environment
NODE_ENV=development
`;

const envPath = path.join(process.cwd(), '.env');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please make sure MongoDB is running on your system');
    console.log('🚀 You can now start the server with: npm start');
  } else {
    console.log('⚠️  .env file already exists');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
