// Main Settings Page with Tabbed Interface

import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Server,
  Plug,
  Users,
  Bell,
  ChevronRight,
} from "lucide-react";
import { UserPreferencesSettings } from "../components/settings/UserPreferencesSettings";
import { SecuritySettingsPanel } from "../components/settings/SecuritySettingsPanel.tsx";
import { SystemConfigurationPanel } from "../components/settings/SystemConfigurationPanel";
import { NotificationSettings } from "../components/notifications/NotificationSettings";
import { useSystemSettings } from "../hooks/useSystemSettings";

type SettingsTab =
  | "preferences"
  | "notifications"
  | "security"
  | "system"
  | "integrations"
  | "users";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  adminOnly?: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("preferences");
  const { isAdmin } = useSystemSettings();

  const tabs: TabConfig[] = [
    {
      id: "preferences",
      label: "User Preferences",
      icon: <User size={20} />,
      description: "Personal settings and interface preferences",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
      description: "Notification preferences and alerts settings",
    },
    {
      id: "security",
      label: "Security Settings",
      icon: <Shield size={20} />,
      description: "Authentication and access control",
      adminOnly: true,
    },
    {
      id: "system",
      label: "System Configuration",
      icon: <Server size={20} />,
      description: "Core system and performance settings",
      adminOnly: true,
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: <Plug size={20} />,
      description: "Third-party services and API connections",
      adminOnly: true,
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users size={20} />,
      description: "Manage users and permissions",
      adminOnly: true,
    },
  ];

  // Filter tabs based on admin permissions
  const availableTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  const renderTabContent = () => {
    switch (activeTab) {
      case "preferences":
        return <UserPreferencesSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return isAdmin ? <SecuritySettingsPanel /> : <AccessDenied />;
      case "system":
        return isAdmin ? <SystemConfigurationPanel /> : <AccessDenied />;
      case "integrations":
        return isAdmin ? <IntegrationsPlaceholder /> : <AccessDenied />;
      case "users":
        return isAdmin ? <UserManagementPlaceholder /> : <AccessDenied />;
      default:
        return <UserPreferencesSettings />;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Settings Navigation */}
        <nav className="settings-nav">
          <div className="settings-nav__header">
            <SettingsIcon size={24} />
            <h1>Settings</h1>
          </div>

          <div className="settings-nav__tabs">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="tab-icon">{tab.icon}</div>
                <div className="tab-content">
                  <div className="tab-label">{tab.label}</div>
                  <div className="tab-description">{tab.description}</div>
                </div>
                <ChevronRight size={16} className="tab-arrow" />
              </button>
            ))}
          </div>

          {!isAdmin && (
            <div className="admin-notice">
              <Shield size={20} />
              <div>
                <h3>Limited Access</h3>
                <p>
                  Contact your administrator for access to advanced settings.
                </p>
              </div>
            </div>
          )}
        </nav>

        {/* Settings Content */}
        <main className="settings-main">{renderTabContent()}</main>
      </div>
    </div>
  );
}

// Access Denied Component
function AccessDenied() {
  return (
    <div className="access-denied">
      <Shield size={64} />
      <h2>Access Denied</h2>
      <p>
        You don't have permission to access this section. Please contact your
        administrator.
      </p>
    </div>
  );
}

// Placeholder Components (to be implemented later)
function IntegrationsPlaceholder() {
  return (
    <div className="placeholder-panel">
      <div className="placeholder-content">
        <Plug size={48} />
        <h2>Integrations</h2>
        <p>Configure third-party integrations and API connections.</p>
        <div className="placeholder-features">
          <div className="feature-item">
            <div className="feature-icon">📧</div>
            <div>
              <h4>Email Providers</h4>
              <p>Connect to Gmail, Outlook, and other email services</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <div>
              <h4>Security Tools</h4>
              <p>Integrate with SIEM and threat intelligence platforms</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <div>
              <h4>Analytics</h4>
              <p>Export data to business intelligence tools</p>
            </div>
          </div>
        </div>
        <div className="coming-soon">Coming Soon</div>
      </div>
    </div>
  );
}

function UserManagementPlaceholder() {
  return (
    <div className="placeholder-panel">
      <div className="placeholder-content">
        <Users size={48} />
        <h2>User Management</h2>
        <p>Manage users, roles, and permissions across the system.</p>
        <div className="placeholder-features">
          <div className="feature-item">
            <div className="feature-icon">👥</div>
            <div>
              <h4>User Accounts</h4>
              <p>Create, edit, and deactivate user accounts</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔑</div>
            <div>
              <h4>Role Management</h4>
              <p>Define roles and assign permissions</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📋</div>
            <div>
              <h4>Audit Logs</h4>
              <p>Track user activities and system changes</p>
            </div>
          </div>
        </div>
        <div className="coming-soon">Coming Soon</div>
      </div>
    </div>
  );
}

// Settings Page Styles
const styles = `
.settings-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.settings-container {
  display: flex;
  min-height: 100vh;
}

/* Settings Navigation */
.settings-nav {
  width: 320px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  padding: var(--spacing-xl);
  overflow-y: auto;
  flex-shrink: 0;
}

.settings-nav__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.settings-nav__header svg {
  color: var(--color-primary);
}

.settings-nav__header h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.settings-nav__tabs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* Settings Tabs */
.settings-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-lg);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  text-align: left;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  position: relative;
}

.settings-tab:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

.settings-tab.active {
  background: rgba(19, 255, 160, 0.1);
  border-color: var(--color-primary);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
}

.settings-tab.active .tab-icon {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--bg-primary);
}

.tab-content {
  flex: 1;
  min-width: 0;
}

.tab-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.tab-description {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: 1.4;
}

.tab-arrow {
  color: var(--text-muted);
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
}

.settings-tab:hover .tab-arrow {
  color: var(--text-secondary);
  transform: translateX(2px);
}

.settings-tab.active .tab-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

/* Admin Notice */
.admin-notice {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: var(--radius-lg);
}

.admin-notice svg {
  color: #ffc107;
  flex-shrink: 0;
  margin-top: 2px;
}

.admin-notice h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.admin-notice p {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: 1.4;
}

/* Settings Main Content */
.settings-main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}

/* Access Denied */
.access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--spacing-xl);
}

.access-denied svg {
  color: var(--color-warning);
  margin-bottom: var(--spacing-lg);
}

.access-denied h2 {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.access-denied p {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-muted);
  max-width: 400px;
  line-height: 1.5;
}

/* Placeholder Panels */
.placeholder-panel {
  padding: var(--spacing-xl);
  max-width: 800px;
  margin: 0 auto;
}

.placeholder-content {
  text-align: center;
  padding: var(--spacing-2xl);
}

.placeholder-content svg {
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.placeholder-content h2 {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.placeholder-content > p {
  margin: 0 0 var(--spacing-2xl);
  font-size: var(--font-size-md);
  color: var(--text-muted);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.placeholder-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  text-align: left;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.feature-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.feature-item h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.feature-item p {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: 1.4;
}

.coming-soon {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(19, 255, 160, 0.1);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .settings-container {
    flex-direction: column;
  }

  .settings-nav {
    width: 100%;
    padding: var(--spacing-lg);
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
  }

  .settings-nav__tabs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }

  .settings-tab {
    padding: var(--spacing-md);
  }

  .tab-content {
    display: none;
  }

  .settings-tab.active .tab-content {
    display: block;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm);
    z-index: 10;
  }
}

@media (max-width: 768px) {
  .settings-nav__tabs {
    grid-template-columns: 1fr;
  }

  .placeholder-features {
    grid-template-columns: 1fr;
  }

  .feature-item {
    padding: var(--spacing-md);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("settings-page-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "settings-page-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
