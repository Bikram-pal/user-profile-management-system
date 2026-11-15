import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Compute password strength (0 to 100)
  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 10) score += 20;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 25;
    if (/\d/.test(pass)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 10;

    if (score < 40) return { score, label: 'Weak', color: 'var(--danger)' };
    if (score < 75) return { score, label: 'Medium', color: 'var(--warning)' };
    return { score: 100, label: 'Strong', color: 'var(--success)' };
  };

  const strength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (form.newPassword.length < 6) {
      setMsg({ type: 'danger', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: 'danger', text: 'New password and confirmation password do not match.' });
      return;
    }

    setLoading(true);

    try {
      await api.put('/users/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setMsg({ type: 'success', text: 'Password successfully updated!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Security & Password</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Ensure your account is protected with a strong password.
            </p>
          </div>
          <Link to="/" className="btn btn-secondary btn-sm">
            ← Profile
          </Link>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>
            {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group">
            <label>Current Password *</label>
            <div className="input-password-wrapper">
              <input
                type={showCurrent ? 'text' : 'password'}
                className="form-control"
                required
                placeholder="Enter your existing password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label>New Password (min 6 characters) *</label>
            <div className="input-password-wrapper">
              <input
                type={showNew ? 'text' : 'password'}
                className="form-control"
                required
                minLength={6}
                placeholder="Enter your new secure password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Live Password Strength Indicator */}
            {form.newPassword && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span>Password Strength</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm New Password *</label>
            <input
              type="password"
              className="form-control"
              required
              minLength={6}
              placeholder="Re-type your new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Updating Password...' : '🔒 Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
