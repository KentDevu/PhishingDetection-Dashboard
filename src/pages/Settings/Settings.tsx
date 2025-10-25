// Main Settings Page with Tabbed Interface

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Server,
  Plug,
  Bell,
  ChevronRight,
} from "lucide-react";
import { SecuritySettingsPanel } from "../../components/settings/SecuritySettingsPanel.tsx";
import { SystemConfigurationPanel } from "../../components/settings/SystemConfigurationPanel";
import { NotificationSettings } from "../../components/notifications/NotificationSettings";
import "./Settings.css";

type SettingsTab = "notifications" | "security" | "system" | "integrations";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  adminOnly?: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");
  const isAdmin = true;

  const tabs: TabConfig[] = [
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
      description: "Notification preferences and alerts settings",
    },
    {
      id: "security",
      label: "Threat Settings",
      icon: <Shield size={20} />,
      description: "Threat detection and security configuration",
    },
    {
      id: "system",
      label: "System Configuration",
      icon: <Server size={20} />,
      description: "Core system and performance settings",
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: <Plug size={20} />,
      description: "Third-party services and API connections",
    },
  ];

  const availableTabs = tabs;

  const renderTabContent = () => {
    switch (activeTab) {
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettingsPanel />;
      case "system":
        return <SystemConfigurationPanel />;
      case "integrations":
        return <IntegrationsPlaceholder />;
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
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

        <main className="settings-main">{renderTabContent()}</main>
      </div>
    </div>
  );
}

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
