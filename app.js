// DOM Elements
const loginScreen = document.getElementById('login-screen');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const homeScreen = document.getElementById('home-screen');
const createCommunityBtn = document.getElementById('create-community-btn');
const joinCommunityBtn = document.getElementById('join-community-btn');
const logoutBtn = document.getElementById('logout-btn');

const createCommunityScreen = document.getElementById('create-community-screen');
const createCommunityForm = document.getElementById('create-community-form');
const backFromCreateBtn = document.getElementById('back-from-create');

const joinCommunityScreen = document.getElementById('join-community-screen');
const joinCommunityForm = document.getElementById('join-community-form');
const backFromJoinBtn = document.getElementById('back-from-join');

const dashboardScreen = document.getElementById('dashboard-screen');
const communityDashboardName = document.getElementById('community-dashboard-name');
const adminControls = document.getElementById('admin-controls');
const createEventBtn = document.getElementById('create-event-btn');
const scanRsvpBtn = document.getElementById('scan-rsvp-btn');
const eventDetailsExportBtn = document.getElementById('export-rsvp-btn');
const dashboardLogoutBtn = document.getElementById('dashboard-logout-btn');
const eventsList = document.getElementById('events-list');

const createEventScreen = document.getElementById('create-event-screen');
const createEventForm = document.getElementById('create-event-form');
const backFromCreateEventBtn = document.getElementById('back-from-create-event');

const eventDetailsScreen = document.getElementById('event-details-screen');
const eventDetailsName = document.getElementById('event-details-name');
const eventDetailsDatetime = document.getElementById('event-details-datetime');
const eventDetailsLocation = document.getElementById('event-details-location');
const eventDetailsDescription = document.getElementById('event-details-description');
const rsvpCode = document.getElementById('rsvp-code');
const rsvpQrCode = document.getElementById('rsvp-qr-code');
const backFromEventDetailsBtn = document.getElementById('back-from-event-details');

const scanRsvpScreen = document.getElementById('scan-rsvp-screen');
const qrReader = document.getElementById('qr-reader');
const manualCode = document.getElementById('manual-code');
const verifyManualCodeBtn = document.getElementById('verify-manual-code');
const verificationResult = document.getElementById('verification-result');
const backFromScanBtn = document.getElementById('back-from-scan');

// Global variables
let currentUser = null;
let currentCommunity = null;
let currentEvent = null;
let html5QrCode = null;
let sessionTimeout = null;
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
let loadingOverlay = null;

// Remove Node.js process.env references which don't work in browser
// NeonDB Configuration will be handled by server.js
const dbConfig = {
    // These values are only used by server.js, not needed in client-side code
    host: 'localhost',
    port: 5432,
    database: 'rsvp_app',
    user: 'postgres',
    password: 'password'
};

// Security utilities
function hashPassword(password) {
    // TODO: In a real app, replace this with a robust hashing library like bcrypt.js
    // This is a simple hash for demonstration purposes ONLY and is not secure for production.
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}

function startSessionTimer() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        if (currentUser) {
            showNotification('Your session has expired. Please log in again.', 'warning');
            logout();
        }
    }, SESSION_DURATION);
}

function resetSessionTimer() {
    if (currentUser) {
        startSessionTimer();
    }
}

// Loading indicator functions
function showLoading() {
    if (!loadingOverlay) {
        loadingOverlay = document.getElementById('loading-overlay');
    }
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    if (!loadingOverlay) {
        loadingOverlay = document.getElementById('loading-overlay');
    }
    loadingOverlay.classList.remove('active');
}

// Initialize storage
function initializeStorage() {
    showLoading();
    
    // Initialize local storage if empty
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('communities')) {
        localStorage.setItem('communities', JSON.stringify([]));
    }
    if (!localStorage.getItem('events')) {
        localStorage.setItem('events', JSON.stringify([]));
    }
    if (!localStorage.getItem('rsvps')) {
        localStorage.setItem('rsvps', JSON.stringify([]));
    }
    
    // Create admin user if no users exist
    const users = JSON.parse(localStorage.getItem('users'));
    if (users.length === 0) {
        const adminUser = {
            id: Date.now().toString(),
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashPassword('Admin123'),
            isAdmin: true
        };
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Created default admin user: admin@example.com / Admin123');
    }
    
    // Check for logged in user and session validity
    const savedUser = localStorage.getItem('currentUser');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (savedUser && lastActivity) {
        const now = new Date().getTime();
        const lastActivityTime = parseInt(lastActivity);
        
        if (now - lastActivityTime < SESSION_DURATION) {
            // Session is still valid
            currentUser = JSON.parse(savedUser);
            localStorage.setItem('lastActivity', now.toString());
            startSessionTimer();
            
            const savedCommunity = localStorage.getItem('currentCommunity');
            if (savedCommunity) {
                currentCommunity = JSON.parse(savedCommunity);
                showScreen(dashboardScreen);
                updateDashboard();
            } else {
                showScreen(homeScreen);
            }
        } else {
            // Session expired
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentCommunity');
            localStorage.removeItem('lastActivity');
            showScreen(loginScreen);
        }
    } else {
        showScreen(loginScreen);
    }
    
    // Add activity listeners for session management
    document.addEventListener('click', resetSessionTimer);
    document.addEventListener('keypress', resetSessionTimer);
    
    // Hide loading after initialization
    setTimeout(hideLoading, 500); // Small delay for better UX
}

// Helper functions
function showScreen(screen) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Show the requested screen
    screen.classList.add('active');
}

function generateUniqueCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function updateDashboard() {
    // Update community name
    communityDashboardName.textContent = currentCommunity.name;
    
    // Show admin controls if user is admin
    if (currentUser.isAdmin && currentUser.id === currentCommunity.adminId) {
        adminControls.style.display = 'block';
    } else {
        adminControls.style.display = 'none';
    }
    
    // Update events list
    updateEventsList();
}

function updateEventsList() {
    const events = JSON.parse(localStorage.getItem('events'));
    const communityEvents = events.filter(event => event.communityId === currentCommunity.id);
    
    if (communityEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No events created yet</div>';
        return;
    }
    
    eventsList.innerHTML = '';
    communityEvents.forEach(event => {
        const eventDate = new Date(event.date + 'T' + event.time);
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <h4>${event.name}</h4>
            <div class="event-date"><i class="fas fa-calendar"></i> ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
        `;
        eventCard.addEventListener('click', () => showEventDetails(event));
        eventsList.appendChild(eventCard);
    });
}

function showEventDetails(event) {
    currentEvent = event;
    
    // Update event details
    eventDetailsName.textContent = event.name;
    const eventDate = new Date(event.date + 'T' + event.time);
    eventDetailsDatetime.textContent = `${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    eventDetailsLocation.textContent = event.location;
    eventDetailsDescription.textContent = event.description;
    
    // Generate or retrieve RSVP code
    const rsvps = JSON.parse(localStorage.getItem('rsvps'));
    let userRsvp = rsvps.find(rsvp => 
        rsvp.eventId === event.id && 
        rsvp.userId === currentUser.id
    );
    
    if (!userRsvp) {
        // Create new RSVP
        const rsvpCode = generateUniqueCode();
        userRsvp = {
            id: Date.now().toString(),
            eventId: event.id,
            userId: currentUser.id,
            userName: currentUser.name,
            code: rsvpCode,
            scanned: false,
            timestamp: new Date().toISOString()
        };
        rsvps.push(userRsvp);
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
    }
    
    // Display RSVP code
    rsvpCode.textContent = userRsvp.code;
    
    // Generate QR code
    // Clear previous QR code
    document.getElementById('rsvp-qr-code').innerHTML = '';
    const canvas = document.createElement('canvas');
    document.getElementById('rsvp-qr-code').appendChild(canvas);
    QRCode.toCanvas(canvas, userRsvp.code, {
        width: 200,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    }, function (error) {
        if (error) {
            console.error('Error generating QR code:', error);
            showNotification('Failed to generate QR code', 'error');
        }
    });
    
    // Add event listener for export button on event details screen
    eventDetailsExportBtn.onclick = () => exportRSVPData(event.id);
    
    showScreen(eventDetailsScreen);
}

function initializeQRScanner() {
    if (html5QrCode) {
        try {
            html5QrCode.stop();
        } catch (error) {
            console.log('No active scanner to stop');
        }
    }
    
    html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        .catch(error => {
            console.error('Error starting scanner:', error);
            showNotification('Could not start camera. Please check permissions.', 'error');
        });
}

function onScanSuccess(decodedText) {
    verifyRsvpCode(decodedText);
}

function verifyRsvpCode(code) {
    const rsvps = JSON.parse(localStorage.getItem('rsvps'));
    const rsvp = rsvps.find(r => r.code === code);
    
    if (rsvp) {
        const events = JSON.parse(localStorage.getItem('events'));
        const event = events.find(e => e.id === rsvp.eventId);
        
        if (event && event.communityId === currentCommunity.id) {
            // Mark as scanned
            rsvp.scanned = true;
            rsvp.scanTimestamp = new Date().toISOString();
            rsvp.scannedBy = currentUser.id;
            localStorage.setItem('rsvps', JSON.stringify(rsvps));
            
            // Show success message
            verificationResult.innerHTML = `
                <h3><i class="fas fa-check-circle"></i> Success!</h3>
                <p>RSVP verified for ${rsvp.userName}</p>
                <p>Event: ${event.name}</p>
                <button id="back-from-verification" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            `;
            verificationResult.className = 'verification-result verification-success';
        } else {
            // Wrong event or community
            verificationResult.innerHTML = `
                <h3><i class="fas fa-times-circle"></i> Invalid RSVP</h3>
                <p>This RSVP code is for a different event or community.</p>
                <button id="back-from-verification" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            `;
            verificationResult.className = 'verification-result verification-error';
        }
    } else {
        // Invalid code
        verificationResult.innerHTML = `
            <h3><i class="fas fa-times-circle"></i> Invalid Code</h3>
            <p>This RSVP code does not exist.</p>
            <button id="back-from-verification" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
        `;
        verificationResult.className = 'verification-result verification-error';
    }
    
    verificationResult.classList.remove('hidden');
    
    // Add event listener to the back button
    document.getElementById('back-from-verification').addEventListener('click', () => {
        // Stop the scanner
        if (html5QrCode) {
            try {
                html5QrCode.stop();
                console.log('Scanner stopped');
            } catch (error) {
                console.log('Error stopping scanner:', error);
            }
        }
        
        // Hide verification result
        verificationResult.classList.add('hidden');
        
        // Return to dashboard
        showScreen(dashboardScreen);
        updateDashboard();
        
        showNotification('Returned to dashboard', 'info');
    });
}

function exportRSVPData(eventId) {
    const rsvps = JSON.parse(localStorage.getItem('rsvps'));
    const events = JSON.parse(localStorage.getItem('events'));
    
    // Filter RSVPs for the specific event
    const eventRsvps = rsvps.filter(rsvp => rsvp.eventId === eventId);
    
    if (eventRsvps.length === 0) {
        showNotification('No RSVP data available for this event', 'info');
        return;
    }
    
    // Prepare data for Excel
    const exportData = eventRsvps.map(rsvp => {
        const event = events.find(e => e.id === rsvp.eventId);
        return {
            'Event Name': event ? event.name : 'Unknown Event',
            'Attendee Name': rsvp.userName,
            'RSVP Code': rsvp.code,
            'Checked In': rsvp.scanned ? 'Yes' : 'No',
            'Check-in Time': rsvp.scanTimestamp ? new Date(rsvp.scanTimestamp).toLocaleString() : 'N/A'
        };
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RSVP Data');
    
    // Generate Excel file
    const eventName = events.find(e => e.id === eventId)?.name || 'Unknown Event';
    const fileName = `${eventName}_RSVP_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeStorage);

// Login/Register Tab Switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginFormContainer.classList.remove('hidden');
    registerFormContainer.classList.add('hidden');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerFormContainer.classList.remove('hidden');
    loginFormContainer.classList.add('hidden');
});

// Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading indicator
    showLoading();
    
    // Simulate network delay for better UX (remove in production with real API)
    setTimeout(() => {
        // Hash password for comparison
        const hashedPassword = hashPassword(password);
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && (u.password === hashedPassword || u.password === password));
        
        if (user) {
            // Update user's password hash if it's stored in plain text (for existing users)
            if (user.password === password) {
                user.password = hashedPassword;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Set current user and start session
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('lastActivity', new Date().getTime().toString());
            startSessionTimer();
            
            hideLoading();
            showNotification('Login successful!', 'success');
            showScreen(homeScreen);
            updateHomeScreenButtons(); // Call this after successful login
        } else {
            hideLoading();
            showNotification('Invalid email or password', 'error');
            // Add a small delay for security (prevents timing attacks)
            setTimeout(() => {}, 300);
        }
    }, 800); // Simulate network delay
});

// Register Form Submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const isAdmin = document.getElementById('register-admin').checked;
    
    // Validate inputs
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (name.length < 2) {
        showNotification('Name must be at least 2 characters long', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number', 'error');
        return;
    }
    
    // Show loading indicator
    showLoading();
    
    // Simulate network delay for better UX (remove in production with real API)
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            hideLoading();
            showNotification('Email already registered', 'error');
            return;
        }
        
        // Create new user with hashed password
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashPassword(password),
            isAdmin
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('lastActivity', new Date().getTime().toString());
        startSessionTimer();
        
        hideLoading();
        showNotification('Registration successful!', 'success');
        showScreen(homeScreen);
        updateHomeScreenButtons(); // Call this after successful registration
    }, 1000); // Simulate network delay
});

// Home Screen Navigation
createCommunityBtn.addEventListener('click', () => {
    showScreen(createCommunityScreen);
});

joinCommunityBtn.addEventListener('click', () => {
    showScreen(joinCommunityScreen);
});

logoutBtn.addEventListener('click', () => {
    logout();
});

// Create Community Form
createCommunityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check if user is admin
    if (!currentUser.isAdmin) {
        showNotification('Only admin users can create communities', 'error');
        return;
    }
    
    const name = document.getElementById('community-name').value;
    const description = document.getElementById('community-description').value;
    
    const communities = JSON.parse(localStorage.getItem('communities'));
    
    // Create new community
    const communityCode = generateUniqueCode();
    const newCommunity = {
        id: Date.now().toString(),
        name,
        description,
        code: communityCode,
        adminId: currentUser.id,
        members: [currentUser.id],
        createdAt: new Date().toISOString()
    };
    
    communities.push(newCommunity);
    localStorage.setItem('communities', JSON.stringify(communities));
    
    // Set as current community
    currentCommunity = newCommunity;
    localStorage.setItem('currentCommunity', JSON.stringify(newCommunity));
    
    // Show community code in a message form instead of alert
    const messageHTML = `
        <div class="message-form">
            <h3><i class="fas fa-check-circle"></i> Community Created Successfully!</h3>
            <p>Your community has been created. Share this code with others to invite them:</p>
            <div class="community-code">${communityCode}</div>
            <button id="close-message" class="btn btn-primary">Continue to Dashboard</button>
        </div>
    `;
    
    // Create and show message overlay
    const messageOverlay = document.createElement('div');
    messageOverlay.className = 'message-overlay';
    messageOverlay.innerHTML = messageHTML;
    document.body.appendChild(messageOverlay);
    
    // Add event listener to close button
    document.getElementById('close-message').addEventListener('click', () => {
        document.body.removeChild(messageOverlay);
        showScreen(dashboardScreen);
        updateDashboard();
    });
});

backFromCreateBtn.addEventListener('click', () => {
    showScreen(homeScreen);
});

// Join Community Form
joinCommunityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('community-code').value;
    
    const communities = JSON.parse(localStorage.getItem('communities'));
    const community = communities.find(c => c.code === code);
    
    if (community) {
        // Add user to community if not already a member
        if (!community.members.includes(currentUser.id)) {
            community.members.push(currentUser.id);
            localStorage.setItem('communities', JSON.stringify(communities));
        }
        
        // Set as current community
        currentCommunity = community;
        localStorage.setItem('currentCommunity', JSON.stringify(community));
        
        showScreen(dashboardScreen);
        updateDashboard();
    } else {
        showNotification('Invalid community code', 'error');
    }
});

backFromJoinBtn.addEventListener('click', () => {
    showScreen(homeScreen);
});

// Dashboard Controls
createEventBtn.addEventListener('click', () => {
    // Check if user is admin of the current community
    if (currentUser.id === currentCommunity.adminId) {
        showScreen(createEventScreen);
    } else {
        showNotification('Only community admins can create events', 'error');
    }
});

scanRsvpBtn.addEventListener('click', () => {
    showScreen(scanRsvpScreen);
    initializeQRScanner();
    verificationResult.classList.add('hidden');
});




dashboardLogoutBtn.addEventListener('click', () => {
    logout();
});

// Create Event Form
createEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const location = document.getElementById('event-location').value;
    const description = document.getElementById('event-description').value;
    
    const events = JSON.parse(localStorage.getItem('events'));
    
    // Create new event
    const newEvent = {
        id: Date.now().toString(),
        communityId: currentCommunity.id,
        name,
        date,
        time,
        location,
        description,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    
    showNotification('Event created successfully!', 'success');
    showScreen(dashboardScreen);
    updateEventsList();
});

backFromCreateEventBtn.addEventListener('click', () => {
    showScreen(dashboardScreen);
});

// Event Details
backFromEventDetailsBtn.addEventListener('click', () => {
    showScreen(dashboardScreen);
});

// QR Scanner
verifyManualCodeBtn.addEventListener('click', () => {
    const code = manualCode.value.trim();
    if (code) {
        verifyRsvpCode(code);
        manualCode.value = '';
    } else {
        showNotification('Please enter a code', 'warning');
    }
});

backFromScanBtn.addEventListener('click', () => {
    if (html5QrCode) {
        try {
            html5QrCode.stop();
            console.log('Scanner stopped');
        } catch (error) {
            console.log('Error stopping scanner:', error);
        }
    }
    
    // Hide verification result if visible
    const verificationResult = document.getElementById('verification-result');
    if (verificationResult) {
        verificationResult.classList.add('hidden');
    }
    
    showScreen(dashboardScreen);
    updateDashboard();
    showNotification('Returned to dashboard', 'info');
});

// Fix for back button in verification result
document.addEventListener('click', (e) => {
    // Check if the clicked element is the back button or its icon inside verification result
    if (e.target.id === 'back-from-scan-result' || 
        (e.target.parentElement && e.target.parentElement.id === 'back-from-scan-result')) {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                showScreen(dashboardScreen);
            }).catch(err => {
                console.error('Failed to stop QR scanner:', err);
                showScreen(dashboardScreen);
            });
        } else {
            showScreen(dashboardScreen);
        }
    }
});

// Logout function
function logout() {
    currentUser = null;
    currentCommunity = null;
    currentEvent = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCommunity');
    localStorage.removeItem('lastActivity');
    clearTimeout(sessionTimeout);
    showScreen(loginScreen);
    showNotification('You have been logged out', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to DOM
    const notificationsContainer = document.getElementById('notifications-container') || createNotificationsContainer();
    notificationsContainer.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': 
        default: return 'fa-info-circle';
    }
}

function createNotificationsContainer() {
    const container = document.createElement('div');
    container.id = 'notifications-container';
    document.body.appendChild(container);
    return container;
}

// On login or registration, show/hide create community button based on user role
function updateHomeScreenButtons() {
    if (currentUser && currentUser.isAdmin) {
        createCommunityBtn.style.display = 'inline-block';
    } else {
        createCommunityBtn.style.display = 'none';
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing storage...');
    initializeStorage();
});