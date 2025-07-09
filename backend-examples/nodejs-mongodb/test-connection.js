// Simple test script to check if everything is working
// Run this with: node test-connection.js

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('🔄 Testing MongoDB connection...');
        
        // Try to connect
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/closet-organizer');
        console.log('✅ MongoDB connected successfully');
        
        // Try to create a simple document
        const ClosetItem = require('./models/ClosetItem');
        
        const testItem = new ClosetItem({
            name: 'Test Item',
            category: 'Other',
            description: 'This is a test'
        });
        
        console.log('🔄 Testing document creation...');
        const saved = await testItem.save();
        console.log('✅ Test document created:', saved._id);
        
        // Clean up test document
        await ClosetItem.findByIdAndDelete(saved._id);
        console.log('🗑️ Test document deleted');
        
        await mongoose.connection.close();
        console.log('✅ All tests passed! Your setup is working.');
        
    } catch (error) {
        console.error('❌ Test failed:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();
