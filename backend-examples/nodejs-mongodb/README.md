# Closet Organizer with Node.js + Express + MongoDB

This guide will help you set up your Closet Organizer app with a Node.js backend using Express and MongoDB.

## Prerequisites

1. **Node.js** (v16 or later) - Download from [nodejs.org](https://nodejs.org/)
2. **MongoDB** - Choose one option:
   - **Local MongoDB**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Free cloud database): Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)

## Setup Instructions

### 1. Install MongoDB (Choose One Option)

#### Option A: Local MongoDB Installation
1. Download MongoDB Community Server from the official website
2. Install it with default settings
3. MongoDB will run on `mongodb://localhost:27017` by default

#### Option B: MongoDB Atlas (Cloud - Recommended for Beginners)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free tier)
4. Create a database user with a username and password
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs during development)
6. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/closet-organizer`)

### 2. Set Up the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd "C:\Users\riddh\OneDrive\Documents\Personal Projects ^^\Closet Organizer\backend-examples\nodejs-mongodb"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   ```
   
   Then edit the `.env` file with your MongoDB connection details:
   
   **For Local MongoDB:**
   ```
   MONGODB_URI=mongodb://localhost:27017/closet-organizer
   PORT=3001
   NODE_ENV=development
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads
   ```
   
   **For MongoDB Atlas:**
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/closet-organizer
   PORT=3001
   NODE_ENV=development
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   🚀 Server running on http://localhost:3001
   ✅ Connected to MongoDB
   ```

### 3. Update Your Frontend

1. **Replace your current script.js** with the MongoDB version:
   ```bash
   # In your main project directory
   copy script-mongodb.js script.js
   ```

2. **Update your HTML file** to remove Firebase references and ensure it uses the new script:
   - Make sure `index.html` references `script.js` (not as a module since we're not using Firebase anymore)

### 4. Test Your Application

1. **Start your frontend server:**
   ```bash
   # In your main project directory
   python -m http.server 8000
   ```

2. **Open your browser** and go to `http://localhost:8000`

3. **Try adding an item** - you should see it appear in your closet!

## API Endpoints

Your backend provides these endpoints:

- `GET /health` - Check if the server is running
- `GET /api/items` - Get all closet items (supports pagination, filtering, search)
- `POST /api/items` - Add a new item (with optional image upload)
- `GET /api/items/:id` - Get a specific item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item
- `GET /api/categories` - Get category statistics

## Features

✅ **Add items** with name, category, description, and optional images
✅ **Image upload** with automatic file handling
✅ **Delete items** with confirmation
✅ **Category grouping** with item counts
✅ **Pagination** for large collections
✅ **Search functionality** (coming soon in frontend)
✅ **Data validation** on both frontend and backend
✅ **Error handling** with user-friendly messages

## Troubleshooting

### Backend won't start
- Check if MongoDB is running (for local installations)
- Verify your MongoDB connection string in `.env`
- Make sure port 3001 isn't already in use

### Can't connect to MongoDB Atlas
- Check your username and password
- Ensure your IP address is whitelisted
- Verify the cluster is running

### Images not displaying
- Check if the `uploads` folder exists in your backend directory
- Verify the backend server is running on port 3001
- Check browser console for CORS errors

### "Failed to fetch" errors
- Ensure both frontend (port 8000) and backend (port 3001) are running
- Check if you're using the correct API URLs

## Next Steps

1. **Deploy your backend** to services like:
   - Heroku
   - Railway
   - Render
   - DigitalOcean

2. **Add more features:**
   - Search functionality
   - Category filtering
   - Image optimization
   - User authentication
   - Item editing

3. **Improve the UI:**
   - Add loading states
   - Better error messages
   - Mobile responsiveness
   - Dark mode

## Need Help?

- Check the browser console for errors
- Check the backend terminal for server logs
- Verify all services are running
- Make sure your MongoDB connection is working
