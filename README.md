# 🎓 Smart Campus 360 — MERN Stack

Complete campus management system with Student, Faculty & Admin roles.

## Features
- 🔐 JWT Authentication (3 roles: student, faculty, admin)
- ⚠️ Smart Complaint Management
- 📅 Events with Registration
- 📢 Announcements (targeted by role)
- 📚 Resources/Study Materials
- 👥 Admin User Management
- 📊 Role-based Dashboards

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React + Vite + React Router |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcryptjs |

## Project Structure
```
smartcampus360/
├── server/          ← Express API
│   ├── models/      ← MongoDB schemas
│   ├── routes/      ← API routes
│   ├── middleware/  ← JWT auth
│   ├── server.js    ← Entry point
│   ├── seed.js      ← Demo data
│   └── .env         ← Config
└── client/          ← React app
    └── src/
        ├── pages/   ← All pages
        ├── components/
        ├── context/ ← Auth context
        └── services/← Axios API
```

## Setup — Step by Step

### 1. Backend
```bash
cd server
npm install
```

Edit `.env` — set your MongoDB URI:
```
MONGO_URI=mongodb://localhost:27017/smartcampus360
```
(or your Atlas URI)

```bash
# Seed demo users
node seed.js

# Start server
npm run dev
```
Server runs on: http://localhost:5000

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

## Demo Login Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@campus.edu | admin123 |
| Faculty | faculty@campus.edu | faculty123 |
| Student | student@campus.edu | student123 |

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/dashboard/stats | Dashboard stats |
| GET/POST | /api/complaints | Complaints |
| PUT | /api/complaints/:id | Update status |
| GET/POST | /api/events | Events |
| POST | /api/events/:id/register | Register for event |
| GET/POST | /api/announcements | Announcements |
| GET/POST | /api/resources | Resources |
| GET | /api/users | All users (admin) |
