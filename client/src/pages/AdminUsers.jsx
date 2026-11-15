import { useEffect, useState } from 'react';
import api, { BASE, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [usersData, setUsersData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, deactivated: 0, admins: 0, newThisWeek: 0 });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // for user detail modal

  // Load stats
  const loadStats = async () => {
    try {
      const { data } = await api.get('/users/stats');
      setStats(data);
    } catch {
      // stats optional fallback
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users', {
        params: {
          search,
          role: roleFilter,
          status: statusFilter,
          sort: sortBy,
          page,
          limit: 8,
        },
      });
      setUsersData(data);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  // Toggle user active status
  const toggleStatus = async (targetUser) => {
    try {
      await api.put(`/users/${targetUser._id}`, { isActive: !targetUser.isActive });
      setNotification(`User ${targetUser.name} is now ${!targetUser.isActive ? 'Active' : 'Disabled'}.`);
      loadUsers();
      loadStats();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  // Toggle admin role
  const toggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/users/${targetUser._id}`, { role: newRole });
      setNotification(`User ${targetUser.name} updated to role "${newRole}".`);
      loadUsers();
      loadStats();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  // Delete user
  const deleteUser = async (targetUser) => {
    if (!confirm(`Are you sure you want to permanently delete user "${targetUser.name}"?`)) return;

    try {
      await api.delete(`/users/${targetUser._id}`);
      setNotification(`User "${targetUser.name}" has been deleted.`);
      loadUsers();
      loadStats();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  // Export users list as CSV
  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Phone', 'Created At'];
    const rows = usersData.users.map((u) => [
      u._id,
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      u.isActive ? 'Active' : 'Disabled',
      `"${u.phone || ''}"`,
      new Date(u.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `UPMS_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Manage platform members, assign administrator privileges, and monitor account status.
          </p>
        </div>
        <button onClick={exportCSV} className="btn btn-secondary btn-sm">
          📊 Export CSV
        </button>
      </div>

      {/* Notifications & Errors */}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {notification && <div className="alert alert-success">✅ {notification}</div>}

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.total || usersData.total}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: 'var(--success)' }}>
            {stats.active}
          </span>
          <span className="stat-label">Active Accounts</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: 'var(--warning)' }}>
            {stats.admins}
          </span>
          <span className="stat-label">Administrators</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: 'var(--info)' }}>
            {stats.newThisWeek}
          </span>
          <span className="stat-label">Joined this Week</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Filter & Search Toolbar */}
        <div className="admin-toolbar">
          <form className="admin-search-wrap" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Filter by Role */}
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>

            {/* Filter by Status */}
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>

            {/* Sort by */}
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData.users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                usersData.users.map((u) => {
                  const avatarSrc = u.avatar
                    ? u.avatar.startsWith('http')
                      ? u.avatar
                      : `${BASE}/${u.avatar}`
                    : null;

                  const isSelf = String(u._id) === String(currentUser._id);

                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="table-user-cell">
                          <div className="table-avatar">
                            {avatarSrc ? (
                              <img
                                src={avatarSrc}
                                alt={u.name}
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            ) : (
                              u.name[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {u.name} {isSelf && <small style={{ color: 'var(--primary)' }}>(You)</small>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                          {u.role}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${u.isActive ? 'badge-active' : 'badge-disabled'}`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="btn btn-secondary btn-sm"
                            title="View Full Profile"
                          >
                            👁️ View
                          </button>

                          <button
                            onClick={() => toggleStatus(u)}
                            className="btn btn-secondary btn-sm"
                            title={u.isActive ? 'Deactivate account' : 'Activate account'}
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>

                          <button
                            onClick={() => toggleRole(u)}
                            className="btn btn-secondary btn-sm"
                            title={u.role === 'admin' ? 'Demote to regular user' : 'Promote to administrator'}
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => deleteUser(u)}
                              className="btn btn-outline-danger btn-sm"
                              title="Delete user account"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination">
          <div>
            Showing <b>{usersData.users.length}</b> of <b>{usersData.total}</b> total users
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn btn-secondary btn-sm"
            >
              ← Previous
            </button>
            <span style={{ fontWeight: 600 }}>
              Page {usersData.page} / {usersData.pages || 1}
            </span>
            <button
              disabled={page >= usersData.pages}
              onClick={() => setPage(page + 1)}
              className="btn btn-secondary btn-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>User Profile Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                }}
              >
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar.startsWith('http') ? selectedUser.avatar : `${BASE}/${selectedUser.avatar}`}
                    alt={selectedUser.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  selectedUser.name[0].toUpperCase()
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedUser.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedUser.email}</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <span className={`badge ${selectedUser.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                    {selectedUser.role}
                  </span>
                  <span className={`badge ${selectedUser.isActive ? 'badge-active' : 'badge-disabled'}`}>
                    {selectedUser.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="info-item">
                <span className="info-label">Headline</span>
                <span className="info-value">{selectedUser.headline || 'None'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{selectedUser.phone || 'None'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">
                  {[selectedUser.address?.city, selectedUser.address?.state, selectedUser.address?.country]
                    .filter(Boolean)
                    .join(', ') || 'Not specified'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Registered On</span>
                <span className="info-value">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedUser.bio && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                <span className="info-label">Bio</span>
                <p style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{selectedUser.bio}</p>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedUser(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
