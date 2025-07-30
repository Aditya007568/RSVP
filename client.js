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
    }
};

// Make API available globally
window.api = api;