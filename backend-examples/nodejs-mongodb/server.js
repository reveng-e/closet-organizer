const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Import models
const ClosetItem = require('./models/ClosetItem');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files (uploaded images)
app.use('/uploads', express.static(uploadDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: fileFilter
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/closet-organizer')
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Validation middleware
const validateItem = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Item name is required')
        .isLength({ max: 100 })
        .withMessage('Item name cannot exceed 100 characters'),
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Shirt', 'Pants', 'Hoodie', 'Jacket', 'Dress', 'Skirt', 'Shoes', 'Accessory', 'Other'])
        .withMessage('Invalid category'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Get all closet items
app.get('/api/items', async (req, res) => {
    try {
        const { category, search, sort = '-createdAt', limit = 50, page = 1 } = req.query;
        
        // Build query
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$text = { $search: search };
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Execute query
        const items = await ClosetItem.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip)
            .exec();
        
        // Get total count for pagination
        const total = await ClosetItem.countDocuments(query);
        
        res.json({
            items,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                count: items.length,
                totalItems: total
            }
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Get single item by ID
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await ClosetItem.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid item ID' });
        }
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

// Add new closet item
app.post('/api/items', upload.single('image'), validateItem, handleValidationErrors, async (req, res) => {
    try {
        console.log('📥 POST /api/items - Request received');
        console.log('📄 Request body:', req.body);
        console.log('📎 File uploaded:', req.file ? req.file.filename : 'No file');
        
        const { name, category, description } = req.body;
        
        const itemData = {
            name,
            category,
            description: description || ''
        };
        
        console.log('📝 Item data to save:', itemData);
        
        // Handle image upload
        if (req.file) {
            itemData.imageUrl = `/uploads/${req.file.filename}`;
            itemData.imagePath = req.file.path;
            console.log('🖼️ Image data:', { imageUrl: itemData.imageUrl, imagePath: itemData.imagePath });
        }
        
        console.log('💾 Attempting to save to MongoDB...');
        const newItem = new ClosetItem(itemData);
        const savedItem = await newItem.save();
        
        console.log('✅ New item added successfully:', savedItem.name);
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('❌ ERROR in POST /api/items:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        // Clean up uploaded file if database save failed
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Cleaned up uploaded file due to error');
        }
        
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', Object.values(error.errors).map(err => err.message));
            return res.status(400).json({
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to add item',
            details: error.message 
        });
    }
});

// Update closet item
app.put('/api/items/:id', upload.single('image'), validateItem, handleValidationErrors, async (req, res) => {
    try {
        const { name, category, description } = req.body;
        const itemId = req.params.id;
        
        const item = await ClosetItem.findById(itemId);
        if (!item) {
            // Clean up uploaded file if item not found
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ error: 'Item not found' });
        }
        
        // Update fields
        item.name = name;
        item.category = category;
        item.description = description || '';
        
        // Handle new image upload
        if (req.file) {
            // Delete old image if it exists
            if (item.imagePath && fs.existsSync(item.imagePath)) {
                fs.unlinkSync(item.imagePath);
            }
            
            item.imageUrl = `/uploads/${req.file.filename}`;
            item.imagePath = req.file.path;
        }
        
        const updatedItem = await item.save();
        
        console.log('✅ Item updated:', updatedItem.name);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        
        // Clean up uploaded file if update failed
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid item ID' });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete closet item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const item = await ClosetItem.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        // Delete associated image file
        if (item.imagePath && fs.existsSync(item.imagePath)) {
            fs.unlinkSync(item.imagePath);
            console.log('🗑️ Deleted image file:', item.imagePath);
        }
        
        await ClosetItem.findByIdAndDelete(req.params.id);
        
        console.log('✅ Item deleted:', item.name);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid item ID' });
        }
        
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Get categories with counts
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await ClosetItem.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        res.json(categories.map(cat => ({
            name: cat._id,
            count: cat.count
        })));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Simple test endpoint (no file upload, no validation)
app.post('/api/test', async (req, res) => {
    try {
        console.log('🧪 Test endpoint called');
        console.log('📄 Request body:', req.body);
        
        const testItem = new ClosetItem({
            name: 'Test Item',
            category: 'Other',
            description: 'Test description'
        });
        
        const saved = await testItem.save();
        console.log('✅ Test item saved:', saved._id);
        
        res.json({ 
            success: true, 
            message: 'Test successful',
            item: saved 
        });
    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        res.status(500).json({ 
            error: 'Test failed', 
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadDir}`);
    console.log(`🗄️ MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/closet-organizer'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});
