# API Documentation

Base URL: `http://localhost:4000/api`

## Authentication

### POST `/auth/register`
Creates a new user and returns JWT.

Request body:
```json
{
  "name": "Alice",
  "email": "alice@org.com",
  "password": "Password123",
  "tenantId": "org-a",
  "role": "editor"
}
```

### POST `/auth/login`
Authenticates an existing user.

Request body:
```json
{
  "email": "alice@org.com",
  "password": "Password123"
}
```

### GET `/auth/me`
Returns authenticated user profile.

Headers:
- `Authorization: Bearer <token>`

### GET `/auth/users` (admin)
Returns users in the same tenant.

### POST `/auth/users` (admin)
Creates a user in admin's tenant.

## Videos

### POST `/videos` (editor/admin)
Uploads a video file and metadata.

Content-Type: `multipart/form-data`
Fields:
- `video` (file)
- `title` (required)
- `description` (optional)
- `category` (optional)

Validation:
- Allowed extensions: `.mp4`, `.mov`, `.webm`, `.mkv`, `.avi`
- Size limit from env `MAX_FILE_SIZE_MB`

### GET `/videos`
Lists tenant-scoped videos.

Query params:
- `status`
- `sensitivity`
- `category`
- `q` (search)

### GET `/videos/:id`
Fetches one tenant-scoped video.

### DELETE `/videos/:id` (editor/admin)
Deletes a video (owner or admin).

### GET `/videos/:id/stream`
Streams processed video with HTTP range support.

Headers (preferred):
- `Authorization: Bearer <token>`

Alternative for browser `<video>` tags:
- `?token=<jwt>`

Response behavior:
- Returns `206 Partial Content` when `Range` header is provided.
- Returns `200` with full stream when no range header is present.

## Real-Time Events (Socket.io)

Client connects with:
- `auth: { token: '<jwt>' }`

Server event:
- `video:progress`

Payload:
```json
{
  "videoId": "...",
  "progress": 85,
  "status": "processing",
  "sensitivity": "unknown"
}
```
