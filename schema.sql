-- Database Schema for RSVP Application

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL, -- In production, use hashed passwords
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Communities Table
CREATE TABLE communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(10) UNIQUE NOT NULL,
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Members Table (Many-to-Many relationship)
CREATE TABLE community_members (
    community_id INTEGER REFERENCES communities(id),
    user_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id)
);

-- Events Table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id),
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RSVPs Table (Enhanced for check-in/check-out)
CREATE TABLE rsvps (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    scan_count INTEGER DEFAULT 0, -- Track number of scans (max 2)
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_out BOOLEAN DEFAULT FALSE,
    scanned_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Files Table (New table for file management)
CREATE TABLE event_files (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    filename VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    size BIGINT NOT NULL,
    mimetype VARCHAR(100),
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_events_community_id ON events(community_id);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX idx_rsvps_code ON rsvps(code);
CREATE INDEX idx_event_files_event_id ON event_files(event_id);