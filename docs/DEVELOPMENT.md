# Development Setup Guide

## Prerequisites

- **Node.js**: v14 or higher
- **npm** or **yarn**: For package management
- **Git**: For version control
- **Firebase CLI**: For local testing
- **VS Code** (recommended): Code editor

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd volunteer-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Firebase credentials
# Update: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, etc.

# Start development server
npm run dev
```

Server runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
EOF

# Start development server
npm start
```

App runs at: `http://localhost:3000`

### 4. Firebase Emulator Suite (Optional)

Install:
```bash
npm install -g firebase-tools
```

Start emulators:
```bash
firebase emulators:start
```

This allows testing without using actual Firebase resources.

---

## Project Structure

```
volunteer-system/
├── backend/
│   ├── controllers/          # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Authentication, validation
│   ├── utils/               # Helper functions
│   ├── server.js            # Express server
│   ├── package.json         # Dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and Firebase services
│   │   ├── utils/          # Helper functions
│   │   ├── App.js          # Main app component
│   │   └── App.css         # Global styles
│   ├── package.json        # Dependencies
│   └── public/             # Static assets
├── docs/
│   ├── API.md             # API documentation
│   ├── DATABASE_SCHEMA.md # Database schema
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── DEVELOPMENT.md     # This file
└── README.md              # Project overview
```

---

## Available Scripts

### Backend

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (irreversible)
npm run eject
```

---

## Coding Standards

### JavaScript/React

- Use **ES6+** syntax
- Use **functional components** and React Hooks
- Follow **camelCase** for variables and functions
- Use **PascalCase** for component names
- Write **JSDoc comments** for functions

Example:
```javascript
/**
 * Fetches volunteer by ID
 * @param {string} id - Volunteer ID
 * @returns {Promise<Object>} Volunteer data
 */
const getVolunteer = async (id) => {
  try {
    const response = await axios.get(`/api/volunteers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    throw error;
  }
};
```

### CSS

- Use **BEM naming convention**
- Group related styles together
- Use CSS variables for consistency
- Mobile-first approach

Example:
```css
.volunteer-card {
  padding: 20px;
  border-radius: 8px;
}

.volunteer-card__header {
  margin-bottom: 15px;
}

.volunteer-card__title {
  font-size: 18px;
  font-weight: bold;
}

.volunteer-card--active {
  border: 2px solid #007bff;
}
```

---

## Database Testing

### Create Test Data

```javascript
// Use Firebase console or Admin SDK
const admin = require('firebase-admin');
const db = admin.firestore();

const testVolunteer = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '555-1234',
  status: 'approved',
  createdAt: new Date()
};

await db.collection('volunteers').add(testVolunteer);
```

### Query Data

```javascript
// Get all approved volunteers
const snapshot = await db.collection('volunteers')
  .where('status', '==', 'approved')
  .get();

snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});
```

---

## API Testing

### Using cURL

```bash
# Register volunteer
curl -X POST http://localhost:5000/api/volunteers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234"
  }'
```

### Using Postman

1. Create new collection
2. Add requests for each endpoint
3. Use environment variables for URLs and tokens
4. Save responses for testing

### Using REST Client Extension (VS Code)

Create `test.http` file:
```http
### Register Volunteer
POST http://localhost:5000/api/volunteers
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234"
}

### Get All Volunteers
GET http://localhost:5000/api/volunteers
Authorization: Bearer token_here
```

---

## Debugging

### Frontend Debugging

1. Open Developer Tools (F12)
2. Use React Developer Tools extension
3. Set breakpoints in Sources tab
4. Check Console for errors
5. Use `console.log()` for debugging

### Backend Debugging

Use Visual Studio Code debugger:

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/server.js",
      "restart": true,
      "runtimeArgs": ["--nolazy"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

2. Click "Run and Debug" in VS Code sidebar
3. Set breakpoints and run

---

## Common Issues and Solutions

### Issue: Port already in use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: Firebase credentials error
- Verify `.env` file exists
- Check credentials are correct
- Ensure `firebase-credentials.json` is in backend folder

### Issue: CORS errors in frontend
- Check `CORS_ORIGIN` in backend `.env`
- Ensure it matches frontend URL

### Issue: Module not found
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Optimization

### Frontend
- Use React.memo for component memoization
- Implement code splitting with lazy loading
- Optimize images
- Use CSS minification

### Backend
- Cache frequently accessed data
- Use database indexes
- Implement pagination
- Use connection pooling

---

## Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables** for sensitive data
3. **Validate all user inputs**
4. **Sanitize database queries**
5. **Use HTTPS** in production
6. **Keep dependencies updated**: `npm audit fix`
7. **Use security headers**
8. **Implement rate limiting**

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/volunteer-registration

# Make changes and commit
git add .
git commit -m "feat: add volunteer registration form"

# Push to remote
git push origin feature/volunteer-registration

# Create Pull Request for review
```

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Getting Help

1. Check documentation in `/docs` folder
2. Review existing code and comments
3. Check GitHub issues
4. Ask in team channels
5. Create detailed bug reports
