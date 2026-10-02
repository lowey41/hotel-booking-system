# StayWise API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require: `Authorization: Bearer <access_token>`

---

## Authentication Endpoints

### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "role": "USER"  // USER | HOTEL_OWNER
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "USER" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### POST /auth/login
Sign in with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

---

### POST /auth/refresh
Refresh the access token.

**Request Body:**
```json
{ "refreshToken": "eyJ..." }
```

---

## Hotel Endpoints

### GET /hotels
List all approved hotels with optional filters.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| search | string | Full-text search |
| city | string | Filter by city |
| country | string | Filter by country |
| minPrice | number | Minimum room price |
| maxPrice | number | Maximum room price |
| rating | number | Minimum star rating (1-5) |
| amenities | string | Comma-separated list |
| sortBy | string | createdAt, starRating |
| sortOrder | string | asc, desc |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 12) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "hotels": [...],
    "pagination": { "page": 1, "limit": 12, "total": 48, "pages": 4 }
  }
}
```

---

### GET /hotels/:id
Get detailed hotel information including rooms and reviews.

---

### GET /hotels/availability
Check room availability for specific dates.

**Query Parameters:**
- `hotelId` (required)
- `checkIn` (required) — ISO date string
- `checkOut` (required) — ISO date string

---

### GET /hotels/recommendations
Get AI-powered hotel recommendations (personalized if authenticated).

---

## Booking Endpoints (Authentication Required)

### POST /bookings
Create a new booking and get a Stripe payment intent.

**Request Body:**
```json
{
  "hotelId": "clx...",
  "roomId": "clx...",
  "checkIn": "2026-06-15T00:00:00.000Z",
  "checkOut": "2026-06-20T00:00:00.000Z",
  "guests": 2,
  "specialRequests": "Late check-in please"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "booking": { ... },
    "clientSecret": "pi_..._secret_...",
    "nights": 5,
    "totalPrice": 1750
  }
}
```

---

### POST /bookings/:bookingId/confirm
Confirm a booking after successful Stripe payment.

**Request Body:**
```json
{ "paymentIntentId": "pi_..." }
```

---

### PUT /bookings/:id/cancel
Cancel a booking. Refund amount depends on cancellation timing.

---

## User Endpoints (Authentication Required)

### GET /users/profile
Get current user's profile.

### PUT /users/profile
Update profile (name, phone, avatar).

### GET /users/wishlist
Get user's saved hotels.

### POST /users/wishlist/:hotelId
Toggle hotel in/out of wishlist.

---

## Admin Endpoints (Admin Role Required)

### GET /admin/stats
Platform-wide statistics (users, hotels, bookings, revenue).

### GET /admin/users
List all users.

### GET /admin/hotels
List all hotels (including pending/rejected).

### PUT /admin/hotels/:id/status
Update hotel status.

**Request Body:**
```json
{ "status": "APPROVED" }  // APPROVED | REJECTED | SUSPENDED
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` — Bad request / validation error
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (insufficient permissions)
- `404` — Resource not found
- `409` — Conflict (duplicate resource)
- `429` — Too many requests (rate limited)
- `500` — Internal server error

---

## WebSocket Events

Connect to `ws://localhost:5000` with auth token:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your_access_token' }
});

// Listen for events
socket.on('notification', (data) => { ... });
socket.on('booking:update', (data) => { ... });

// Join hotel room for live updates
socket.emit('join:hotel', hotelId);
```
