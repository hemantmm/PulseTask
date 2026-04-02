# PulseTask: Video Upload, Sensitivity Processing, and Streaming Platform

A full-stack multi-tenant video platform built with Node.js, Express, MongoDB, React, and Vite.

## Features

- JWT authentication and role-based access control (`viewer`, `editor`, `admin`)
- Multi-tenant data isolation (`tenantId` based segregation)
- Video upload with validation and metadata capture
- Sensitivity processing pipeline (safe/flagged classification)
- Real-time processing progress updates using Socket.io
- HTTP range-based video streaming for efficient playback
- Admin user management for tenant users
- Video listing with filtering by status and sensitivity

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT auth
- Multer for file upload

### Frontend
- React + Vite
- React Router
- Context API for auth state
- Axios + Socket.io client

## Project Structure

- `backend/` - API server, persistence, processing pipeline, streaming
- `frontend/` - React app UI for auth, upload, dashboard, and admin tools
- `docs/` - architecture, API docs, user manual, assumptions

## Quick Start

## 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

## 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 3. Local MongoDB

Start MongoDB locally or update `MONGODB_URI` in `backend/.env` to a MongoDB Atlas connection string.

## Workflow Demo

1. Register a user (`tenantId` required)
2. Login and open dashboard
3. Upload video (editor/admin)
4. Watch real-time processing progress
5. Observe final sensitivity status (`safe` or `flagged`)
6. Stream processed video
7. Manage users as admin

## Testing

Backend includes a basic test for critical service availability:

```bash
cd backend
npm test
```

## Important Notes

- Streaming endpoint requires authentication and supports browser playback using token query fallback.
- Uploaded media is stored in `backend/uploads`.
- Current sensitivity analysis implementation is a deterministic simulation hook designed to be replaced by an ML pipeline.

## Deployment Guidance

- Frontend: Vercel/Netlify
- Backend: Render/Railway/Heroku
- Database: MongoDB Atlas
- For production, use cloud object storage (S3/GCS/Azure Blob) instead of local disk.
