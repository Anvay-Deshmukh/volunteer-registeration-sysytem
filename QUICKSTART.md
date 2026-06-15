# Quick Start Guide

## Installation (5 minutes)

### 1. Clone and Setup

```bash
# Navigate to project directory
cd volunteer-system

# Install all dependencies (backend + frontend)
npm run setup
```

### 2. Configure Firebase

#### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable these services:
   - Authentication (Email/Password)
   - Firestore Database
   - Hosting

#### Step 2: Get Credentials

**For Backend:**
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `backend/firebase-credentials.json`

**For Frontend:**
1. Go to Project Settings → General
2. Copy the Firebase Config

### 3. Set Environment Variables

**Backend** (`.env`):
```
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_DB_URL=your_db_url
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Start Development

```bash
# Start both backend and frontend
npm run dev

# Or run separately:
npm run dev:backend      # Terminal 1 - http://localhost:5000
npm run dev:frontend     # Terminal 2 - http://localhost:3000
```

---

## First-Time Use

### Create Admin User

1. Sign up at http://localhost:3000/signup
2. In Firebase Console → Firestore, create document:
   - Collection: `users`
   - Document ID: use your user ID
   - Data:
     ```json
     {
       "email": "your@email.com",
       "displayName": "Admin",
       "role": "admin"
     }
     ```

### Access Admin Dashboard

After creating admin user:
- Go to http://localhost:3000/login
- Login with your account
- You'll see Admin link in navbar

---

## Key Features to Test

### 1. Volunteer Registration
- Navigate to http://localhost:3000/register
- Fill out form with sample data
- Check Firestore → volunteers collection

### 2. Authentication
- Signup: http://localhost:3000/signup
- Login: http://localhost:3000/login
- Password Reset: Uses Firebase Auth

### 3. Admin Dashboard
- View volunteers statistics
- Manage volunteers (approve/reject)
- Generate and export reports

### 4. Volunteer Dashboard
- View personal profile
- See assigned projects
- Track volunteer hours

---

## Available Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Reset password

### Volunteers
- `GET /api/volunteers` - Get all
- `POST /api/volunteers` - Register volunteer
- `GET /api/volunteers/:id` - Get by ID
- `PUT /api/volunteers/:id` - Update profile
- `DELETE /api/volunteers/:id` - Delete

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/volunteers/:id/approve` - Approve
- `POST /api/admin/volunteers/:id/reject` - Reject

### Reports
- `GET /api/reports/volunteers` - Volunteer report
- `GET /api/reports/export-csv` - Export CSV
- `GET /api/reports/export-pdf` - Export PDF

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Firebase Credential Error
- Check `.env` files exist and have correct values
- Verify `firebase-credentials.json` in backend folder
- Check JSON is valid (use JSON validator)

### CORS Error
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check backend is running on correct port

### Database Empty
- Use Firebase Console to manually add test data
- Or use provided sample queries in API docs

---

## Project Structure

```
volunteer-system/
├── backend/              # Node.js/Express API
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation
│   └── server.js        # Main server file
│
├── frontend/            # React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API & Firebase
│   │   └── utils/       # Helper functions
│   └── package.json
│
├── docs/                # Documentation
│   ├── API.md          # API reference
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
└── README.md           # Project overview
```

---

## Next Steps

1. **Customize Styling**: Edit CSS files in `frontend/src`
2. **Add Features**: Follow the modular structure
3. **Configure Database**: Set up Firestore collections
4. **Deploy**: Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md)
5. **Set Up CI/CD**: Use GitHub Actions for automation

---

## Documentation

- 📖 [Full API Documentation](docs/API.md)
- 💾 [Database Schema](docs/DATABASE_SCHEMA.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md)
- 🛠️ [Development Guide](docs/DEVELOPMENT.md)

---

## Support

- Check existing documentation
- Review code comments
- Check GitHub issues
- Create detailed bug reports

---

Happy coding! 🎉
