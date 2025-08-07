// Client-side API integration

const API_URL = 'http://localhost:3000/api';

// Check if we're running in server mode
const isServerMode = () => {
    // For now, always use local storage mode until server is properly configured
    return false;
    
    // Original logic (commented out)
    // return window.location.hostname !== '' && window.location.hostname !== 'localhost' || 
    //        window.location.port === '3000';
};

// API Functions for Users
async function apiGetUsers() {
    if (!isServerMode()) return JSON.parse(localStorage.getItem('users') || '[]');
    
    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

async function apiCreateUser(user) {
    if (!isServerMode()) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Failed to create user');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiLogin(email, password) {
    if (!isServerMode()) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.email === email && u.password === password) || null;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// API Functions for Communities
async function apiGetCommunities() {
    if (!isServerMode()) return JSON.parse(localStorage.getItem('communities') || '[]');
    
    try {
        const response = await fetch(`${API_URL}/communities`);
        if (!response.ok) throw new Error('Failed to fetch communities');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

async function apiCreateCommunity(community) {
    if (!isServerMode()) {
        const communities = JSON.parse(localStorage.getItem('communities') || '[]');
        communities.push(community);
        localStorage.setItem('communities', JSON.stringify(communities));
        return community;
    }
    
    try {
        const response = await fetch(`${API_URL}/communities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(community)
        });
        if (!response.ok) throw new Error('Failed to create community');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiGetCommunityByCode(code) {
    if (!isServerMode()) {
        const communities = JSON.parse(localStorage.getItem('communities') || '[]');
        return communities.find(c => c.code === code) || null;
    }
    
    try {
        const response = await fetch(`${API_URL}/communities/${code}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// API Functions for Events
async function apiGetCommunityEvents(communityId) {
    if (!isServerMode()) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        return events.filter(event => event.communityId === communityId);
    }
    
    try {
        const response = await fetch(`${API_URL}/communities/${communityId}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

async function apiCreateEvent(event) {
    if (!isServerMode()) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        return event;
    }
    
    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        if (!response.ok) throw new Error('Failed to create event');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// API Functions for RSVPs
async function apiGetEventRSVPs(eventId) {
    if (!isServerMode()) {
        const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
        return rsvps.filter(rsvp => rsvp.eventId === eventId);
    }
    
    try {
        const response = await fetch(`${API_URL}/events/${eventId}/rsvps`);
        if (!response.ok) throw new Error('Failed to fetch RSVPs');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

async function apiCreateRSVP(rsvp) {
    if (!isServerMode()) {
        const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
        rsvps.push(rsvp);
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
        return rsvp;
    }
    
    try {
        const response = await fetch(`${API_URL}/rsvps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rsvp)
        });
        if (!response.ok) throw new Error('Failed to create RSVP');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiVerifyRSVP(code, scannedBy) {
    if (!isServerMode()) {
        const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
        const rsvp = rsvps.find(r => r.code === code);
        if (rsvp) {
            rsvp.scanned = true;
            rsvp.scanTimestamp = new Date().toISOString();
            rsvp.scannedBy = scannedBy;
            localStorage.setItem('rsvps', JSON.stringify(rsvps));
        }
        return rsvp || null;
    }
    
    try {
        const response = await fetch(`${API_URL}/rsvps/${code}/scan`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scannedBy })
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiGetRSVPByCode(code) {
    if (!isServerMode()) {
        const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
        return rsvps.find(r => r.code === code) || null;
    }
    
    try {
        const response = await fetch(`${API_URL}/rsvps/${code}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// File Management API Functions
async function apiUploadEventFiles(eventId, files) {
    if (!isServerMode()) {
        console.log('File upload not available in client-only mode');
        return { error: 'File upload requires server mode' };
    }

    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        // Assuming currentUser is available globally or passed as an argument
        // For now, using a placeholder or assuming it's handled by the server
        // In a real app, you'd fetch the current user's ID or pass it in the headers
        const userId = 'admin'; // Placeholder, replace with actual user ID
        formData.append('userId', userId);

        const response = await fetch(`${API_URL}/events/${eventId}/files`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
}

async function apiGetEventFiles(eventId) {
    if (!isServerMode()) {
        console.log('File retrieval not available in client-only mode');
        return [];
    }

    try {
        const response = await fetch(`${API_URL}/events/${eventId}/files`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting event files:', error);
        return [];
    }
}

async function apiDownloadFile(fileId) {
    if (!isServerMode()) {
        console.log('File download not available in client-only mode');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/files/${fileId}/download`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
}

async function apiDeleteFile(fileId) {
    if (!isServerMode()) {
        console.log('File deletion not available in client-only mode');
        return { error: 'File deletion requires server mode' };
    }

    try {
        const response = await fetch(`${API_URL}/files/${fileId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// Export all API functions
const api = {
    isServerMode,
    users: {
        getAll: apiGetUsers,
        create: apiCreateUser,
        login: apiLogin
    },
    communities: {
        getAll: apiGetCommunities,
        create: apiCreateCommunity,
        getByCode: apiGetCommunityByCode
    },
    events: {
        getByCommunity: apiGetCommunityEvents,
        create: apiCreateEvent
    },
    rsvps: {
        getByEvent: apiGetEventRSVPs,
        create: apiCreateRSVP,
        verify: apiVerifyRSVP,
        getByCode: apiGetRSVPByCode
    },
    files: {
        upload: apiUploadEventFiles,
        getByEvent: apiGetEventFiles,
        download: apiDownloadFile,
        delete: apiDeleteFile
    }
};

// Make API available globally
window.api = api;