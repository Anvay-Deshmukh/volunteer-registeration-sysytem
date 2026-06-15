import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { volunteerService } from '../services/api';
import './VolunteerDashboard.css';

function VolunteerDashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await volunteerService.search(null, { email: user.email });
      const data = res.data.data;
      if (data && data.length > 0) {
        const vol = data[0];
        const joinDate = vol.createdAt?.seconds
          ? new Date(vol.createdAt.seconds * 1000).toLocaleDateString('en-US', { dateStyle: 'medium' })
          : vol.createdAt
            ? new Date(vol.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })
            : 'N/A';
        setProfile({
          id: vol.id,
          firstName: vol.firstName || '',
          lastName: vol.lastName || '',
          email: vol.email || user.email,
          phone: vol.phone || '',
          city: vol.city || '',
          state: vol.state || '',
          status: vol.status || 'pending',
          hoursLogged: vol.hoursLogged || 0,
          skills: vol.skills || [],
          interests: vol.interests || [],
          availability: vol.availability || [],
          joinDate,
        });
        // load assignments for this volunteer
        setAssignments(vol.assignments || []);
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError('Failed to load profile. Please refresh.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const statusConfig = {
    approved: { label: 'Approved', icon: '✅', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    pending:  { label: 'Pending Approval', icon: '⏳', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    rejected: { label: 'Rejected', icon: '❌', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };

  const sc = statusConfig[profile?.status] || statusConfig.pending;

  if (loading) return (
    <div className="vd-loading">
      <div className="vd-spinner"></div>
      <p>Loading your dashboard…</p>
    </div>
  );

  // Not registered yet → prompt them
  if (!profile) return (
    <div className="vd-container">
      <div className="vd-not-registered">
        <div className="vd-nr-icon">📋</div>
        <h2>Complete Your Volunteer Profile</h2>
        <p>You haven't submitted your volunteer registration form yet. Fill it out to get started!</p>
        <button className="vd-btn-primary" onClick={() => navigate('/register')}>
          Fill Out Volunteer Form →
        </button>
      </div>
    </div>
  );

  return (
    <div className="vd-container">
      {/* Header */}
      <div className="vd-header">
        <div className="vd-header-left">
          <div className="vd-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h1>Welcome, {user.name?.split(' ')[0]}!</h1>
            <p className="vd-email">{user.email}</p>
          </div>
        </div>
        <Link to="/register" className="vd-btn-outline">Edit Registration</Link>
      </div>

      {error && <div className="vd-alert-error">{error}</div>}

      {/* Status Banner */}
      <div className="vd-status-banner" style={{ background: sc.bg, border: `1.5px solid ${sc.border}`, color: sc.color }}>
        <span className="vd-status-icon">{sc.icon}</span>
        <div>
          <strong>Registration Status: {sc.label}</strong>
          {profile.status === 'pending' && <p>Your application is under review. An admin will approve it soon.</p>}
          {profile.status === 'approved' && <p>Your registration is approved! You're now an active volunteer.</p>}
          {profile.status === 'rejected' && <p>Your registration was not approved. Please contact the admin for more info.</p>}
        </div>
      </div>

      {/* Stats Row */}
      <div className="vd-stats-row">
        <div className="vd-stat">
          <div className="vd-stat-num">{profile.hoursLogged}</div>
          <div className="vd-stat-label">Hours Logged</div>
        </div>
        <div className="vd-stat">
          <div className="vd-stat-num">{profile.skills.length}</div>
          <div className="vd-stat-label">Skills</div>
        </div>
        <div className="vd-stat">
          <div className="vd-stat-num">{profile.interests.length}</div>
          <div className="vd-stat-label">Interests</div>
        </div>
        <div className="vd-stat">
          <div className="vd-stat-num">{assignments.length}</div>
          <div className="vd-stat-label">Events</div>
        </div>
      </div>

      <div className="vd-grid">
        {/* Profile Details */}
        <div className="vd-card">
          <h3 className="vd-card-title">📇 My Profile</h3>
          <div className="vd-info-list">
            <div className="vd-info-row"><span>Full Name</span><strong>{profile.firstName} {profile.lastName}</strong></div>
            <div className="vd-info-row"><span>Email</span><strong>{profile.email}</strong></div>
            {profile.phone && <div className="vd-info-row"><span>Phone</span><strong>{profile.phone}</strong></div>}
            {(profile.city || profile.state) && (
              <div className="vd-info-row"><span>Location</span><strong>{[profile.city, profile.state].filter(Boolean).join(', ')}</strong></div>
            )}
            <div className="vd-info-row"><span>Joined</span><strong>{profile.joinDate}</strong></div>
          </div>
        </div>

        {/* Skills & Availability */}
        <div className="vd-card">
          <h3 className="vd-card-title">🎯 Skills & Availability</h3>
          {profile.skills.length > 0 && (
            <div className="vd-section">
              <p className="vd-section-label">Skills</p>
              <div className="vd-tags">
                {profile.skills.map(s => <span key={s} className="vd-tag vd-tag-blue">{s}</span>)}
              </div>
            </div>
          )}
          {profile.interests.length > 0 && (
            <div className="vd-section">
              <p className="vd-section-label">Interests</p>
              <div className="vd-tags">
                {profile.interests.map(i => <span key={i} className="vd-tag vd-tag-purple">{i}</span>)}
              </div>
            </div>
          )}
          {profile.availability.length > 0 && (
            <div className="vd-section">
              <p className="vd-section-label">Availability</p>
              <div className="vd-tags">
                {profile.availability.map(a => <span key={a} className="vd-tag vd-tag-green">{a}</span>)}
              </div>
            </div>
          )}
          {!profile.skills.length && !profile.interests.length && (
            <p className="vd-empty">No skills or interests listed yet. <Link to="/register">Update your form →</Link></p>
          )}
        </div>

        {/* Registered Events */}
        <div className="vd-card vd-card-full">
          <div className="vd-card-header">
            <h3 className="vd-card-title">📅 Registered Events & Projects</h3>
          </div>
          {assignments.length > 0 ? (
            <div className="vd-events-list">
              {assignments.map((ev, i) => (
                <div key={ev.id || i} className="vd-event-item">
                  <div className="vd-event-icon">🎪</div>
                  <div className="vd-event-info">
                    <strong>{ev.name || ev.projectId || 'Project Assignment'}</strong>
                    <span>{ev.role || 'Volunteer'}</span>
                  </div>
                  <span className={`vd-event-status vd-event-${ev.status}`}>
                    {ev.status || 'active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="vd-events-empty">
              <div className="vd-events-empty-icon">📅</div>
              <p>No events assigned yet.</p>
              <span>
                {profile.status === 'approved'
                  ? "Check back soon — the admin will assign you to events once they're available."
                  : 'Events will be assigned after your registration is approved.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
