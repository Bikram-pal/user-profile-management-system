import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    headline: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Compute password strength
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

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        headline: form.headline.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      nav('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            className="nav-logo-icon"
            style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem auto', fontSize: '1.4rem' }}
          >
            U
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join UPMS to manage your profile, security, and credentials.
          </p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-control"
              required
              minLength={2}
              maxLength={60}
              placeholder="e.g. Alex Johnson"
              value={form.name}
              onChange={setField('name')}
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              className="form-control"
              required
              placeholder="e.g. alex@example.com"
              value={form.email}
              onChange={setField('email')}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Headline / Tagline</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Software Engineer"
                value={form.headline}
                onChange={setField('headline')}
              />
            </div>

            <div className="form-group">
              <label>Phone (optional)</label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={form.phone}
                onChange={setField('phone')}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password (min 6 characters) *</label>
            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                required
                minLength={6}
                placeholder="Choose a strong password"
                value={form.password}
                onChange={setField('password')}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Live Password Strength Meter */}
            {form.password && (
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

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              className="form-control"
              required
              minLength={6}
              placeholder="Re-type your password"
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
