# Deployment Guide

## Prerequisites

- Node.js v14 or higher
- npm or yarn
- Firebase account (https://console.firebase.google.com)
- GitHub account (for version control)

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to Firebase Console (https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name and configure settings
4. Accept Firebase terms and create project

### 2. Enable Services

In Firebase Console, enable:
- **Authentication**: Set sign-in methods (Email/Password, Google, etc.)
- **Firestore Database**: Create database in production mode
- **Hosting**: For frontend deployment

### 3. Get Firebase Credentials

1. Go to Project Settings → Service Accounts
2. Generate new private key (for backend)
3. Copy the JSON key and save as `backend/firebase-credentials.json`

### 4. Get Firebase Config

1. Go to Project Settings → General
2. Scroll down to "Your apps"
3. Click "Firebase SDK snippet" and select "Config"
4. Copy the configuration

---

## Backend Deployment

### 1. Set Environment Variables

Create `.env` file in backend directory:

```
PORT=5000
NODE_ENV=production

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_DB_URL=https://your_project.firebaseio.com

# JWT
JWT_SECRET=your_secure_jwt_secret

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=https://your_frontend_url.com
```

### 2. Deploy to Firebase Functions

Install Firebase CLI:
```bash
npm install -g firebase-tools
```

Deploy backend:
```bash
firebase deploy --only functions
```

Or deploy to Heroku:

```bash
# Login to Heroku
heroku login

# Create app
heroku create volunteer-system-api

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=your_project_id
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

---

## Frontend Deployment

### 1. Set Environment Variables

Create `.env` file in frontend directory:

```
REACT_APP_API_URL=https://your_backend_url
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. Build Application

```bash
cd frontend
npm install
npm run build
```

### 3. Deploy to Firebase Hosting

```bash
cd frontend
firebase deploy --only hosting
```

Or deploy to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## Database Initialization

### 1. Set Up Security Rules

Go to Firestore → Rules and add security rules from documentation.

### 2. Create Initial Admin User

```bash
# Using Firebase CLI
firebase auth:create-user \
  --email admin@example.com \
  --password "secure_password" \
  --disabled false
```

Or use Firebase Console to create manually.

### 3. Set Admin Role

In backend, run:
```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

await db.collection('users').doc(userId).set({
  email: 'admin@example.com',
  displayName: 'Admin',
  role: 'admin',
  createdAt: new Date()
});
```

---

## Domain Setup

### 1. Custom Domain for Firebase Hosting

1. Go to Hosting in Firebase Console
2. Click "Connect domain"
3. Follow instructions to set DNS records

### 2. SSL Certificate

Firebase automatically provisions SSL certificates.

---

## Monitoring and Maintenance

### 1. Monitor Performance

- Firebase Console → Performance
- Firebase Console → Logs

### 2. Database Backups

Enable automatic backups:
```bash
gcloud firestore backups create --collection-ids=volunteers,users
```

### 3. Set Up Alerts

In Firebase Console:
- Set up email alerts for errors
- Monitor quota usage
- Track active users

---

## Troubleshooting

### Issue: CORS Errors
**Solution**: Update CORS settings in backend:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: Firebase Credentials Error
**Solution**: Verify `.env` file has correct credentials and restart backend.

### Issue: Firestore Rules Blocking Access
**Solution**: Check Firestore security rules match your data structure.

---

## Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Test volunteer registration
- [ ] Test admin dashboard
- [ ] Verify email notifications
- [ ] Test report generation
- [ ] Check database backups
- [ ] Monitor error logs
- [ ] Set up monitoring alerts
- [ ] Update DNS records
- [ ] Test on mobile devices

---

## Environment-Specific Configuration

### Development
- Use local Firebase emulator suite
- Enable debug logging
- Use localhost URLs

### Staging
- Use separate Firebase project
- Test all features
- Load testing

### Production
- Use production Firebase project
- Enable monitoring
- Security hardening
- Database backups enabled
- Rate limiting enabled
