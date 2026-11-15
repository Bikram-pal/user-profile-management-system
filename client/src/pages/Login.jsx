import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      nav('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials for testing
  const fillCredentials = (email, password) => {
    setForm({ email, password });
    setError('');
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
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Log in to manage your profile and account settings.
          </p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              required
              placeholder="e.g. admin@upms.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo One-Click Fill Box */}
        <div className="demo-box">
          <div className="demo-title">⚡ Quick Demo Logins</div>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={() => fillCredentials('admin@upms.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              title="Autofill Administrator"
            >
              👑 Fill Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('bikram@upms.com', 'user123')}
              className="btn btn-secondary btn-sm"
              title="Autofill Bikram Pal"
            >
              👤 Fill User (Bikram)
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
