# Cure Connect - Healthcare Appointment System

## Project Overview
Cure Connect is a comprehensive healthcare appointment management system built with Angular. The application provides secure patient-doctor scheduling with JWT authentication and role-based access control.

## Tech Stack
- **Frontend**: Angular 18
- **Styling**: Bootstrap 5, SCSS
- **Authentication**: JWT tokens with HTTP interceptor
- **Real-time**: Socket.IO client for chat functionality
- **Backend**: Spring Boot (separate - not included in this frontend project)

## Project Structure
```
cure-connect/
├── src/
│   ├── app/
│   │   ├── core/              # Core services, guards, interceptors
│   │   │   ├── guards/        # Auth guard
│   │   │   ├── interceptors/  # JWT interceptor
│   │   │   ├── services/      # Auth, API, Chat services
│   │   │   └── models/        # Data models
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Login/Register
│   │   │   ├── patient/       # Patient dashboard and features
│   │   │   ├── doctor/        # Doctor dashboard and features
│   │   │   └── admin/         # Admin dashboard and features
│   │   └── shared/            # Shared components
│   ├── assets/                # Static assets
│   └── environments/          # Environment configs
├── angular.json               # Angular CLI config
└── package.json              # Dependencies
```

## Features Implemented

### Authentication
- Login/Register screens with form validation
- JWT token management
- HTTP interceptor for automatic token attachment
- Role-based access control (PATIENT, DOCTOR, ADMIN)
- Auth guard protecting routes

### Patient Features
- Dashboard with upcoming appointments and prescriptions
- Multi-step appointment booking flow (doctor search → slot selection → confirmation)
- Appointment list with filters (Upcoming, Past, Cancelled)
- Prescription viewer
- **Real-time WebSocket chat** with doctors

### Doctor Features
- Dashboard with today's schedule and pending appointments
- Appointment list and management
- Time slot manager for availability (one-time and recurring slots)
- Medical notes editor for appointments
- **Real-time WebSocket chat** with patients

### Admin Features
- Dashboard with system statistics
- User management (create, view, manage users)
- Role assignment

## Backend Configuration

### API Configuration
The frontend is configured to connect to a Spring Boot backend at:
- **API URL**: `http://localhost:8080/api`
- **WebSocket URL**: `http://localhost:8080`

To change the backend URL, edit `src/environments/environment.ts`.

### WebSocket Chat Configuration ⚠️ IMPORTANT

The chat feature uses **Socket.IO client** to connect to the backend. You have two options:

**Option 1: Configure Spring Boot to use Socket.IO (Recommended)**
- Add Socket.IO support to your Spring Boot backend
- Use a library like `netty-socketio` or similar
- Configure the endpoint to match `environment.wsUrl`

**Option 2: Switch to STOMP/SockJS Client**
- If your Spring Boot backend uses standard WebSocket/STOMP
- Replace Socket.IO client with SockJS/STOMP client in `ChatService`
- Update the WebSocket connection logic to use Spring's WebSocket protocol

Example Socket.IO events the backend should handle:
```typescript
// Client sends:
socket.emit('sendMessage', { appointmentId, message, senderId, senderName, timestamp });
socket.emit('getChatHistory', { appointmentId });

// Client listens for:
socket.on('message', (chatMessage) => { ... });
socket.on('chatHistory', (history[]) => { ... });
```

## Running the Application
The Angular development server is configured to:
- Run on port 5000
- Allow all hosts
- Hot reload on file changes

Command: `npm start`

## API Integration
All API calls are made through the `ApiService` which provides:
- GET, POST, PUT, PATCH, DELETE methods
- Automatic JWT token attachment via interceptor
- Error handling with automatic logout on 401

## WebSocket Chat Integration
The `ChatService` provides:
- Real-time message sending and receiving
- Automatic connection management
- Chat history loading (waits for connection to establish)
- Reconnection handling
- Clean disconnect on component destroy

## User Roles
- **PATIENT**: Can book appointments, view prescriptions, chat with doctors
- **DOCTOR**: Can manage appointments, set availability, add medical notes, chat with patients
- **ADMIN**: Can manage all users and view system statistics

## Development Notes

### WebSocket Chat
The chat service properly waits for the WebSocket connection to establish before:
1. Loading chat history
2. Sending messages

This prevents race conditions and ensures reliable message delivery.

### Time Slot Management
Doctors can create:
- **One-time slots**: Specific date and time
- **Recurring slots**: Weekly recurring availability

### Appointment Booking
Patients see available slots organized by:
- Doctor's specialization
- Date and time
- Visual card-based selection

## Next Steps for Production
1. ✅ Configure your Spring Boot backend WebSocket endpoint
2. ✅ Update `environment.ts` with your backend URLs
3. Test authentication flow end-to-end
4. Verify WebSocket chat connectivity
5. Test all user roles and permissions
6. Add production environment configuration
7. Set up error tracking and logging
8. Implement file upload for prescriptions (optional)
9. Add appointment notifications (optional)
10. Integrate calendar library for enhanced views (optional)
