import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function fillDemo(role) {
    if (role === 'admin') {
      setEmail('admin@test.com');
      setPassword('Admin123!');
      return;
    }
    if (role === 'viewer') {
      setEmail('viewer@test.com');
      setPassword('Viewer123!');
      return;
    }
    setEmail('editor@test.com');
    setPassword('Editor123!');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      setBusy(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError('Login failed');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <aside className="auth-panel">
          <p className="auth-kicker">Operations Ready</p>
          <h1>Monitor uploads, moderation, and playback in one dashboard.</h1>
          <p>
            PulseTask gives your team a live command center for media ingestion, processing, and
            secure playback.
          </p>
          <div className="auth-points">
            <span>Real-time queue updates</span>
            <span>Tenant-isolated workspaces</span>
            <span>Role-based controls</span>
          </div>
        </aside>

        <form className="card auth-card" onSubmit={handleSubmit}>
          <p className="auth-form-kicker">Sign In</p>
          <h2>Welcome Back</h2>
          <p className="auth-form-note">Use one of your tenant credentials to continue.</p>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="demo-row">
            <button type="button" className="ghost" onClick={() => fillDemo('editor')}>
              Editor Demo
            </button>
            <button type="button" className="ghost" onClick={() => fillDemo('admin')}>
              Admin Demo
            </button>
            <button type="button" className="ghost" onClick={() => fillDemo('viewer')}>
              Viewer Demo
            </button>
          </div>

          <button className="primary-btn" disabled={busy}>
            {busy ? 'Signing in...' : 'Login'}
          </button>

          <p className="auth-switch">
            Need an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
