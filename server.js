const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false // Required for some cloud database providers
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Database connected successfully at:', res.rows[0].now);
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const eventId = req.params.eventId;
        const uploadDir = path.join(__dirname, 'uploads', eventId);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// API Routes

// Users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, is_admin FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users', async (req, res) => {
    const { name, email, password, isAdmin } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, is_admin',
            [name, email, password, isAdmin]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT id, name, email, is_admin FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Communities
app.get('/api/communities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM communities');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching communities:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/communities', async (req, res) => {
    const { name, description, code, adminId } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO communities (name, description, code, admin_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, code, adminId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating community:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/communities/:code', async (req, res) => {
    const { code } = req.params;
    
    try {
        const result = await pool.query('SELECT * FROM communities WHERE code = $1', [code]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Community not found' });
        }
    } catch (err) {
        console.error('Error fetching community:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Events
app.get('/api/communities/:communityId/events', async (req, res) => {
    const { communityId } = req.params;
    
    try {
        const result = await pool.query('SELECT * FROM events WHERE community_id = $1', [communityId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/events', async (req, res) => {
    const { communityId, name, date, time, location, description, createdBy } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO events (community_id, name, date, time, location, description, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [communityId, name, date, time, location, description, createdBy]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// RSVPs
app.get('/api/events/:eventId/rsvps', async (req, res) => {
    const { eventId } = req.params;
    
    try {
        const result = await pool.query('SELECT * FROM rsvps WHERE event_id = $1', [eventId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching RSVPs:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/rsvps', async (req, res) => {
    const { eventId, userId, userName, code } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO rsvps (event_id, user_id, user_name, code, scanned) VALUES ($1, $2, $3, $4, false) RETURNING *',
            [eventId, userId, userName, code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating RSVP:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/rsvps/:code/scan', async (req, res) => {
    const { code } = req.params;
    const { scannedBy } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE rsvps SET scanned = true, scan_timestamp = NOW(), scanned_by = $1 WHERE code = $2 RETURNING *',
            [scannedBy, code]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'RSVP not found' });
        }
    } catch (err) {
        console.error('Error updating RSVP:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/rsvps/:code', async (req, res) => {
    const { code } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT r.*, e.name as event_name, e.community_id FROM rsvps r JOIN events e ON r.event_id = e.id WHERE r.code = $1',
            [code]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'RSVP not found' });
        }
    } catch (err) {
        console.error('Error fetching RSVP:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// File upload endpoint
app.post('/api/events/:eventId/files', upload.array('files', 10), async (req, res) => {
    try {
        const { eventId } = req.params;
        const uploadedFiles = req.files;
        
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        // Save file metadata to database
        const fileRecords = uploadedFiles.map(file => ({
            eventId: eventId,
            filename: file.originalname,
            storedName: file.filename,
            filepath: file.path,
            size: file.size,
            mimetype: file.mimetype,
            uploadedBy: req.body.userId || 'admin',
            uploadedAt: new Date().toISOString()
        }));
        
        // Insert into database (you'll need to create this table)
        for (const fileRecord of fileRecords) {
            await pool.query(
                'INSERT INTO event_files (event_id, filename, stored_name, filepath, size, mimetype, uploaded_by, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [fileRecord.eventId, fileRecord.filename, fileRecord.storedName, fileRecord.filepath, fileRecord.size, fileRecord.mimetype, fileRecord.uploadedBy, fileRecord.uploadedAt]
            );
        }
        
        res.json({ 
            message: 'Files uploaded successfully',
            files: fileRecords.map(f => ({ id: f.id, filename: f.filename, size: f.size }))
        });
        
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
});

// Get event files
app.get('/api/events/:eventId/files', async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const result = await pool.query(
            'SELECT id, filename, size, mimetype, uploaded_by, uploaded_at FROM event_files WHERE event_id = $1 ORDER BY uploaded_at DESC',
            [eventId]
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ error: 'Failed to get files' });
    }
});

// Download file
app.get('/api/files/:fileId/download', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        const result = await pool.query(
            'SELECT filename, stored_name, filepath FROM event_files WHERE id = $1',
            [fileId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const file = result.rows[0];
        const filePath = path.join(__dirname, file.filepath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }
        
        res.download(filePath, file.filename);
        
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Delete file (admin only)
app.delete('/api/files/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        const result = await pool.query(
            'SELECT filepath FROM event_files WHERE id = $1',
            [fileId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const file = result.rows[0];
        const filePath = path.join(__dirname, file.filepath);
        
        // Delete from database
        await pool.query('DELETE FROM event_files WHERE id = $1', [fileId]);
        
        // Delete from filesystem
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json({ message: 'File deleted successfully' });
        
    } catch (error) {
        console.error('File delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});