import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: user.name || '',
    headline: user.headline || '',
    phone: user.phone || '',
    bio: user.bio || '',
    dob: user.dob ? user.dob.slice(0, 10) : '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    country: user.address?.country || '',
    github: user.socialLinks?.github || '',
    linkedin: user.socialLinks?.linkedin || '',
    twitter: user.socialLinks?.twitter || '',
    website: user.socialLinks?.website || '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        headline: form.headline.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        dob: form.dob || null,
        address: {
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
        },
        socialLinks: {
          github: form.github.trim(),
          linkedin: form.linkedin.trim(),
          twitter: form.twitter.trim(),
          website: form.website.trim(),
        },
      };

      const { data } = await api.put('/users/profile', payload);
      setUser(data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => nav('/'), 1000);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '750px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Edit Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Update your personal information and web presence.
            </p>
          </div>
          <Link to="/" className="btn btn-secondary btn-sm">
            ← Back to Profile
          </Link>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Details */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--primary)' }}>
            1. Basic Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-control"
                required
                minLength={2}
                maxLength={60}
                value={form.name}
                onChange={setField('name')}
                placeholder="e.g. Bikram Pal"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                disabled
                value={user.email}
                title="Email cannot be changed directly"
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Headline / Tagline</label>
            <input
              type="text"
              className="form-control"
              maxLength={100}
              value={form.headline}
              onChange={setField('headline')}
              placeholder="e.g. Computer Science Student | Full Stack Developer"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={form.phone}
                onChange={setField('phone')}
                placeholder="e.g. +91 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={form.dob}
                onChange={setField('dob')}
              />
            </div>
          </div>

          {/* Section 2: Location */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.85rem 0', color: 'var(--primary)' }}>
            2. Address & Location
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                className="form-control"
                value={form.city}
                onChange={setField('city')}
                placeholder="e.g. Kolkata"
              />
            </div>

            <div className="form-group">
              <label>State / Province</label>
              <input
                type="text"
                className="form-control"
                value={form.state}
                onChange={setField('state')}
                placeholder="e.g. West Bengal"
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                className="form-control"
                value={form.country}
                onChange={setField('country')}
                placeholder="e.g. India"
              />
            </div>
          </div>

          {/* Section 3: Bio */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.85rem 0', color: 'var(--primary)' }}>
            3. About You (Bio)
          </h3>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Bio (max 500 characters)</label>
              <span style={{ fontSize: '0.75rem', color: form.bio.length > 450 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {form.bio.length} / 500
              </span>
            </div>
            <textarea
              className="form-control"
              maxLength={500}
              value={form.bio}
              onChange={setField('bio')}
              placeholder="Tell others a little about yourself, your interests, or projects..."
            />
          </div>

          {/* Section 4: Social Links */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.85rem 0', color: 'var(--primary)' }}>
            4. Social & Professional Links
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>GitHub Profile</label>
              <input
                type="text"
                className="form-control"
                value={form.github}
                onChange={setField('github')}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input
                type="text"
                className="form-control"
                value={form.linkedin}
                onChange={setField('linkedin')}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Twitter / X Profile</label>
              <input
                type="text"
                className="form-control"
                value={form.twitter}
                onChange={setField('twitter')}
                placeholder="https://x.com/username"
              />
            </div>

            <div className="form-group">
              <label>Portfolio or Personal Website</label>
              <input
                type="text"
                className="form-control"
                value={form.website}
                onChange={setField('website')}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving Changes...' : '💾 Save Changes'}
            </button>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
