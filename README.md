# Track-Mate Application

A lightweight web application for managing community events and RSVPs. This application allows users to create communities, organize events, and manage attendees through a unique RSVP code system.

## Features

### Community Management
- Create new communities with admin privileges
- Join existing communities using community codes
- Each community has its own events and members

### Event Management
- Create events with details like name, description, date, time, location, and capacity
- View upcoming events in the community dashboard
- RSVP to events you want to attend

### RSVP System
- Generate unique RSVP codes for each attendee
- QR code generation for easy check-in
- Scan QR codes at the event entrance to verify attendance
- Manual code entry option for backup

## Setup Instructions

### Client-Only Mode (Local Storage)
1. Clone or download this repository to your local machine
2. Open the `index.html` file in a web browser
3. The application will use local storage for data persistence

### Server Mode with NeonDB Integration
1. Clone or download this repository to your local machine
2. Install Node.js and npm if not already installed
3. Create a `.env` file in the root directory with your NeonDB credentials:
   ```
   # NeonDB Configuration
   DB_HOST=your-neon-host.aws.neon.tech
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Set up the database schema:
   ```bash
   # Connect to your NeonDB instance and run the schema.sql file
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f schema.sql
   ```
6. Start the server:
   ```bash
   npm start
   ```
7. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Creating a Community
1. Click "Create a Community" on the home screen
2. Fill in the community details and admin information
3. Submit the form to create your community
4. Share the generated community code with others who want to join

### Joining a Community
1. Click "Join a Community" on the home screen
2. Enter the community code provided by the community admin
3. Fill in your personal details
4. Submit the form to join the community

### Creating an Event
1. Log in as a community admin
2. Click "Create New Event" on the dashboard
3. Fill in the event details
4. Submit the form to create your event

### RSVPing to an Event
1. Click on an event from the dashboard
2. Click the "RSVP to this Event" button
3. Save your unique RSVP code or take a screenshot of the QR code
4. Present this code when you arrive at the event

### Checking in Attendees (Admin Only)
1. Click on the event from the dashboard
2. Click "Scan RSVP Codes"
3. Use the camera to scan attendee QR codes or enter the code manually
4. The system will verify the code and mark the attendee as checked in

## Technical Details

### Client-Side
- Built with vanilla HTML, CSS, and JavaScript
- Uses local storage for data persistence in client-only mode
- Integrates QR code generation and scanning libraries
- Responsive design for mobile and desktop use
- SheetJS library for Excel export functionality

### Server-Side
- Node.js with Express backend
- PostgreSQL database (NeonDB) for data persistence
- RESTful API for client-server communication
- Environment variable configuration for secure credential management

## Future Enhancements

- Enhanced security with password hashing and JWT authentication
- Email notifications for event updates and reminders
- Seat assignment functionality for events
- Event analytics and reporting dashboards
- Image upload for event banners and user profiles
- Calendar integration (Google Calendar, iCal)
- Social media sharing for events
- Recurring event scheduling