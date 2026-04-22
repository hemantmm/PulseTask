import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    tenantId: '',
    role: 'editor'
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      setBusy(true);
      const res = await api.post('/auth/register', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <aside className="auth-panel">
          <p className="auth-kicker">Get Started</p>
          <h1>Create your tenant workspace and onboard your media team.</h1>
          <p>
            Configure roles from day one so admins, editors, and viewers each get exactly the
            access they need.
          </p>
          <div className="auth-points">
            <span>Fast self-service onboarding</span>
            <span>Multi-role user model</span>
            <span>Secure tenant separation</span>
          </div>
        </aside>

        <form className="card auth-card" onSubmit={handleSubmit}>
          <p className="auth-form-kicker">Register</p>
          <h2>Create Account</h2>
          <p className="auth-form-note">Set up your identity and tenant details.</p>

          <label className="field">
            <span>Full Name</span>
            <input
              placeholder="Alex Parker"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Tenant Key</span>
            <input
              placeholder="organization-key"
              value={form.tenantId}
              onChange={(e) => setForm((prev) => ({ ...prev, tenantId: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-btn" disabled={busy}>
            {busy ? 'Creating...' : 'Register'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
