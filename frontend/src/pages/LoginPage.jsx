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
    <main className="auth-shell login-page">
      <section className="login-layout">
        <aside className="login-showcase">
          <p className="login-kicker">Media Control Center</p>
          <h1>Shift from upload chaos to a clean, live operations board.</h1>
          <p className="login-summary">
            PulseTask keeps ingestion, processing, and secure playback coordinated for every role in
            your team.
          </p>

          <div className="login-points">
            <span>Queue telemetry in real time</span>
            <span>Tenant-level separation by default</span>
            <span>Editors, viewers, and admins in sync</span>
          </div>

          <div className="login-metrics" aria-label="Platform highlights">
            <article>
              <strong>99.95%</strong>
              <span>Uptime SLA</span>
            </article>
            <article>
              <strong>3 Roles</strong>
              <span>Fine-grained access</span>
            </article>
            <article>
              <strong>Live</strong>
              <span>Processing visibility</span>
            </article>
          </div>
        </aside>

        <form className="card auth-card login-card" onSubmit={handleSubmit}>
          <p className="login-form-kicker">Sign In</p>
          <h2>Welcome Back</h2>
          <p className="login-form-note">Use your tenant credentials to access the dashboard.</p>

          <label className="field login-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field login-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className="error-text login-error">{error}</p> : null}

          <div className="login-demo-header">
            <p>Quick demo accounts</p>
            <span>One click fill</span>
          </div>
          <div className="login-demo-row">
            <button type="button" className="ghost" onClick={() => fillDemo('editor')}>
              Editor
            </button>
            <button type="button" className="ghost" onClick={() => fillDemo('admin')}>
              Admin
            </button>
            <button type="button" className="ghost" onClick={() => fillDemo('viewer')}>
              Viewer
            </button>
          </div>

          <button className="primary-btn login-submit" disabled={busy}>
            {busy ? 'Signing in...' : 'Login'}
          </button>

          <p className="auth-switch login-switch">
            Need an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
