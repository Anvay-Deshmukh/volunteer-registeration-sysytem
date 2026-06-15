import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <Link to={user?.role === 'admin' ? '/admin' : '/volunteer-dashboard'}>
            🤝 Volunteer System
          </Link>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Nav Links */}
        <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          {/* Dashboard link — goes to the correct dashboard for each role */}
          <li>
            <Link
              to={user?.role === 'admin' ? '/admin' : '/volunteer-dashboard'}
              className={`nav-link ${(isActive('/admin') || isActive('/volunteer-dashboard')) ? 'nav-link-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {user?.role === 'admin' ? '⚙ Admin Dashboard' : '🏠 Dashboard'}
            </Link>
          </li>

          {/* Volunteers only: Register Volunteer form */}
          {user?.role !== 'admin' && (
            <li>
              <Link
                to="/register"
                className={`nav-link ${isActive('/register') ? 'nav-link-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                📋 Register
              </Link>
            </li>
          )}

          <li className="nav-user">
            <span className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </span>
            <span className="user-name">{user?.name}</span>
          </li>

          <li>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
