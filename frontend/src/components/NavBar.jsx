import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'viewer';

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <p className="topbar-kicker">PulseTask</p>
        <h1>Media Control Room</h1>
        <p className="topbar-meta">{user?.tenantId} workspace</p>
      </div>
      <nav>
        <Link className="nav-link" to="/dashboard">
          Dashboard
        </Link>
        {user?.role === 'admin' ? (
          <Link className="nav-link" to="/admin/users">
            Users
          </Link>
        ) : null}
        <span className="topbar-user-chip">{role}</span>
        <button
          className="ghost"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
