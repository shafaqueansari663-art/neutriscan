import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AppShell.css'

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <Link to="/" className="app-shell__brand">
          Nutri<span className="app-shell__brand-accent">Scan</span>
        </Link>
        <nav className="app-shell__nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/scan" className={({ isActive }) => (isActive ? 'active' : '')}>
            Scan
          </NavLink>
        </nav>
        <div className="app-shell__user">
          <span className="app-shell__username" title={user?.username}>
            {user?.username}
          </span>
          <button type="button" className="btn btn--ghost" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  )
}
