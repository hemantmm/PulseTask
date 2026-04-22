import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    try {
      setError('');
      const res = await api.get('/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
  }

  async function createUser(e) {
    e.preventDefault();
    try {
      await api.post('/auth/users', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: '', email: '', password: '', role: 'viewer' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  }

  return (
    <main className="page-shell admin-page">
      <NavBar />
      <section className="content-grid single-col">
        <form className="card" onSubmit={createUser}>
          <h2>Create Tenant User</h2>
          <p className="section-lead">Invite teammates with the right role permissions.</p>
          <div className="grid-2">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button>Create User</button>
        </form>

        <section className="card">
          <h2>Users in Tenant</h2>
          <p className="section-lead">{users.length} user(s) currently active in this workspace.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tenant</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.tenantId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
      {error ? <p className="error-text app-error">{error}</p> : null}
    </main>
  );
}
