// Header Component with Search and User Actions

import { useState } from "react";
import { Search, User, Menu } from "lucide-react";
import { NotificationPanel } from "../notifications/NotificationPanel";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="header">
      {/* Mobile Menu Toggle */}
      <button className="header__mobile-toggle">
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="header__title">
        <h1>Dashboard</h1>
        <p className="header__subtitle">Phishing Detection Overview</p>
      </div>

      {/* Search Bar */}
      <div className="header__search">
        <div className="search-input">
          <Search className="search-input__icon" size={18} />
          <input
            type="text"
            placeholder="Search emails, domains, threats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input__field"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="header__actions">
        {/* Notifications */}
        <NotificationPanel />

        {/* User Profile */}
        <div className="header__profile">
          <button className="header__profile-btn">
            <div className="header__avatar">
              <User size={16} />
            </div>
            <div className="header__user-info">
              <span className="header__username">Admin</span>
              <span className="header__user-role">Security Analyst</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

// Header Styles
const styles = `
.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  min-height: 80px;
}

.header__mobile-toggle {
  display: none;
  background: none;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.header__mobile-toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.header__title h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.header__subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  line-height: var(--line-height-tight);
}

.header__search {
  flex: 1;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  position: relative;
  width: 100%;
}

.search-input__icon {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input__field {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.search-input__field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

.search-input__field::placeholder {
  color: var(--text-muted);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header__action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  white-space: nowrap;
}

.header__action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.header__action-btn--primary {
  background: var(--gradient-primary);
  border-color: var(--color-primary);
  color: var(--text-inverse);
}

.header__action-btn--primary:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.header__notification {
  position: relative;
}

.header__notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-danger);
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

.header__profile-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: none;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.header__profile-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
}

.header__avatar {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
}

.header__user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.header__username {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.header__user-role {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: var(--line-height-tight);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    padding: var(--spacing-md);
  }

  .header__mobile-toggle {
    display: block;
  }

  .header__title {
    display: none;
  }

  .header__search {
    max-width: none;
    margin: 0;
  }

  .header__action-btn span {
    display: none;
  }

  .header__user-info {
    display: none;
  }
}

@media (max-width: 480px) {
  .header__search {
    flex: 0;
    min-width: 200px;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("header-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "header-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
