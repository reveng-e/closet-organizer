const mongoose = require('mongoose');

// Define the schema for closet items
const closetItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Shirt', 'Pants', 'Hoodie', 'Jacket', 'Dress', 'Skirt', 'Shoes', 'Accessory', 'Other'],
      message: 'Category must be one of: Shirt, Pants, Hoodie, Jacket, Dress, Skirt, Shoes, Accessory, Other'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    default: null
  },
  imagePath: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
closetItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
closetItemSchema.index({ category: 1 });
closetItemSchema.index({ createdAt: -1 });
closetItemSchema.index({ name: 'text', description: 'text' });

// Export the model
module.exports = mongoose.model('ClosetItem', closetItemSchema);
