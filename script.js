// Frontend JavaScript for MongoDB backend
// This replaces your Firebase script.js

let items = [];
let currentPage = 1;
let totalPages = 1;

// DOM elements
const loadingIndicator = document.getElementById("loadingIndicator");
const messageBox = document.getElementById("messageBox");
const messageText = document.getElementById("messageText");
const closetItemsDisplay = document.getElementById("closetItemsDisplay");
const noItemsMessage = document.getElementById("noItemsMessage");

// API Base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Display a message to the user
 */
function showMessage(message, isError = false) {
    messageText.textContent = message;
    if (isError) {
        messageBox.classList.remove("bg-green-100", "border-green-400", "text-green-700");
        messageBox.classList.add("bg-red-100", "border-red-400", "text-red-700");
        const svg = messageBox.querySelector("svg");
        if (svg) {
            svg.classList.remove("text-green-500");
            svg.classList.add("text-red-500");
        }
    } else {
        messageBox.classList.remove("bg-red-100", "border-red-400", "text-red-700");
        messageBox.classList.add("bg-green-100", "border-green-400", "text-green-700");
        const svg = messageBox.querySelector("svg");
        if (svg) {
            svg.classList.remove("text-red-500");
            svg.classList.add("text-green-500");
        }
    }
    messageBox.classList.remove("hidden");
    setTimeout(() => {
        messageBox.classList.add("hidden");
    }, 3000);
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.classList.remove("hidden");
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add("hidden");
}

/**
 * Fetch all items from the backend
 */
async function fetchItems(category = 'all', search = '', page = 1) {
    try {
        showLoading();
        
        const queryParams = new URLSearchParams({
            category: category,
            page: page.toString(),
            limit: '20'
        });
        
        if (search) {
            queryParams.append('search', search);
        }
        
        const response = await fetch(`${API_BASE_URL}/items?${queryParams}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        items = data.items;
        currentPage = data.pagination.current;
        totalPages = data.pagination.total;
        
        renderClosetItems(items);
        renderPagination();
        hideLoading();
        
        console.log(`✅ Loaded ${items.length} items (page ${currentPage}/${totalPages})`);
    } catch (error) {
        console.error('❌ Error fetching items:', error);
        showMessage('Error loading items. Please check if the backend server is running.', true);
        hideLoading();
    }
}

/**
 * Add a new item to the backend
 */
async function addItem(formData) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            body: formData // FormData object for file upload
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const newItem = await response.json();
        showMessage('Item added successfully!');
        
        // Refresh the items list
        await fetchItems();
        hideLoading();
        
        return newItem;
    } catch (error) {
        console.error('❌ Error adding item:', error);
        showMessage(error.message || 'Error adding item. Please try again.', true);
        hideLoading();
        throw error;
    }
}

/**
 * Delete an item
 */
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/items/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        showMessage('Item deleted successfully!');
        await fetchItems(); // Refresh the list
        hideLoading();
    } catch (error) {
        console.error('❌ Error deleting item:', error);
        showMessage(error.message || 'Error deleting item. Please try again.', true);
        hideLoading();
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log("=== FORM SUBMISSION ===");
    
    const itemName = document.getElementById("itemName").value.trim();
    const itemCategory = document.getElementById("itemCategory").value;
    const itemDescription = document.getElementById("itemDescription").value.trim();
    const imageInput = document.getElementById("imageInput");

    console.log("Form data:", { itemName, itemCategory, itemDescription, hasImage: !!imageInput.files[0] });

    if (!itemName || !itemCategory) {
        showMessage("Please enter item name and select a category.", true);
        return;
    }

    try {
        // Create FormData object for sending data and file
        const formData = new FormData();
        formData.append('name', itemName);
        formData.append('category', itemCategory);
        formData.append('description', itemDescription);
        
        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
            console.log("Image file attached:", imageInput.files[0].name);
        }

        await addItem(formData);
        
        // Reset form
        document.getElementById("itemForm").reset();
        clearImage();
        
        console.log("✅ Item added successfully");
    } catch (error) {
        console.error("❌ Form submission failed:", error);
    }
}

/**
 * Render closet items
 */
function renderClosetItems(items) {
    closetItemsDisplay.innerHTML = "";

    if (items.length === 0) {
        noItemsMessage.classList.remove("hidden");
        closetItemsDisplay.appendChild(noItemsMessage);
        return;
    } else {
        noItemsMessage.classList.add("hidden");
    }

    // Group items by category
    const categorizedItems = {};
    items.forEach((item) => {
        const category = item.category || "Uncategorized";
        if (!categorizedItems[category]) {
            categorizedItems[category] = [];
        }
        categorizedItems[category].push(item);
    });

    for (const category in categorizedItems) {
        const categoryGroupDiv = document.createElement("div");
        categoryGroupDiv.className = "mb-6";

        const categoryHeadingDiv = document.createElement("div");
        categoryHeadingDiv.className = "category-heading mb-3 flex items-center justify-between cursor-pointer";
        categoryHeadingDiv.innerHTML = `
            <span>${category} (${categorizedItems[category].length})</span>
            <svg class="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        `;

        const itemsContainer = document.createElement("div");
        itemsContainer.className = "space-y-3";

        const itemsGrid = document.createElement("div");
        itemsGrid.className = "items-grid";

        categorizedItems[category].forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = item.imageUrl ? "item-card-with-image" : "item-card flex justify-between items-center";

            const formattedDate = new Date(item.createdAt).toLocaleDateString();

            if (item.imageUrl) {
                itemDiv.innerHTML = `
                    <img src="http://localhost:3001${item.imageUrl}" 
                         alt="${item.name}" 
                         class="item-image" 
                         onclick="showImageModal('http://localhost:3001${item.imageUrl}', '${item.name.replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}', '${item.category}')"
                         title="Click to view full size"
                         onerror="this.style.display='none'">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-900">${item.name}</p>
                        ${item.description ? `<p class="text-sm text-gray-600">${item.description}</p>` : ""}
                        <p class="text-xs text-gray-400">Added: ${formattedDate}</p>
                    </div>
                    <button onclick="deleteItem('${item._id}')" class="text-red-600 hover:text-red-800 ml-2" title="Delete item">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                `;
            } else {
                itemDiv.innerHTML = `
                    <div class="flex-1">
                        <p class="font-semibold text-gray-900">${item.name}</p>
                        ${item.description ? `<p class="text-sm text-gray-600">${item.description}</p>` : ""}
                        <p class="text-xs text-gray-400">Added: ${formattedDate}</p>
                    </div>
                    <button onclick="deleteItem('${item._id}')" class="text-red-600 hover:text-red-800" title="Delete item">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                `;
            }
            itemsGrid.appendChild(itemDiv);
        });

        itemsContainer.appendChild(itemsGrid);
        itemsContainer.style.display = "block"; // Show by default

        // Toggle dropdown on click
        categoryHeadingDiv.addEventListener("click", function () {
            const isOpen = itemsContainer.style.display === "block";
            itemsContainer.style.display = isOpen ? "none" : "block";
            const svg = categoryHeadingDiv.querySelector("svg");
            svg.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
        });

        categoryGroupDiv.appendChild(categoryHeadingDiv);
        categoryGroupDiv.appendChild(itemsContainer);
        closetItemsDisplay.appendChild(categoryGroupDiv);
    }
}

/**
 * Render pagination controls
 */
function renderPagination() {
    // Remove existing pagination
    const existingPagination = document.getElementById('pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    if (totalPages <= 1) return;

    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'pagination';
    paginationDiv.className = 'flex justify-center items-center space-x-2 mt-6';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = `px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`;
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            fetchItems('all', '', currentPage - 1);
        }
    };

    // Page numbers
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.className = 'text-gray-600';

    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = `px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            fetchItems('all', '', currentPage + 1);
        }
    };

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);

    closetItemsDisplay.parentElement.appendChild(paginationDiv);
}

/**
 * Clear image preview
 */
function clearImage() {
    document.getElementById('imageInput').value = '';
    document.getElementById('uploadContent').classList.remove('hidden');
    document.getElementById('imagePreview').classList.add('hidden');
}

/**
 * Handle image input change
 */
function handleImageInput(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showMessage("File size must be less than 10MB", true);
            clearImage();
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showMessage("Please select a valid image file", true);
            clearImage();
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('uploadContent').classList.add('hidden');
            document.getElementById('imagePreview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');

    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const imageInput = document.getElementById('imageInput');
            
            // Create a new FileList with the dropped file
            const dt = new DataTransfer();
            dt.items.add(file);
            imageInput.files = dt.files;
            
            // Trigger the change event
            imageInput.dispatchEvent(new Event('change'));
        }
    });
}

/**
 * Check backend health
 */
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
        if (response.ok) {
            const health = await response.json();
            console.log('✅ Backend is healthy:', health);
            return true;
        }
    } catch (error) {
        console.error('❌ Backend health check failed:', error);
        showMessage('Backend server is not running. Please start it first.', true);
        return false;
    }
}

/**
 * Show image in modal
 */
function showImageModal(imageUrl, itemName, itemDescription, itemCategory) {
    // Remove existing modal if any
    const existingModal = document.getElementById('imageModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal()">&times;</button>
            <img src="${imageUrl}" alt="${itemName}" class="modal-image">
            <div class="modal-info">
                <h3>${itemName}</h3>
                <p><strong>Category:</strong> ${itemCategory}</p>
                ${itemDescription ? `<p><strong>Description:</strong> ${itemDescription}</p>` : ''}
            </div>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });

    // Close modal with Escape key
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Close image modal
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

/**
 * Open image in new tab
 */
function openImageInNewTab(imageUrl, itemName) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${itemName} - Closet Organizer</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    background: #f3f4f6;
                    font-family: 'Exo 2', sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-height: 100vh;
                }
                img {
                    max-width: 100%;
                    max-height: 80vh;
                    object-fit: contain;
                    border-radius: 10px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    background: white;
                    padding: 10px;
                }
                h1 {
                    color: #374151;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .back-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                .back-button:hover {
                    background: #1d4ed8;
                }
            </style>
        </head>
        <body>
            <h1>${itemName}</h1>
            <img src="${imageUrl}" alt="${itemName}">
            <button class="back-button" onclick="window.close()">Close Window</button>
        </body>
        </html>
    `);
}

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('🚀 Initializing Closet Organizer...');
    
    // Make functions available globally
    window.clearImage = clearImage;
    window.deleteItem = deleteItem;
    window.showImageModal = showImageModal;
    window.closeImageModal = closeImageModal;
    window.openImageInNewTab = openImageInNewTab;
    
    // Setup event listeners
    document.getElementById("itemForm").addEventListener("submit", handleFormSubmit);
    document.getElementById('imageInput').addEventListener('change', handleImageInput);
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Check backend health and load initial data
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
        await fetchItems();
    }
    
    console.log('✅ App initialized');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
