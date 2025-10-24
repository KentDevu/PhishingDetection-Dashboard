// Sidebar Navigation Component

import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Mail,
  BarChart3,
  AlertTriangle,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  active?: boolean;
  badge?: number;
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      path: "/dashboard",
    },
    {
      id: "emails",
      label: "Emails",
      icon: <Mail size={20} />,
      path: "/emails",
      badge: 23, // Example badge for new threats
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/analytics",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: <AlertTriangle size={20} />,
      path: "/alerts",
      badge: 5, // Critical alerts
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>
      {/* Logo Section */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <Shield className="sidebar__logo-icon" size={24} />
          {!isCollapsed && (
            <span className="sidebar__logo-text">
              Phishing<span className="text-gradient-primary">Guard</span>
            </span>
          )}
        </div>
        <button
          className="sidebar__toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list">
          {sidebarItems.map((item) => (
            <li key={item.id} className="sidebar__nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__nav-link ${
                    isActive ? "sidebar__nav-link--active" : ""
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="sidebar__nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="sidebar__nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__status">
            <div className="sidebar__status-indicator"></div>
            <span className="sidebar__status-text">System Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}

// Sidebar Styles
const styles = `
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  transition: width var(--duration-normal) var(--ease-in-out);
  z-index: var(--z-sticky);
}

.sidebar--collapsed {
  width: 80px;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  min-height: 80px;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sidebar__logo-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  white-space: nowrap;
}

.sidebar__toggle {
  background: none;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  padding: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
}

.sidebar__toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sidebar__nav {
  flex: 1;
  padding: var(--spacing-lg) 0;
  overflow-y: auto;
}

.sidebar__nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar__nav-item {
  margin-bottom: var(--spacing-xs);
}

.sidebar__nav-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  border-radius: 0;
  position: relative;
}

.sidebar__nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sidebar__nav-link--active {
  background: var(--bg-accent);
  color: var(--color-primary);
  border-right: 3px solid var(--color-primary);
}

.sidebar__nav-link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
}

.sidebar__nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__nav-label {
  margin-left: var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  flex: 1;
  text-align: left;
}

.sidebar__nav-badge {
  background: var(--color-danger);
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
  margin-left: auto;
}

.sidebar__footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
}

.sidebar__status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sidebar__status-indicator {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  animation: pulse 2s infinite;
}

.sidebar__status-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--duration-normal) var(--ease-in-out);
  }
  
  .sidebar--mobile-open {
    transform: translateX(0);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("sidebar-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "sidebar-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
