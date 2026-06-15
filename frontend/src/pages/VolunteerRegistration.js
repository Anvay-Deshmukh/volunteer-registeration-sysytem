import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VolunteerRegistration.css';

const SKILLS_OPTIONS = [
  'Teaching', 'Mentoring', 'Technical Support', 'Data Analysis',
  'Writing', 'Design', 'Marketing', 'Event Planning',
  'Administration', 'Medical/First Aid', 'Translation', 'Photography'
];
const INTERESTS_OPTIONS = [
  'Education', 'Healthcare', 'Environment', 'Elderly Care',
  'Youth Development', 'Community Service', 'Sports', 'Arts & Culture',
  'Animal Welfare', 'Disaster Relief'
];
const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Evenings', 'Flexible'];

const STEPS = ['Personal Info', 'Address', 'Skills & Availability', 'Review & Submit'];

function VolunteerRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zipCode: '',
    skills: [], interests: [], availability: [], experience: ''
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleArr = (field, value) => {
    setForm(prev => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const nextStep = () => { setError(''); setStep(s => s + 1); };
  const prevStep = () => { setError(''); setStep(s => s - 1); };

  const validateStep = () => {
    if (step === 0) {
      if (!form.firstName.trim()) return 'First name is required.';
      if (!form.lastName.trim()) return 'Last name is required.';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'A valid email is required.';
      if (!form.phone.trim()) return 'Phone number is required.';
    }
    if (step === 2) {
      if (form.skills.length === 0) return 'Please select at least one skill.';
      if (form.availability.length === 0) return 'Please select your availability.';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    nextStep();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/volunteers`, form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="vr-page">
      <div className="vr-success-card">
        <div className="vr-success-icon">🎉</div>
        <h2>Registration Submitted!</h2>
        <p>Thank you, <strong>{form.firstName}</strong>! Your volunteer application has been submitted and is pending admin review. You'll be notified once it's approved.</p>
        <div className="vr-success-actions">
          <button className="vr-btn-primary" onClick={() => navigate('/volunteer-dashboard')}>Go to Dashboard</button>
          <button className="vr-btn-outline" onClick={() => { setSuccess(false); setStep(0); setForm({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', skills: [], interests: [], availability: [], experience: '' }); }}>Submit Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="vr-page">
      <div className="vr-wrapper">
        {/* Header */}
        <div className="vr-page-header">
          <h1>Volunteer Registration</h1>
          <p>Complete all steps to submit your volunteer application</p>
        </div>

        {/* Progress Steps */}
        <div className="vr-steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`vr-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="vr-step-num">{i < step ? '✓' : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="vr-card">
          {error && <div className="vr-alert-error">{error}</div>}

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="vr-step-content">
              <h2 className="vr-step-title">Personal Information</h2>
              <div className="vr-form-grid-2">
                <div className="vr-field">
                  <label>First Name <span>*</span></label>
                  <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Jane" />
                </div>
                <div className="vr-field">
                  <label>Last Name <span>*</span></label>
                  <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" />
                </div>
                <div className="vr-field">
                  <label>Email Address <span>*</span></label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
                </div>
                <div className="vr-field">
                  <label>Phone Number <span>*</span></label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="vr-step-content">
              <h2 className="vr-step-title">Address Details</h2>
              <div className="vr-field vr-field-full">
                <label>Street Address</label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main Street" />
              </div>
              <div className="vr-form-grid-3">
                <div className="vr-field">
                  <label>City</label>
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York" />
                </div>
                <div className="vr-field">
                  <label>State</label>
                  <input type="text" value={form.state} onChange={e => set('state', e.target.value)} placeholder="NY" />
                </div>
                <div className="vr-field">
                  <label>Zip Code</label>
                  <input type="text" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} placeholder="10001" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="vr-step-content">
              <h2 className="vr-step-title">Skills & Availability</h2>

              <div className="vr-field-group">
                <label className="vr-group-label">Skills <span>*</span> (select all that apply)</label>
                <div className="vr-checkbox-grid">
                  {SKILLS_OPTIONS.map(s => (
                    <label key={s} className={`vr-checkbox-pill ${form.skills.includes(s) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={form.skills.includes(s)} onChange={() => toggleArr('skills', s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="vr-field-group">
                <label className="vr-group-label">Areas of Interest</label>
                <div className="vr-checkbox-grid">
                  {INTERESTS_OPTIONS.map(i => (
                    <label key={i} className={`vr-checkbox-pill vr-pill-purple ${form.interests.includes(i) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={form.interests.includes(i)} onChange={() => toggleArr('interests', i)} />
                      {i}
                    </label>
                  ))}
                </div>
              </div>

              <div className="vr-field-group">
                <label className="vr-group-label">Availability <span>*</span></label>
                <div className="vr-checkbox-grid vr-avail-grid">
                  {AVAILABILITY_OPTIONS.map(a => (
                    <label key={a} className={`vr-checkbox-pill vr-pill-green ${form.availability.includes(a) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={form.availability.includes(a)} onChange={() => toggleArr('availability', a)} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              <div className="vr-field vr-field-full">
                <label>Previous Volunteer Experience (optional)</label>
                <textarea rows={4} value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="Tell us about any previous volunteer work you've done…" />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="vr-step-content">
              <h2 className="vr-step-title">Review Your Application</h2>
              <div className="vr-review-grid">
                <div className="vr-review-section">
                  <h4>Personal</h4>
                  <p><span>Name</span><strong>{form.firstName} {form.lastName}</strong></p>
                  <p><span>Email</span><strong>{form.email}</strong></p>
                  <p><span>Phone</span><strong>{form.phone}</strong></p>
                </div>
                <div className="vr-review-section">
                  <h4>Address</h4>
                  <p><span>Street</span><strong>{form.address || '—'}</strong></p>
                  <p><span>City / State</span><strong>{[form.city, form.state].filter(Boolean).join(', ') || '—'}</strong></p>
                  <p><span>Zip</span><strong>{form.zipCode || '—'}</strong></p>
                </div>
                <div className="vr-review-section vr-review-full">
                  <h4>Skills</h4>
                  <div className="vr-review-tags">
                    {form.skills.map(s => <span key={s} className="vr-rtag vr-rtag-blue">{s}</span>)}
                  </div>
                </div>
                <div className="vr-review-section vr-review-full">
                  <h4>Interests</h4>
                  <div className="vr-review-tags">
                    {form.interests.length ? form.interests.map(i => <span key={i} className="vr-rtag vr-rtag-purple">{i}</span>) : <span className="vr-none">None selected</span>}
                  </div>
                </div>
                <div className="vr-review-section vr-review-full">
                  <h4>Availability</h4>
                  <div className="vr-review-tags">
                    {form.availability.map(a => <span key={a} className="vr-rtag vr-rtag-green">{a}</span>)}
                  </div>
                </div>
                {form.experience && (
                  <div className="vr-review-section vr-review-full">
                    <h4>Experience</h4>
                    <p className="vr-experience-text">{form.experience}</p>
                  </div>
                )}
              </div>
              <p className="vr-disclaimer">By submitting, you agree to be contacted by our team regarding volunteer opportunities. Your registration will be reviewed by an admin.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="vr-nav">
            {step > 0 && (
              <button className="vr-btn-outline" onClick={prevStep} disabled={loading}>← Back</button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="vr-btn-primary" onClick={handleNext}>Continue →</button>
            ) : (
              <button className="vr-btn-primary vr-btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting…' : '🚀 Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerRegistration;
