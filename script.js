// Closet Organizer JavaScript

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
	getAuth,
	signInAnonymously,
	signInWithCustomToken,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
	getFirestore,
	collection,
	addDoc,
	onSnapshot,
	query,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyApPBP73c7p15fTn892VRBt51qsFdNwWRw",
	authDomain: "closet-organizer-d0c15.firebaseapp.com",
	projectId: "closet-organizer-d0c15",
	storageBucket: "closet-organizer-d0c15.firebasestorage.app",
	messagingSenderId: "863969331643",
	appId: "1:863969331643:web:058112f647b18273bc9c9e",
	measurementId: "G-3K7H71ZS9V",
};

// Global variables
const appId = firebaseConfig.projectId;
const initialAuthToken = null;

let app, db, auth, storage, userId = null;
let isAuthReady = false;
let selectedImage = null;

// DOM elements
const loadingIndicator = document.getElementById("loadingIndicator");
const messageBox = document.getElementById("messageBox");
const messageText = document.getElementById("messageText");
const closetItemsDisplay = document.getElementById("closetItemsDisplay");
const noItemsMessage = document.getElementById("noItemsMessage");
const userIdDisplay = document.getElementById("userIdDisplay");

/**
 * Displays a temporary message in the message box.
 * @param {string} message The message to display.
 * @param {boolean} isError True if it's an error message, false for success.
 */
function showMessage(message, isError = false) {
	messageText.textContent = message;
	if (isError) {
		messageBox.classList.remove("bg-green-100", "border-green-400", "text-green-700");
		messageBox.classList.add("bg-red-100", "border-red-400", "text-red-700");
		messageBox.querySelector("svg").classList.remove("text-green-500");
		messageBox.querySelector("svg").classList.add("text-red-500");
	} else {
		messageBox.classList.remove("bg-red-100", "border-red-400", "text-red-700");
		messageBox.classList.add("bg-green-100", "border-green-400", "text-green-700");
		messageBox.querySelector("svg").classList.remove("text-red-500");
		messageBox.querySelector("svg").classList.add("text-green-500");
	}
	messageBox.classList.remove("hidden");
	setTimeout(() => {
		messageBox.classList.add("hidden");
	}, 3000);
}

/**
 * Initializes Firebase and sets up authentication listener.
 */
async function initializeFirebase() {
	try {
		loadingIndicator.classList.remove("hidden");

		app = initializeApp(firebaseConfig);
		db = getFirestore(app);
		auth = getAuth(app);
		storage = getStorage(app);

		onAuthStateChanged(auth, async (user) => {
			if (user) {
				userId = user.uid;
				userIdDisplay.textContent = `Your User ID: ${userId}`;
				isAuthReady = true;
				console.log("Firebase Auth ready. User ID:", userId);
				loadingIndicator.classList.add("hidden");
				setupRealtimeListener();
			} else {
				try {
					if (initialAuthToken) {
						await signInWithCustomToken(auth, initialAuthToken);
						console.log("Signed in with custom token.");
					} else {
						await signInAnonymously(auth);
						console.log("Signed in anonymously.");
					}
				} catch (error) {
					console.error("Error during anonymous/custom token sign-in:", error);
					showMessage("Error signing in. Please try again.", true);
					loadingIndicator.classList.add("hidden");
				}
			}
		});
	} catch (error) {
		console.error("Error initializing Firebase:", error);
		showMessage("Failed to initialize Firebase. Check console for details.", true);
		loadingIndicator.classList.add("hidden");
	}
}

/**
 * Sets up a real-time listener for closet items from Firestore.
 */
function setupRealtimeListener() {
	if (!db || !userId) {
		console.warn("Firestore not initialized or userId not available. Cannot set up listener.");
		return;
	}

	const closetItemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/closetItems`);
	const q = query(closetItemsCollectionRef);

	onSnapshot(
		q,
		(snapshot) => {
			const items = [];
			snapshot.forEach((doc) => {
				items.push({ id: doc.id, ...doc.data() });
			});
			renderClosetItems(items);
		},
		(error) => {
			console.error("Error listening to closet items:", error);
			showMessage("Error loading items. Please refresh.", true);
		}
	);
}

/**
 * Renders the closet items, grouped by category.
 * @param {Array<Object>} items The array of closet item objects.
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

	// Sort items by category
	items.sort((a, b) => {
		const categoryA = a.category ? a.category.toUpperCase() : "";
		const categoryB = b.category ? b.category.toUpperCase() : "";
		if (categoryA < categoryB) return -1;
		if (categoryA > categoryB) return 1;
		return 0;
	});

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
			<span>${category}</span>
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

			if (item.imageUrl) {
				itemDiv.innerHTML = `
					<img src="${item.imageUrl}" alt="${item.name}" class="item-image">
					<div class="flex-1">
						<p class="font-semibold text-gray-900">${item.name}</p>
						${item.description ? `<p class="text-sm text-gray-600">${item.description}</p>` : ""}
					</div>
				`;
			} else {
				itemDiv.innerHTML = `
					<div>
						<p class="font-semibold text-gray-900">${item.name}</p>
						${item.description ? `<p class="text-sm text-gray-600">${item.description}</p>` : ""}
					</div>
				`;
			}
			itemsGrid.appendChild(itemDiv);
		});

		itemsContainer.appendChild(itemsGrid);
		itemsContainer.style.display = "none";

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
 * Upload image to Firebase Storage
 * @param {File} file The image file to upload
 * @param {string} itemName The name of the item for the file path
 * @returns {Promise<string>} The download URL of the uploaded image
 */
async function uploadImage(file, itemName) {
	const fileName = `${Date.now()}_${itemName.replace(/[^a-zA-Z0-9]/g, '_')}.${file.name.split('.').pop()}`;
	const storageRef = ref(storage, `closet-images/${userId}/${fileName}`);

	const snapshot = await uploadBytes(storageRef, file);
	const downloadURL = await getDownloadURL(snapshot.ref);
	return downloadURL;
}

/**
 * Clear the selected image
 */
function clearImage() {
	selectedImage = null;
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
			return;
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			showMessage("Please select a valid image file", true);
			return;
		}

		selectedImage = file;

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
 * Handle form submission
 */
async function handleFormSubmit(event) {
	event.preventDefault();

	if (!isAuthReady) {
		showMessage("Authentication not ready. Please wait a moment.", true);
		return;
	}

	const itemName = document.getElementById("itemName").value;
	const itemCategory = document.getElementById("itemCategory").value;
	const itemDescription = document.getElementById("itemDescription").value;

	if (!itemName || !itemCategory) {
		showMessage("Please enter item name and select a category.", true);
		return;
	}

	try {
		let imageUrl = null;

		// Upload image if one is selected
		if (selectedImage) {
			showMessage("Uploading image...", false);
			try {
				imageUrl = await uploadImage(selectedImage, itemName);
			} catch (imageError) {
				console.error("Error uploading image:", imageError);
				showMessage("Failed to upload image, but item will be saved without image.", true);
			}
		}

		// Add document to Firestore
		await addDoc(collection(db, `artifacts/${appId}/users/${userId}/closetItems`), {
			name: itemName,
			category: itemCategory,
			description: itemDescription,
			imageUrl: imageUrl,
			timestamp: new Date(),
		});

		showMessage("Item added successfully!");
		document.getElementById("itemForm").reset();
		clearImage();
	} catch (e) {
		console.error("Error adding document: ", e);
		showMessage("Error adding item. Please try again.", true);
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
			document.getElementById('imageInput').files = files;
			document.getElementById('imageInput').dispatchEvent(new Event('change'));
		}
	});
}

/**
 * Initialize the application
 */
function initializeApp() {
	// Make clearImage available globally
	window.clearImage = clearImage;
	
	// Setup event listeners
	document.getElementById("itemForm").addEventListener("submit", handleFormSubmit);
	document.getElementById('imageInput').addEventListener('change', handleImageInput);
	
	// Setup drag and drop
	setupDragAndDrop();
	
	// Initialize Firebase
	initializeFirebase();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeApp);
} else {
	initializeApp();
}
