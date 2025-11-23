# Ticket API Testing Guide

This document provides example requests for testing all ticket endpoints.

## Base URL
```
http://localhost:4000/api/tickets
```

---

## 1. GET /api/tickets - List all tickets

### Basic request (get all tickets)
```bash
curl http://localhost:4000/api/tickets
```

### Filter by status
```bash
curl "http://localhost:4000/api/tickets?status=OPEN"
curl "http://localhost:4000/api/tickets?status=IN_PROGRESS"
curl "http://localhost:4000/api/tickets?status=RESOLVED"
curl "http://localhost:4000/api/tickets?status=CLOSED"
```

### Filter by propertyId
```bash
curl "http://localhost:4000/api/tickets?propertyId=1"
```

### Filter by unitId
```bash
curl "http://localhost:4000/api/tickets?unitId=1"
```

### Filter by tenantId
```bash
curl "http://localhost:4000/api/tickets?tenantId=1"
```

### Filter by assignedTo (user ID)
```bash
curl "http://localhost:4000/api/tickets?assignedTo=3"
```

### Combine multiple filters
```bash
curl "http://localhost:4000/api/tickets?status=OPEN&propertyId=1"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "unitId": 1,
    "tenantId": 1,
    "title": "Leaking faucet in kitchen",
    "description": "The kitchen faucet has been dripping...",
    "priority": "HIGH",
    "status": "OPEN",
    "assignedToId": 3,
    "createdAt": "2024-11-23T...",
    "updatedAt": "2024-11-23T...",
    "unit": {
      "id": 1,
      "propertyId": 1,
      "unitNumber": "101",
      "status": "OCCUPIED",
      "property": {
        "id": 1,
        "name": "Sunset Villas",
        "address": "123 Main St"
      }
    },
    "tenant": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "210-555-0101"
    },
    "assignedTo": {
      "id": 3,
      "email": "staff@leaselink.com",
      "role": "STAFF"
    },
    "comments": [
      {
        "id": 1,
        "ticketId": 1,
        "authorId": 3,
        "body": "I will check this out tomorrow morning.",
        "createdAt": "2024-11-23T...",
        "author": {
          "id": 3,
          "email": "staff@leaselink.com",
          "role": "STAFF"
        }
      }
    ]
  }
]
```

---

## 2. GET /api/tickets/:id - Get single ticket

```bash
curl http://localhost:4000/api/tickets/1
```

**Expected Response (200 OK):** Same structure as individual ticket above

**Error Cases:**
```bash
# Invalid ID
curl http://localhost:4000/api/tickets/abc
# Response: 400 Bad Request
# {"message":"Invalid ticket id"}

# Non-existent ticket
curl http://localhost:4000/api/tickets/999
# Response: 404 Not Found
# {"message":"Ticket not found"}
```

---

## 3. POST /api/tickets - Create a new ticket

### Valid request
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": 1,
    "tenantId": 1,
    "title": "Broken window in bedroom",
    "description": "The window latch is broken and won'\''t stay closed.",
    "priority": "MEDIUM",
    "assignedToId": 3
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 4,
  "unitId": 1,
  "tenantId": 1,
  "title": "Broken window in bedroom",
  "description": "The window latch is broken and won't stay closed.",
  "priority": "MEDIUM",
  "status": "OPEN",
  "assignedToId": 3,
  "createdAt": "2024-11-23T...",
  "updatedAt": "2024-11-23T...",
  "unit": { ... },
  "tenant": { ... },
  "assignedTo": { ... }
}
```

### Without assignedToId (optional)
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": 2,
    "tenantId": 1,
    "title": "Request for parking pass",
    "description": "Need a second parking pass for guest parking."
  }'
```

### Error Cases

**Missing required fields:**
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": 1,
    "title": "Test ticket"
  }'
# Response: 400 Bad Request
# {"message":"unitId, tenantId, title, and description are required"}
```

**Invalid priority:**
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": 1,
    "tenantId": 1,
    "title": "Test",
    "description": "Test",
    "priority": "SUPER_HIGH"
  }'
# Response: 400 Bad Request
# {"message":"Invalid priority. Must be one of: LOW, MEDIUM, HIGH, URGENT"}
```

**Non-existent unit:**
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": 999,
    "tenantId": 1,
    "title": "Test",
    "description": "Test"
  }'
# Response: 404 Not Found
# {"message":"Unit not found"}
```

**Non-existent tenant:**
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": 1,
    "tenantId": 999,
    "title": "Test",
    "description": "Test"
  }'
# Response: 404 Not Found
# {"message":"Tenant not found"}
```

**Non-existent assigned user:**
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": 1,
    "tenantId": 1,
    "title": "Test",
    "description": "Test",
    "assignedToId": 999
  }'
# Response: 404 Not Found
# {"message":"Assigned user not found"}
```

---

## 4. PATCH /api/tickets/:id - Update ticket status or assignment

### Update status
```bash
curl -X PATCH http://localhost:4000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### Update assignment
```bash
curl -X PATCH http://localhost:4000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToId": 2
  }'
```

### Unassign a ticket (set to null)
```bash
curl -X PATCH http://localhost:4000/api/tickets/3 \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToId": null
  }'
```

### Update both status and assignment
```bash
curl -X PATCH http://localhost:4000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "assignedToId": 2
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "unitId": 1,
  "tenantId": 1,
  "title": "Leaking faucet in kitchen",
  "description": "The kitchen faucet has been dripping...",
  "priority": "HIGH",
  "status": "RESOLVED",
  "assignedToId": 2,
  "createdAt": "2024-11-23T...",
  "updatedAt": "2024-11-23T...",
  "unit": { ... },
  "tenant": { ... },
  "assignedTo": { ... },
  "comments": [ ... ]
}
```

### Error Cases

**Invalid status:**
```bash
curl -X PATCH http://localhost:4000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INVALID_STATUS"
  }'
# Response: 400 Bad Request
# {"message":"Invalid status. Must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED"}
```

**Invalid ticket ID:**
```bash
curl -X PATCH http://localhost:4000/api/tickets/abc \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CLOSED"
  }'
# Response: 400 Bad Request
# {"message":"Invalid ticket id"}
```

**No fields provided:**
```bash
curl -X PATCH http://localhost:4000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{}'
# Response: 400 Bad Request
# {"message":"No valid fields provided for update (status, assignedToId)"}
```

**Non-existent assigned user:**
```bash
curl -X PATCH http://localhost:4000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToId": 999
  }'
# Response: 404 Not Found
# {"message":"Assigned user not found"}
```

---

## 5. POST /api/tickets/:id/comments - Add a comment to a ticket

### Valid request
```bash
curl -X POST http://localhost:4000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": 3,
    "body": "Parts have been ordered. Will fix next week."
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 4,
  "ticketId": 1,
  "authorId": 3,
  "body": "Parts have been ordered. Will fix next week.",
  "createdAt": "2024-11-23T...",
  "author": {
    "id": 3,
    "email": "staff@leaselink.com",
    "role": "STAFF"
  }
}
```

### Error Cases

**Missing required fields:**
```bash
curl -X POST http://localhost:4000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Test comment"
  }'
# Response: 400 Bad Request
# {"message":"authorId and body are required"}
```

**Empty comment body:**
```bash
curl -X POST http://localhost:4000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": 3,
    "body": "   "
  }'
# Response: 400 Bad Request
# {"message":"Comment body cannot be empty"}
```

**Non-existent ticket:**
```bash
curl -X POST http://localhost:4000/api/tickets/999/comments \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": 3,
    "body": "Test comment"
  }'
# Response: 404 Not Found
# {"message":"Ticket not found"}
```

**Non-existent author:**
```bash
curl -X POST http://localhost:4000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": 999,
    "body": "Test comment"
  }'
# Response: 404 Not Found
# {"message":"Author not found"}
```

**Invalid ticket ID:**
```bash
curl -X POST http://localhost:4000/api/tickets/abc/comments \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": 3,
    "body": "Test"
  }'
# Response: 400 Bad Request
# {"message":"Invalid ticket id"}
```

---

## 6. DELETE /api/tickets/:id - Delete a ticket

```bash
curl -X DELETE http://localhost:4000/api/tickets/3
```

**Expected Response (204 No Content):** Empty response body

### Error Cases

**Invalid ticket ID:**
```bash
curl -X DELETE http://localhost:4000/api/tickets/abc
# Response: 400 Bad Request
# {"message":"Invalid ticket id"}
```

**Non-existent ticket:**
```bash
curl -X DELETE http://localhost:4000/api/tickets/999
# Response: 500 Internal Server Error
# {"message":"Failed to delete ticket"}
```

---

## Sample Data Reference

Based on the seed data:

### Users
- **ID 1**: admin@leaselink.com (ADMIN)
- **ID 2**: manager@leaselink.com (MANAGER)
- **ID 3**: staff@leaselink.com (STAFF)

### Properties
- **ID 1**: Sunset Villas (123 Main St)
- **ID 2**: Riverwalk Lofts (500 Riverwalk Ave)

### Units
- **ID 1**: Unit 101 at Sunset Villas (propertyId: 1)
- **ID 2**: Unit 102 at Sunset Villas (propertyId: 1)
- **ID 3**: Unit 201 at Riverwalk Lofts (propertyId: 2)

### Tenants
- **ID 1**: John Doe (john.doe@email.com) - Unit 101
- **ID 2**: Jane Smith (jane.smith@email.com) - Unit 201

### Tickets (seeded)
- **ID 1**: Leaking faucet - Unit 101, HIGH priority, OPEN, assigned to staff
- **ID 2**: AC not cooling - Unit 101, URGENT priority, IN_PROGRESS, assigned to manager
- **ID 3**: Lightbulb replacement - Unit 201, LOW priority, OPEN, unassigned

---

## Testing with Postman/Insomnia

Import these as a collection or use the curl commands above. Remember to:

1. Set base URL to `http://localhost:4000`
2. Set `Content-Type: application/json` header for POST/PATCH requests
3. Check response status codes match expectations
4. Verify response bodies contain expected data structures

---

## Valid Values

### Priority
- `LOW`
- `MEDIUM` (default)
- `HIGH`
- `URGENT`

### Status
- `OPEN` (default)
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`

### Role (for reference)
- `ADMIN`
- `MANAGER`
- `STAFF` (default)
