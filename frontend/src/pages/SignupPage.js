import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import './LoginPage.css';

function SignupPage({ onSignup }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: form.email, displayName: form.name, role: 'volunteer',
        createdAt: serverTimestamp(), profileComplete: false
      });
      if (onSignup) onSignup({ uid: cred.user.uid, email: form.email, name: form.name, role: 'volunteer' });
      navigate('/register');
    } catch (err) {
      const codes = { 'auth/email-already-in-use': 'An account with this email already exists.', 'auth/weak-password': 'Password is too weak.' };
      setError(codes[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">🤝 VolunteerHub</div>
        <p className="auth-tagline">Join thousands of volunteers making a difference in their communities.</p>
        <div className="auth-features">
          <div className="auth-feature"><div className="auth-feature-icon">🚀</div><span>Get started in minutes</span></div>
          <div className="auth-feature"><div className="auth-feature-icon">🌍</div><span>Connect with local causes</span></div>
          <div className="auth-feature"><div className="auth-feature-icon">📅</div><span>Flexible scheduling</span></div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create an account</h2>
          <p className="auth-subtitle">Step 1 of 2 — Create your login credentials</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Jane Smith" />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="At least 6 characters" />
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required placeholder="Repeat your password" />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account & Continue →'}
            </button>
          </form>
          <div className="auth-links">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
