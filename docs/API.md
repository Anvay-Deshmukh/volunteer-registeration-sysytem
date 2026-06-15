# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

---

## Authentication Endpoints

### Sign Up
```
POST /auth/signup
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "uid": "user-id"
}
```

---

### Login
```
POST /auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "firebase-id-token"
}
```

---

### Forgot Password
```
POST /auth/forgot-password
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent to email"
}
```

---

### Verify Email
```
POST /auth/verify-email
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent"
}
```

---

### Logout
```
POST /auth/logout
```
**Authorization:** Required

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Volunteer Endpoints

### Register Volunteer
```
POST /volunteers
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "skills": ["Teaching", "Mentoring"],
  "interests": ["Education", "Youth"],
  "availability": ["Weekends", "Evenings"],
  "experience": "5 years of volunteer work"
}
```

**Response:**
```json
{
  "message": "Volunteer registered successfully",
  "volunteerId": "vol-123"
}
```

---

### Get All Volunteers
```
GET /volunteers
```
**Authorization:** Required

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected)
- `skill` (optional): Filter by skill
- `city` (optional): Filter by city

**Response:**
```json
{
  "message": "Volunteers fetched successfully",
  "volunteers": [
    {
      "id": "vol-123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "status": "approved"
    }
  ]
}
```

---

### Get Volunteer by ID
```
GET /volunteers/:id
```
**Authorization:** Required

**Response:**
```json
{
  "message": "Volunteer fetched successfully",
  "volunteer": { /* volunteer object */ }
}
```

---

### Update Volunteer Profile
```
PUT /volunteers/:id
```
**Authorization:** Required

**Request Body:**
```json
{
  "phone": "555-5678",
  "skills": ["Teaching", "Writing"]
}
```

**Response:**
```json
{
  "message": "Volunteer updated successfully"
}
```

---

### Delete Volunteer
```
DELETE /volunteers/:id
```
**Authorization:** Required (Admin only)

**Response:**
```json
{
  "message": "Volunteer deleted successfully"
}
```

---

## Admin Endpoints

### Get Dashboard Stats
```
GET /admin/dashboard
```
**Authorization:** Required (Admin only)

**Response:**
```json
{
  "message": "Dashboard stats retrieved",
  "data": {
    "totalVolunteers": 150,
    "activeVolunteers": 85,
    "pendingRegistrations": 12,
    "totalHours": 3240,
    "averageRating": 4.5
  }
}
```

---

### Approve Volunteer
```
POST /admin/volunteers/:id/approve
```
**Authorization:** Required (Admin only)

**Request Body:**
```json
{
  "notes": "Background check passed"
}
```

**Response:**
```json
{
  "message": "Volunteer approved successfully"
}
```

---

### Reject Volunteer
```
POST /admin/volunteers/:id/reject
```
**Authorization:** Required (Admin only)

**Request Body:**
```json
{
  "reason": "Background check failed"
}
```

**Response:**
```json
{
  "message": "Volunteer rejected"
}
```

---

### Assign Volunteer to Project
```
POST /admin/assign-project
```
**Authorization:** Required (Admin only)

**Request Body:**
```json
{
  "volunteerId": "vol-123",
  "projectId": "proj-456",
  "role": "Team Member"
}
```

**Response:**
```json
{
  "message": "Volunteer assigned to project successfully"
}
```

---

## Report Endpoints

### Generate Volunteer Report
```
GET /reports/volunteers
```
**Authorization:** Required (Admin only)

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `status` (optional): Filter by status

**Response:**
```json
{
  "message": "Volunteer report generated",
  "data": {
    "totalVolunteers": 150,
    "byStatus": { /* stats */ },
    "generatedAt": "2024-06-15"
  }
}
```

---

### Get Activity Report
```
GET /reports/activities
```
**Authorization:** Required (Admin only)

**Response:**
```json
{
  "message": "Activity report generated",
  "data": {
    "totalActivities": 500,
    "hoursLogged": 3240,
    "activeVolunteers": 85,
    "generatedAt": "2024-06-15"
  }
}
```

---

### Get Statistics
```
GET /reports/statistics
```
**Authorization:** Required (Admin only)

**Response:**
```json
{
  "message": "Statistics retrieved",
  "data": {
    "totalVolunteers": 150,
    "totalHours": 3240,
    "averageHoursPerVolunteer": 21.6,
    "volunteerGrowth": [ /* monthly growth data */ ]
  }
}
```

---

### Export as CSV
```
GET /reports/export-csv
```
**Authorization:** Required (Admin only)

**Response:** File download (CSV format)

---

### Export as PDF
```
GET /reports/export-pdf
```
**Authorization:** Required (Admin only)

**Response:** File download (PDF format)

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

---

## Pagination

List endpoints support pagination with query parameters:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Example:
```
GET /volunteers?page=2&limit=50
```

Response includes:
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```
