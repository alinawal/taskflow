import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-border bg-surface">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link to="/dashboard" className="font-display text-xl font-semibold tracking-tight text-ink">
          TaskFlow
        </Link>

        {user && (
          <div className="flex items-center gap-5">
            <NotificationBell />
            <span className="hidden text-sm text-muted sm:inline">
              {user.name} <span className="font-mono text-xs">({user.role})</span>
            </span>
            <button type="button" onClick={handleLogout} className="btn-secondary">
              Sign out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
