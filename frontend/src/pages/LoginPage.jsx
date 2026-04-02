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
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="error-text">{error}</p> : null}
        <div className="demo-row">
          <button type="button" className="ghost" onClick={() => fillDemo('editor')}>
            Use Editor Demo
          </button>
          <button type="button" className="ghost" onClick={() => fillDemo('admin')}>
            Use Admin Demo
          </button>
          <button type="button" className="ghost" onClick={() => fillDemo('viewer')}>
            Use Viewer Demo
          </button>
        </div>
        <button disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        <p>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
