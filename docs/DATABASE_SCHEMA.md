# Firestore Database Schema

## Collections

### 1. Volunteers Collection
Stores information about volunteers registered in the system.

```
volunteers/
├── {volunteerId}
│   ├── firstName: string
│   ├── lastName: string
│   ├── email: string (unique)
│   ├── phone: string
│   ├── address: string
│   ├── city: string
│   ├── state: string
│   ├── zipCode: string
│   ├── skills: array<string>
│   ├── interests: array<string>
│   ├── availability: array<string>
│   ├── experience: string
│   ├── status: string (pending, approved, rejected)
│   ├── hoursLogged: number
│   ├── rating: number
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── approvedAt: timestamp (optional)
│   ├── rejectionReason: string (optional)
```

### 2. Users Collection
Stores authentication and user account information.

```
users/
├── {userId}
│   ├── email: string (unique)
│   ├── displayName: string
│   ├── role: string (volunteer, admin)
│   ├── profileComplete: boolean
│   ├── lastLogin: timestamp
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
```

### 3. Projects Collection
Stores volunteer project/activity information.

```
projects/
├── {projectId}
│   ├── name: string
│   ├── description: string
│   ├── startDate: date
│   ├── endDate: date
│   ├── status: string (planned, active, completed)
│   ├── category: string
│   ├── requiredSkills: array<string>
│   ├── totalVolunteersNeeded: number
│   ├── assignedVolunteers: array<string> (volunteerId references)
│   ├── location: string
│   ├── createdBy: string (userId)
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
```

### 4. Assignments Collection
Tracks volunteer-to-project assignments.

```
assignments/
├── {assignmentId}
│   ├── volunteerId: string (reference to volunteers)
│   ├── projectId: string (reference to projects)
│   ├── role: string
│   ├── hoursLogged: number
│   ├── status: string (assigned, in-progress, completed)
│   ├── assignedAt: timestamp
│   ├── startDate: date
│   ├── endDate: date
│   ├── notes: string
│   ├── updatedAt: timestamp
```

### 5. Activities Collection
Logs volunteer activities and hour entries.

```
activities/
├── {activityId}
│   ├── volunteerId: string (reference to volunteers)
│   ├── projectId: string (reference to projects)
│   ├── hoursWorked: number
│   ├── date: date
│   ├── description: string
│   ├── type: string (work-hour, achievement, rating)
│   ├── createdAt: timestamp
│   ├── approvedBy: string (userId)
│   ├── status: string (pending, approved, rejected)
```

### 6. Reports Collection
Stores generated reports for auditing and analytics.

```
reports/
├── {reportId}
│   ├── type: string (volunteer, activity, statistics)
│   ├── filters: object
│   ├── data: object
│   ├── generatedBy: string (userId)
│   ├── generatedAt: timestamp
│   ├── startDate: date
│   ├── endDate: date
│   ├── fileUrl: string (optional)
```

### 7. Notifications Collection
Stores system notifications for users.

```
notifications/
├── {notificationId}
│   ├── userId: string (reference to users)
│   ├── type: string (registration, approval, assignment, reminder)
│   ├── title: string
│   ├── message: string
│   ├── read: boolean
│   ├── createdAt: timestamp
│   ├── actionUrl: string (optional)
```

## Firestore Indexes

For optimal query performance, create the following indexes:

### Composite Indexes

1. **Volunteers by Status and Created Date**
   - Collection: `volunteers`
   - Fields: `status` (Ascending), `createdAt` (Descending)

2. **Assignments by Project and Status**
   - Collection: `assignments`
   - Fields: `projectId` (Ascending), `status` (Ascending)

3. **Activities by Volunteer and Date**
   - Collection: `activities`
   - Fields: `volunteerId` (Ascending), `date` (Descending)

## Security Rules

See `firebase-rules.json` for Firestore security rules that ensure proper access control.

## Data Types

- **string**: Text data
- **number**: Numeric values (hours, ratings, etc.)
- **boolean**: True/false values
- **date**: Calendar date (YYYY-MM-DD)
- **timestamp**: Date and time with timezone
- **array<type>**: List of items of specified type
- **object**: Complex nested data structure
- **reference**: Link to another document

## Best Practices

1. Use subcollections for hierarchical relationships
2. Limit document size to keep reads efficient
3. Use composite indexes for complex queries
4. Implement proper security rules
5. Archive old data periodically
6. Use pagination for large result sets
