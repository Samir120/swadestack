# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

Most endpoints use JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

---

## Endpoints

### 1. Portfolio

#### GET /portfolio
Get all published portfolio items

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

#### GET /portfolio/featured
Get featured portfolio items

**Query Parameters:**
- `limit` (number): Number of items (default: 6)

#### GET /portfolio/:id
Get single portfolio item by ID

#### GET /portfolio/categories
Get all portfolio categories

#### POST /portfolio (Admin)
Create new portfolio item

**Request Body:**
```json
{
  "title_en": "Project Title",
  "title_sv": "Projekt Titel",
  "description_en": "Description...",
  "description_sv": "Beskrivning...",
  "category": "web-development",
  "techStack": ["React", "Node.js"],
  "projectUrl": "https://example.com",
  "imageUrl": "https://...",
  "featured": false,
  "isPublished": true
}
```

#### PUT /portfolio/:id (Admin)
Update portfolio item

#### DELETE /portfolio/:id (Admin)
Delete portfolio item

#### PATCH /portfolio/:id/toggle-featured (Admin)
Toggle featured status

---

### 2. Services

#### GET /services
Get all active services

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "name_en": "Landing Page Design",
        "name_sv": "Landningssida Design",
        "desc_en": "Description...",
        "desc_sv": "Beskrivning...",
        "price": 15000,
        "currency": "SEK",
        "features_en": ["Feature 1", "Feature 2"],
        "features_sv": ["Funktion 1", "Funktion 2"],
        "category": "web-design",
        "imageUrl": "https://...",
        "isActive": true
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

#### GET /services/:id
Get single service by ID

#### GET /services/categories
Get all service categories

#### POST /services (Admin)
Create new service

**Request Body:**
```json
{
  "name_en": "Service Name",
  "name_sv": "Tjänst Namn",
  "desc_en": "Description...",
  "desc_sv": "Beskrivning...",
  "price": 25000,
  "currency": "SEK",
  "features_en": ["Feature 1", "Feature 2"],
  "features_sv": ["Funktion 1", "Funktion 2"],
  "category": "web-development",
  "imageUrl": "https://...",
  "isActive": true
}
```

#### PUT /services/:id (Admin)
Update service

#### DELETE /services/:id (Admin)
Delete service

#### PATCH /services/:id/toggle-active (Admin)
Toggle active status

---

### 3. Orders

#### POST /orders
Create a new order

**Request Body:**
```json
{
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "city": "Stockholm",
  "postalCode": "12345",
  "country": "SE",
  "items": [
    {
      "serviceId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-ABC123",
    "totalAmount": 15000,
    "status": "pending",
    "currency": "SEK",
    "email": "customer@example.com",
    "items": [ ... ]
  }
}
```

#### POST /orders/payment-intent
Create Stripe payment intent

**Request Body:**
```json
{
  "orderId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_...",
    "paymentIntentId": "pi_..."
  }
}
```

#### POST /orders/webhook
Stripe webhook endpoint (Stripe signature required)

#### GET /orders/:id
Get order by ID

#### GET /orders/number/:orderNumber
Get order by order number

#### GET /orders (Admin)
Get all orders

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (pending/paid/cancelled/completed)

#### GET /orders/stats/summary (Admin)
Get order statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "pending": 5,
    "paid": 80,
    "completed": 10,
    "cancelled": 5,
    "totalRevenue": 1250000
  }
}
```

#### PATCH /orders/:id/status (Admin)
Update order status

**Request Body:**
```json
{
  "status": "paid",
  "paymentId": "pi_..."
}
```

#### POST /orders/:id/cancel (Admin)
Cancel order

---

### 4. Authentication

#### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "jwt_token..."
  }
}
```

#### POST /auth/login
User login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token..."
  }
}
```

#### GET /auth/profile (Authenticated)
Get current user profile

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /auth/change-password (Authenticated)
Change user password

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

---

### 5. Contact

#### POST /contact
Send contact message

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry about services",
  "message": "I'm interested in..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully. We will get back to you soon!"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Error Examples

### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Resource not found"
}
```
