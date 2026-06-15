import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { auth, db } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // used by AdminGuard

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VolunteerRegistration from './pages/VolunteerRegistration';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/Navbar';

/**
 * AdminGuard — re-reads role from Firestore every time /admin is visited.
 * This ensures that even if the cached user state has an old role,
 * the live Firestore value is always respected.
 */
function AdminGuard({ user, setUser }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin]   = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const tokenResult = await auth.currentUser.getIdTokenResult(true);
        const role = tokenResult.claims.role || 'volunteer';
        if (role === 'admin' && user.role !== 'admin') {
          // update cached user state so navbar refreshes too
          setUser(prev => ({ ...prev, role: 'admin' }));
        }
        setIsAdmin(role === 'admin');
      } catch (err) {
        console.error('AdminGuard error:', err);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };
    checkRole();
  }, [user.uid, user.role, setUser]);

  if (checking) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Verifying access…</p>
    </div>
  );

  return isAdmin
    ? <AdminDashboard user={{ ...user, role: 'admin' }} />
    : <Navigate to="/volunteer-dashboard" />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Read role from Firebase ID token custom claims (bypasses Firestore rules)
          const tokenResult = await currentUser.getIdTokenResult(true); // force refresh
          const role = tokenResult.claims.role || 'volunteer';

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || currentUser.email.split('@')[0],
            role
          });
        } catch (err) {
          console.error('Failed to get token claims:', err);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || currentUser.email.split('@')[0],
            role: 'volunteer'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={() => setUser(null)} />}
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              user
                ? <Navigate to={isAdmin ? '/admin' : '/volunteer-dashboard'} />
                : <LoginPage onLogin={setUser} />
            } />
            <Route path="/login" element={
              user
                ? <Navigate to={isAdmin ? '/admin' : '/volunteer-dashboard'} />
                : <LoginPage onLogin={setUser} />
            } />
            <Route path="/signup" element={
              user
                ? <Navigate to="/volunteer-dashboard" />
                : <SignupPage onSignup={setUser} />
            } />
            {/* Public volunteer registration form (no login needed) */}
            <Route path="/register" element={<VolunteerRegistration />} />

            {/* Protected: Volunteer Dashboard — admins are redirected to /admin */}
            <Route
              path="/volunteer-dashboard"
              element={
                !user
                  ? <Navigate to="/login" />
                  : user.role === 'admin'
                    ? <Navigate to="/admin" />
                    : <VolunteerDashboard user={user} />
              }
            />

            {/* Protected: Admin Dashboard — re-checks role live from Firestore */}
            <Route
              path="/admin"
              element={
                !user
                  ? <Navigate to="/login" />
                  : <AdminGuard user={user} setUser={setUser} />
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
