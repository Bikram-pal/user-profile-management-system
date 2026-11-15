import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BASE } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const nav = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav-bar">
      <Link to="/" className="nav-brand">
        <div className="nav-logo-icon">U</div>
        <span>UPMS</span>
      </Link>

      <nav className="nav-links">
        {user ? (
          <>
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
              Profile
            </Link>
            <Link to="/edit" className={`nav-item ${isActive('/edit') ? 'active' : ''}`}>
              Edit
            </Link>
            <Link to="/password" className={`nav-item ${isActive('/password') ? 'active' : ''}`}>
              Password
            </Link>

            {user.role === 'admin' && (
              <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
                Admin Panel
              </Link>
            )}

            <div className="nav-user-chip">
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
              <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                nav('/login');
              }}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-item ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className={`nav-item ${isActive('/register') ? 'active' : ''}`}>
              Create Account
            </Link>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  );
}
