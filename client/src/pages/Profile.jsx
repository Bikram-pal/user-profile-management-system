import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { BASE, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const nav = useNavigate();
  const fileRef = useRef();

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Upload Avatar
  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'danger', text: 'Image size must be less than 2 MB' });
      return;
    }

    const fd = new FormData();
    fd.append('avatar', file);

    setLoadingAvatar(true);
    setMsg({ type: '', text: '' });

    try {
      const { data } = await api.post('/users/avatar', fd);
      setUser(data.user);
      setMsg({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    } finally {
      setLoadingAvatar(false);
    }
  };

  // Remove Avatar
  const removeAvatar = async () => {
    if (!confirm('Remove your profile photo?')) return;
    try {
      const { data } = await api.delete('/users/avatar');
      setUser(data.user);
      setMsg({ type: 'success', text: 'Profile photo removed.' });
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirmDelete = prompt(
      `Type "${user.email}" to permanently delete your account:`
    );
    if (confirmDelete !== user.email) {
      if (confirmDelete !== null) alert('Email does not match. Account was not deleted.');
      return;
    }

    try {
      await api.delete('/users/profile');
      logout();
      nav('/register');
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  // Export User Data as JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${user.name.replace(/\s+/g, '_')}_profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculate Profile Completion Score
  const calculateScore = () => {
    let score = 0;
    const checks = [
      { key: 'name', weight: 15, valid: !!user.name },
      { key: 'email', weight: 15, valid: !!user.email },
      { key: 'avatar', weight: 15, valid: !!user.avatar },
      { key: 'headline', weight: 10, valid: !!user.headline },
      { key: 'bio', weight: 15, valid: !!user.bio },
      { key: 'phone', weight: 10, valid: !!user.phone },
      { key: 'dob', weight: 10, valid: !!user.dob },
      { key: 'address', weight: 10, valid: !!(user.address?.city || user.address?.country) },
    ];
    checks.forEach((c) => {
      if (c.valid) score += c.weight;
    });
    return Math.min(score, 100);
  };

  const completionScore = calculateScore();
  const address = user.address || {};
  const social = user.socialLinks || {};
  const locationString = [address.city, address.state, address.country].filter(Boolean).join(', ') || 'Not specified';

  const avatarSrc = user.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${BASE}/${user.avatar}`
    : null;

  return (
    <div className="container">
      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card">
        <div className="card-banner" />

        <div className="profile-header">
          <div
            className="profile-avatar-wrap"
            onClick={() => fileRef.current.click()}
            title="Click to change photo"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={user.name} />
            ) : (
              <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
            )}
            <div className="avatar-hover-overlay">
              {loadingAvatar ? 'Uploading...' : '📷 Change'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={uploadAvatar} />

          <div className="profile-intro">
            <h1 className="profile-name">
              {user.name}
              <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {user.role}
              </span>
              <span className={`badge ${user.isActive ? 'badge-active' : 'badge-disabled'}`}>
                {user.isActive ? '● Active' : '● Deactivated'}
              </span>
            </h1>
            <p className="profile-headline">
              {user.headline || 'No headline set yet. Click Edit Profile to add one.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/edit" className="btn btn-primary btn-sm">
              ✏️ Edit Profile
            </Link>
            {user.avatar && (
              <button onClick={removeAvatar} className="btn btn-secondary btn-sm" title="Remove Avatar">
                🗑️ Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Profile Strength Progress Meter */}
        <div className="profile-meter">
          <div className="meter-header">
            <span>Profile Completeness</span>
            <span style={{ color: completionScore === 100 ? 'var(--success)' : 'var(--primary)' }}>
              {completionScore}%
            </span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${completionScore}%` }} />
          </div>
          {completionScore < 100 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              💡 Complete your profile with an avatar, bio, and social links to reach 100%.
            </p>
          )}
        </div>

        {/* Bio Section */}
        {user.bio ? (
          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
            <span className="info-label">About Me</span>
            <p style={{ marginTop: '0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {user.bio}
            </p>
          </div>
        ) : null}

        {/* Information Grid */}
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Email Address</span>
            <span className="info-value">{user.email}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Phone Number</span>
            <span className="info-value">{user.phone || 'Not provided'}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Date of Birth</span>
            <span className="info-value">
              {user.dob ? new Date(user.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Location</span>
            <span className="info-value">{locationString}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Member Since</span>
            <span className="info-value">
              {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Last Active</span>
            <span className="info-value">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
            </span>
          </div>
        </div>

        {/* Social Links Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <span className="info-label">Online Presence & Links</span>
          <div className="social-links-wrap">
            {social.github && (
              <a href={social.github.startsWith('http') ? social.github : `https://${social.github}`} target="_blank" rel="noreferrer" className="social-chip">
                🐙 GitHub
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin.startsWith('http') ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noreferrer" className="social-chip">
                💼 LinkedIn
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter.startsWith('http') ? social.twitter : `https://${social.twitter}`} target="_blank" rel="noreferrer" className="social-chip">
                🐦 Twitter / X
              </a>
            )}
            {social.website && (
              <a href={social.website.startsWith('http') ? social.website : `https://${social.website}`} target="_blank" rel="noreferrer" className="social-chip">
                🌐 Personal Website
              </a>
            )}
            {!social.github && !social.linkedin && !social.twitter && !social.website && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No social links added yet. Click <Link to="/edit">Edit</Link> to connect your profiles.
              </span>
            )}
          </div>
        </div>

        {/* Account Utilities Footer */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button onClick={handleExportData} className="btn btn-secondary btn-sm">
            📥 Export My Data (JSON)
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/password" className="btn btn-secondary btn-sm">
              🔑 Change Password
            </Link>
            <button onClick={handleDeleteAccount} className="btn btn-outline-danger btn-sm">
              ⚠️ Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
