# Volunteer Registration System - Testing Guide

## Overview
This guide walks you through testing the complete volunteer registration system with Firebase backend.

## Prerequisites
✅ Backend running on `http://localhost:5000`
✅ Frontend running on `http://localhost:3000`
✅ Firebase Firestore collections created (volunteers, users, projects)
✅ Firebase credentials configured in `.env` files

---

## Test 1: Frontend Is Loading Correctly

1. Open browser and navigate to `http://localhost:3000`
2. You should see the LoginPage
3. You should see:
   - "Login to Your Account" heading
   - Email and password input fields
   - Login button
   - Link to signup page

✅ **Expected Result**: Page loads without errors, no blank screens

---

## Test 2: Signup (Create User Account)

### Test 2a: Successful Signup
1. Click "Create an account" link on login page (or go to `/signup`)
2. You should see SignupPage with:
   - Name, Email, Password, Confirm Password fields
   - Signup button

3. Fill in form:
   ```
   Name: John Doe
   Email: testuser@example.com
   Password: Password123
   Confirm Password: Password123
   ```

4. Click "Sign Up" button

5. You should see success message (if time allows, you'll see redirect to /volunteer-dashboard)

6. **Check Firebase Console**:
   - Go to Firebase Console → Authentication
   - Look for `testuser@example.com` user created
   - Go to Firestore → users collection
   - Look for document with email `testuser@example.com`
   - Verify it has fields: email, displayName, role, createdAt

✅ **Expected Result**: 
- User created in Firebase Authentication
- User document created in Firestore users collection
- Auto-redirect to /volunteer-dashboard

---

## Test 3: Login to Admin Dashboard

### Test 3a: Login with Created Account
1. Go to `http://localhost:3000/login`
2. Enter credentials:
   ```
   Email: testuser@example.com
   Password: Password123
   ```

3. Click "Login" button

4. **Expected**: Should redirect to `/admin` page showing admin dashboard

5. You should see:
   - "Admin Dashboard" heading
   - Three tabs: Overview, Volunteers, Reports
   - Stats cards showing: Total Volunteers, Active Volunteers, Pending Registrations, Total Hours, Average Rating

⚠️ **If Stats Show 0**: This is expected if no volunteers have been registered yet. Continue to Test 4.

✅ **Expected Result**: 
- Login successful
- Redirected to `/admin` page
- Admin dashboard displays with stats (even if 0)
- User name shows in Navbar

---

## Test 4: Volunteer Registration (via /register page)

### Test 4a: Register as Volunteer
1. Open new tab and go to `http://localhost:3000/register`
2. Fill volunteer registration form:
   ```
   First Name: Alice
   Last Name: Johnson
   Email: alice@example.com
   Phone: 555-0123
   Address: 123 Main St
   City: Springfield
   State: IL
   Zip Code: 62701
   Skills: [Check "Teaching", "Mentoring"]
   Interests: [Check "Education", "Youth Development"]
   Availability: [Check "Weekends", "Evenings"]
   Experience: "I have 5 years of teaching experience"
   ```

3. Click "Submit Registration" button

4. You should see: "Registration submitted successfully! Awaiting admin approval."

5. **Check Firebase Console**:
   - Go to Firestore → volunteers collection
   - You should see a new document with:
     - firstName: "Alice"
     - lastName: "Johnson"
     - email: "alice@example.com"
     - status: "pending"
     - skills: ["Teaching", "Mentoring"]
     - createdAt: [current timestamp]

✅ **Expected Result**: 
- Form submits without error
- Success message displays
- Document appears in Firestore volunteers collection
- Status is "pending"

---

## Test 5: Admin Dashboard - View Volunteers

### Test 5a: View Registered Volunteers
1. Go back to admin tab (or re-login to `/admin`)
2. Click on "Volunteers" tab
3. You should see a table with all volunteers:
   - Alice Johnson (pending status)
   - Any other volunteers you've registered

**Check Stats**: 
- Total Volunteers should now show at least 1
- Pending Registrations should show at least 1

✅ **Expected Result**: 
- Volunteers table shows registered volunteers
- Stats updated with new volunteer count
- Status badges show appropriate colors

---

## Test 6: Admin Operations (Approve/Reject)

### Test 6a: Approve Volunteer
1. In Volunteers tab, find Alice Johnson's row
2. Click "Edit" button (functionality to be implemented)

⚠️ **Note**: Approve/Reject buttons are TODO features

For now, you can test the backend directly:

**Via Browser Developer Tools (F12)**:
```javascript
// In browser console:
const volunteerId = "document_id_from_firestore";
fetch('http://localhost:5000/api/admin/volunteers/' + volunteerId + '/approve', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({notes: 'Approved by admin'})
})
.then(r => r.json())
.then(data => console.log(data))
```

**Check Firestore**: Volunteer status should change to "approved"

---

## Test 7: Reports & Export

### Test 7a: Export as CSV
1. In Admin Dashboard, click "Reports" tab
2. In "Volunteer Report" card, click "Export as CSV" button
3. Browser should download a file named `report.csv`

✅ **Expected Result**: 
- CSV file downloads
- Contains volunteer data (name, email, status, hours, etc.)

### Test 7b: Export as PDF
1. In Reports tab, click "Export as PDF" button
2. Browser should download a file named `report.pdf`

✅ **Expected Result**: 
- PDF file downloads
- Contains formatted volunteer data

---

## Test 8: Volunteer Dashboard (/volunteer-dashboard)

### Test 8a: View Volunteer Profile
1. After logging in, you can navigate to `/volunteer-dashboard`
2. You should see:
   - "My Profile" card with:
     - Name, Email, Status, Hours Logged, Join Date, Skills
   - "Recent Projects" section
   - "Statistics" showing Hours Logged and Active Projects

3. Check if it shows your user data (from signup)
   - Name should match signup name
   - Email should match signup email
   - Status will be "pending" (not yet approved as volunteer)

✅ **Expected Result**: 
- Profile shows user information
- Stats displayed
- No errors in console

---

## Test 9: Logout & Navigation

### Test 9a: Logout
1. In any authenticated page, click "Logout" button in Navbar
2. You should be redirected to `/login`
3. Login page should display

4. Try to access `/admin` or `/volunteer-dashboard` directly
5. You should be redirected to `/login` (unauthenticated users can't access)

✅ **Expected Result**: 
- Logout works
- Can't access protected routes without login
- Proper redirects happen

---

## Test 10: End-to-End Complete Flow

### Full User Journey
1. **Start Fresh** (clear browser storage if needed):
   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Go to signup**: `http://localhost:3000/signup`
3. **Create new user**: newuser@test.com, Password123
4. **Verify in Firebase**: Check Authentication and users collection
5. **You're auto-logged in**: Should see `/volunteer-dashboard` or redirect to it
6. **Navigate to /admin**: Try accessing admin dashboard
   - You should see it (hardcoded role='admin' for testing)
   - Stats should show 0 volunteers initially
7. **Go to /register**: Register a volunteer (alice@example.com)
8. **Check admin stats**: Refresh admin page, should show 1 volunteer, 0 approved, 1 pending
9. **Go to /logout**: Click logout in navbar
10. **Verify redirect**: Should be back at `/login`
11. **Login again**: Use newuser@test.com credentials
12. **Check Firebase** for all created documents

✅ **Expected Result**: Entire flow works smoothly with proper data in Firestore

---

## Troubleshooting

### Issue: 404 Error on /admin page
**Solution**: 
- Make sure you're logged in (you can tell by navbar username appearing)
- Refresh the page
- Check browser console (F12) for errors

### Issue: Stats show 0 even after registering volunteer
**Solution**:
- Refresh admin page (Ctrl+R)
- Check Firestore to ensure volunteer document was created
- Make sure backend is running on port 5000

### Issue: Form submission fails
**Solution**:
- Check if backend is running (`curl http://localhost:5000/health`)
- Check browser console (F12) for error messages
- Verify all required fields are filled
- Check Firebase credentials in `.env`

### Issue: Can't find created documents in Firestore
**Solution**:
- Go to Firebase Console → Project (task-9df85) → Firestore Database
- Make sure collections exist: volunteers, users, projects
- Refresh the collections view
- Check if documents have proper structure (use schema from docs)

### Issue: Firebase Auth errors
**Solution**:
- Verify Firebase credentials in frontend/.env
- Check API key is active: Firebase Console → Settings → API Keys
- Ensure Email/Password sign-in is enabled in Authentication settings

---

## Performance Checks

### Backend Performance
- Check if backend starts without errors:
  ```bash
  cd backend
  npm start
  # Should show: ✅ Firebase Admin SDK initialized successfully
  # Should show: Server running on port 5000
  ```

- Check health endpoint:
  ```bash
  curl http://localhost:5000/health
  # Should return: {"status":"OK","message":"Server is running"}
  ```

### Frontend Performance
- Check if app loads: `http://localhost:3000`
- Open DevTools (F12) → Console
- Look for any red errors
- Network tab should show successful requests to backend

### Database Performance
- Check Firestore read/write operations:
  - Go to Firebase Console → Firestore Database → Usage
  - Should see reads/writes corresponding to your test actions

---

## Next Steps After Testing

### Features to Implement
- [ ] Role-based access control (fetch role from Firestore, not hardcoded)
- [ ] Approve/Reject buttons in UI (currently need backend API call)
- [ ] Volunteer profile edit functionality
- [ ] Email notifications on approval
- [ ] Pagination for volunteer lists
- [ ] Search/filter functionality in admin dashboard
- [ ] More detailed statistics and charts

### Data to Add to Firestore
- [ ] projects collection (volunteer project definitions)
- [ ] assignments collection (volunteer-to-project mappings)
- [ ] activities collection (logged volunteer hours)
- [ ] notifications collection (system notifications)

### Security Enhancements
- [ ] Uncomment auth middleware in routes
- [ ] Implement proper role checking in controllers
- [ ] Add input validation
- [ ] Add rate limiting
- [ ] Use HTTPS in production

---

## Quick Reference: Test Data

### Test User 1 (Admin)
```
Email: testuser@example.com
Password: Password123
Name: Test User
Role: admin (hardcoded for testing)
```

### Test Volunteer 1
```
Name: Alice Johnson
Email: alice@example.com
Phone: 555-0123
Address: 123 Main St, Springfield, IL 62701
Skills: Teaching, Mentoring
Status: pending (until approved by admin)
```

### Test Volunteer 2 (Create Your Own)
```
Name: Bob Smith
Email: bob@example.com
Phone: 555-0456
Address: 456 Oak Ave, Springfield, IL 62702
Skills: Technical Support, Data Analysis
Status: pending
```

---

## Success Checklist

After completing all tests, you should have:

- ✅ User signup working (creates Firebase Auth user + Firestore document)
- ✅ User login working (Firebase Auth + redirect to dashboard)
- ✅ Volunteer registration form working (posts to /api/volunteers)
- ✅ Admin dashboard displaying stats from Firestore
- ✅ Volunteer list showing in admin dashboard
- ✅ Logout functionality working
- ✅ Protected routes redirecting to login
- ✅ Export CSV/PDF endpoints available
- ✅ All documents properly created in Firestore with correct structure

**Completion**: When all checks pass, the system is ready for Phase 2 implementation of advanced features.
