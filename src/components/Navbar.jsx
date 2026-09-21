import { NavLink } from "react-router-dom";

export default function Navbar({
  user,
  darkMode,
  onToggleTheme,
  onSignOut,
}) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-brand">
          Expense Tracker
        </NavLink>

        <div className="navbar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Profile
          </NavLink>
        </div>

        <div className="navbar-actions">
          <span className="navbar-email">{user?.email}</span>

          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
          >
            {darkMode ? "Light mode" : "Night mode"}
          </button>

          <button
            type="button"
            className="secondary"
            onClick={onSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}