import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Read role from Firebase Custom Claims (bypasses Firestore security rules)
      const tokenResult = await cred.user.getIdTokenResult(true); // force refresh
      const role = tokenResult.claims.role || 'volunteer';
      onLogin({ uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName || email.split('@')[0], role });
      navigate(role === 'admin' ? '/admin' : '/volunteer-dashboard');
    } catch (err) {
      const codes = { 'auth/user-not-found': 'No account found with this email.', 'auth/wrong-password': 'Incorrect password.', 'auth/invalid-credential': 'Invalid email or password.', 'auth/too-many-requests': 'Too many attempts. Try again later.' };
      setError(codes[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">🤝 VolunteerHub</div>
        <p className="auth-tagline">Making community service simpler, one volunteer at a time.</p>
        <div className="auth-features">
          <div className="auth-feature"><div className="auth-feature-icon">📋</div><span>Easy online registration</span></div>
          <div className="auth-feature"><div className="auth-feature-icon">✅</div><span>Admin approval workflow</span></div>
          <div className="auth-feature"><div className="auth-feature-icon">📊</div><span>Real-time reporting</span></div>
          <div className="auth-feature"><div className="auth-feature-icon">🎯</div><span>Event & project tracking</span></div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your VolunteerHub account</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-links">
            <p>Don't have an account? <Link to="/signup">Create one free</Link></p>
            <p>Want to volunteer? <Link to="/register">Fill out the volunteer form</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
