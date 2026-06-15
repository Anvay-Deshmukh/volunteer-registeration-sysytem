import React, { useState, useEffect, useCallback } from 'react';
import { adminService, reportService } from '../services/api';
import { downloadFile } from '../utils/helpers';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const [stats, setStats]           = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('volunteers'); // default: volunteers tab
  const [error, setError]           = useState('');
  const [busy, setBusy]             = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Fetch all data ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sRes, vRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllVolunteers()
      ]);
      setStats(sRes.data.data);
      setVolunteers(
        (vRes.data.data || []).map(v => ({
          id: v.id,
          name: `${v.firstName || ''} ${v.lastName || ''}`.trim() || v.name || 'Unknown',
          email: v.email || '—',
          phone: v.phone || '—',
          city: v.city || '—',
          skills: v.skills || [],
          status: v.status || 'pending',
          hours: v.hoursLogged || 0,
          joinDate: v.createdAt?.seconds
            ? new Date(v.createdAt.seconds * 1000).toLocaleDateString('en-US', { dateStyle: 'medium' })
            : '—',
        }))
      );
    } catch (err) {
      console.error('Admin fetch error:', err);
      const msg = err.response?.data?.error
        || (err.response?.status === 401 ? 'Session expired — please log out and log in again.' : null)
        || (err.response?.status === 403 ? 'Access denied — make sure your account has admin role in Firestore.' : null)
        || 'Could not connect to backend. Make sure the backend server is running on port 5000.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Approve ────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setBusy(id + '_a');
    try {
      await adminService.approveVolunteer(id, '');
      setVolunteers(p => p.map(v => v.id === id ? { ...v, status: 'approved' } : v));
      setStats(p => p ? { ...p, activeVolunteers: p.activeVolunteers + 1, pendingRegistrations: Math.max(0, p.pendingRegistrations - 1) } : p);
    } catch (err) {
      setError(err.response?.data?.error || 'Approve failed. Check backend logs.');
    } finally { setBusy(''); }
  };

  // ── Reject ─────────────────────────────────────────────────
  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') ?? '';
    setBusy(id + '_r');
    try {
      await adminService.rejectVolunteer(id, reason);
      setVolunteers(p => p.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
      setStats(p => p ? { ...p, pendingRegistrations: Math.max(0, p.pendingRegistrations - 1) } : p);
    } catch (err) {
      setError(err.response?.data?.error || 'Reject failed. Check backend logs.');
    } finally { setBusy(''); }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"?`)) return;
    setBusy(id + '_d');
    try {
      await adminService.deleteVolunteer(id);
      setVolunteers(p => p.filter(v => v.id !== id));
      setStats(p => p ? { ...p, totalVolunteers: Math.max(0, p.totalVolunteers - 1) } : p);
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed. Check backend logs.');
    } finally { setBusy(''); }
  };

  // ── Export ─────────────────────────────────────────────────
  const handleExport = async (fmt) => {
    setBusy('export_' + fmt);
    try {
      const res = fmt === 'csv' ? await reportService.exportCSV() : await reportService.exportPDF();
      downloadFile(res.data, `volunteer-report.${fmt}`);
    } catch (err) {
      setError(`Export ${fmt.toUpperCase()} failed.`);
    } finally { setBusy(''); }
  };

  // ── Filtered list ──────────────────────────────────────────
  const filtered = volunteers.filter(v => {
    const q = search.toLowerCase();
    const matchQ = !q
      || v.name.toLowerCase().includes(q)
      || v.email.toLowerCase().includes(q)
      || v.city.toLowerCase().includes(q)
      || v.skills.join(' ').toLowerCase().includes(q);
    const matchS = !statusFilter || v.status === statusFilter;
    return matchQ && matchS;
  });

  const pending  = volunteers.filter(v => v.status === 'pending');
  const approved = volunteers.filter(v => v.status === 'approved');

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div className="ad-loading">
      <div className="ad-spinner" />
      <p>Loading admin panel…</p>
    </div>
  );

  return (
    <div className="ad-page">

      {/* Page Header */}
      <div className="ad-page-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Search volunteers, approve registrations, and download reports.</p>
        </div>
        <div className="ad-admin-badge">⚙ {user?.name}</div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="ad-alert-error">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Stat Pills (always visible) */}
      <div className="ad-stat-pills">
        <div className="ad-pill ad-pill-total" onClick={() => { setActiveTab('volunteers'); setStatusFilter(''); }}>
          <span>{volunteers.length}</span> Total
        </div>
        <div className="ad-pill ad-pill-pending" onClick={() => { setActiveTab('volunteers'); setStatusFilter('pending'); }}>
          <span>{pending.length}</span> Pending
        </div>
        <div className="ad-pill ad-pill-approved" onClick={() => { setActiveTab('volunteers'); setStatusFilter('approved'); }}>
          <span>{approved.length}</span> Approved
        </div>
        <div className="ad-pill ad-pill-hours">
          <span>{stats?.totalHours || 0}h</span> Total Hours
        </div>
        <button className="ad-btn ad-btn-refresh" onClick={fetchData} disabled={loading} style={{ marginLeft: 'auto' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="ad-tabs">
        {[
          { id: 'volunteers', label: `👥 Volunteers` },
          { id: 'reports',    label: '📋 Reports' },
        ].map(t => (
          <button key={t.id} className={`ad-tab ${activeTab === t.id ? 'ad-tab-active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
            {t.id === 'volunteers' && pending.length > 0 && (
              <span className="ad-tab-badge">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── VOLUNTEERS TAB ─────────────────────────────────── */}
      {activeTab === 'volunteers' && (
        <div className="ad-section">

          {/* Search & Filter Toolbar */}
          <div className="ad-toolbar">
            <div className="ad-search-wrap">
              <span className="ad-search-icon">🔍</span>
              <input
                className="ad-search"
                type="text"
                placeholder="Search by name, email, city, or skill…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <button className="ad-search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            <select
              className="ad-filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>

          <p className="ad-results-info">
            {filtered.length === volunteers.length
              ? `${volunteers.length} volunteer${volunteers.length !== 1 ? 's' : ''} total`
              : `${filtered.length} of ${volunteers.length} volunteers`}
            {pending.length > 0 && !statusFilter && (
              <button className="ad-quick-filter" onClick={() => setStatusFilter('pending')}>
                Show {pending.length} pending →
              </button>
            )}
          </p>

          {/* Volunteer Cards */}
          {filtered.length === 0 ? (
            <div className="ad-empty">
              {volunteers.length === 0 ? (
                <>
                  <span>📭</span>
                  <p>No volunteers registered yet.</p>
                  <small>Volunteer registrations will appear here once submitted.</small>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <p>No volunteers match your search.</p>
                  <button className="ad-btn ad-btn-refresh" onClick={() => { setSearch(''); setStatusFilter(''); }}>
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="ad-volunteer-list">
              {filtered.map(v => (
                <div key={v.id} className={`ad-vol-card ${v.status === 'pending' ? 'ad-vol-card-pending' : ''}`}>

                  {/* Avatar + Name */}
                  <div className="ad-vol-left">
                    <div className="ad-vol-avatar">{v.name.charAt(0).toUpperCase()}</div>
                    <div className="ad-vol-info">
                      <strong>{v.name}</strong>
                      <span>✉ {v.email}</span>
                      {v.phone !== '—' && <span>📞 {v.phone}</span>}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="ad-vol-meta">
                    {v.city !== '—' && <span className="ad-meta-item">📍 {v.city}</span>}
                    <span className="ad-meta-item">🕐 {v.hours}h</span>
                    <span className="ad-meta-item">📅 {v.joinDate}</span>
                    {v.skills.length > 0 && (
                      <div className="ad-vol-skills">
                        {v.skills.slice(0, 3).map(s => (
                          <span key={s} className="ad-skill-tag">{s}</span>
                        ))}
                        {v.skills.length > 3 && (
                          <span className="ad-skill-more">+{v.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="ad-vol-right">
                    <span className={`ad-status ad-status-${v.status}`}>
                      {v.status === 'approved' ? '✅ Approved' : v.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                    </span>

                    <div className="ad-vol-actions">
                      {v.status === 'pending' && (
                        <>
                          <button
                            className="ad-btn ad-btn-approve"
                            onClick={() => handleApprove(v.id)}
                            disabled={!!busy}
                          >
                            {busy === v.id + '_a' ? '…' : '✓ Approve'}
                          </button>
                          <button
                            className="ad-btn ad-btn-reject"
                            onClick={() => handleReject(v.id)}
                            disabled={!!busy}
                          >
                            {busy === v.id + '_r' ? '…' : '✕ Reject'}
                          </button>
                        </>
                      )}
                      <button
                        className="ad-btn ad-btn-delete"
                        onClick={() => handleDelete(v.id, v.name)}
                        disabled={!!busy}
                        title="Delete volunteer"
                      >
                        {busy === v.id + '_d' ? '…' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REPORTS TAB ────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="ad-section">
          <div className="ad-report-cards">

            {/* CSV */}
            <div className="ad-report-card">
              <div className="ad-report-icon">📊</div>
              <h3>Volunteer Data — CSV</h3>
              <p>All volunteer records including name, email, phone, city, status, skills, and hours. Opens in Excel / Google Sheets.</p>
              <ul className="ad-report-includes">
                <li>✓ Name, Email, Phone</li>
                <li>✓ City, State, Status</li>
                <li>✓ Skills & Hours Logged</li>
                <li>✓ Registration Date</li>
              </ul>
              <button className="ad-btn-download ad-btn-csv" onClick={() => handleExport('csv')} disabled={!!busy}>
                {busy === 'export_csv' ? 'Generating…' : '⬇ Download CSV'}
              </button>
            </div>

            {/* PDF */}
            <div className="ad-report-card">
              <div className="ad-report-icon">📄</div>
              <h3>Full Report — PDF</h3>
              <p>A printable PDF with summary statistics and a complete volunteer listing. Ready for management review.</p>
              <ul className="ad-report-includes">
                <li>✓ Summary statistics</li>
                <li>✓ Volunteer listing</li>
                <li>✓ Status breakdown</li>
                <li>✓ Printable format</li>
              </ul>
              <button className="ad-btn-download ad-btn-pdf" onClick={() => handleExport('pdf')} disabled={!!busy}>
                {busy === 'export_pdf' ? 'Generating…' : '⬇ Download PDF'}
              </button>
            </div>

            {/* Live Stats */}
            <div className="ad-report-card ad-report-card-stats">
              <div className="ad-report-icon">📈</div>
              <h3>Live Statistics</h3>
              <div className="ad-live-stats">
                <div className="ad-ls-row"><span>Total Volunteers</span><strong>{volunteers.length}</strong></div>
                <div className="ad-ls-row"><span>Approved</span><strong style={{ color: '#16a34a' }}>{approved.length}</strong></div>
                <div className="ad-ls-row"><span>Pending Review</span><strong style={{ color: '#d97706' }}>{pending.length}</strong></div>
                <div className="ad-ls-row"><span>Rejected</span><strong style={{ color: '#dc2626' }}>{volunteers.filter(v => v.status === 'rejected').length}</strong></div>
                <div className="ad-ls-row"><span>Total Hours</span><strong>{stats?.totalHours || 0}h</strong></div>
              </div>
              <button className="ad-btn ad-btn-refresh" onClick={fetchData} style={{ width: '100%', marginTop: '12px' }}>
                ↻ Refresh Stats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
