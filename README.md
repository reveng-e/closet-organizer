# Closet Organizer

A beautiful web application to organize and manage your closet items with image upload capabilities.

## Project Structure

```
Closet Organizer/
├── index.html          # Main HTML file (clean and minimal)
├── styles.css          # All CSS styles and responsive design
├── script.js           # All JavaScript functionality and Firebase integration
├── start_server.bat    # Batch script to start the local server
├── bg.jpg              # Background image
├── kitty.gif           # Cat animation
└── README.md           # This file
```

## Features

- **Add Clothing Items**: Easily add items with name, category, and description
- **Image Upload**: Upload photos of your clothing items
- **Firebase Integration**: Cloud storage for data persistence
- **Responsive Design**: Works on desktop and mobile devices
- **Category Organization**: Items are grouped by category with collapsible sections
- **Visual Interface**: Beautiful UI with animations and hover effects

## How to Run

1. **Start the Server**:
   - Double-click `start_server.bat`, OR
   - Open terminal and run: `py -m http.server 8080`

2. **Open in Browser**:
   - Go to `http://localhost:8080`

3. **Start Adding Items**:
   - Fill out the form to add clothing items
   - Optionally upload images by clicking or dragging files
   - View your organized closet in the right panel

## File Details

### index.html
- Clean, semantic HTML structure
- Links to external CSS and JavaScript files
- Contains only the necessary markup

### styles.css
- All visual styling and layout
- Responsive design for different screen sizes
- Hover effects and animations
- Upload area styling

### script.js
- Firebase configuration and initialization
- Form handling and validation
- Image upload functionality
- Real-time data synchronization
- Dynamic content rendering

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript (ES6+)**: Modern JavaScript with modules
- **Firebase**: Cloud database and storage
- **Tailwind CSS**: Utility-first CSS framework
- **Google Fonts**: Custom typography (Exo 2)
