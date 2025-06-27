const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Check if required environment variables are set
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.log('\n💡 Please create a .env file with the following content:');
  console.log('PORT=5000');
  console.log('NODE_ENV=development');
  console.log('MONGODB_URI=mongodb://localhost:27017/smart-task-management');
  console.log('JWT_SECRET=your-super-secret-jwt-key-for-development-only');
  console.log('JWT_EXPIRE=30d');
  process.exit(1);
}

// Test MongoDB connection
async function testMongoConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 Make sure MongoDB is running on localhost:27017');
    return false;
  }
}

// Start the server
async function startServer() {
  console.log('🚀 Starting Smart Task Management Backend...\n');
  
  // Test MongoDB connection first
  const mongoConnected = await testMongoConnection();
  if (!mongoConnected) {
    process.exit(1);
  }

  try {
    // Import and start the server
    require('./server.js');
    console.log('✅ Backend server started successfully!');
    console.log(`🌐 Server running on: http://localhost:${process.env.PORT || 5000}`);
    console.log('📚 API Documentation: http://localhost:5000/api/health');
    console.log('\n🧪 To test the backend, run: node test-backend.js');
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer(); 