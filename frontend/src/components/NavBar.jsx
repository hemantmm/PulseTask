import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div>
        <h1>PulseTask Media</h1>
        <p>{user?.tenantId} workspace</p>
      </div>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        {user?.role === 'admin' ? <Link to="/admin/users">Users</Link> : null}
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
