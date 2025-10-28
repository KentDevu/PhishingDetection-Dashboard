// Main Settings Page with Tabbed Interface

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Server,
  Bell,
  ChevronRight,
} from "lucide-react";
import { SecuritySettingsPanel } from "../components/settings/SecuritySettingsPanel.tsx";
import { NotificationSettings } from "../components/notifications/NotificationSettings";

type SettingsTab = "notifications" | "security" | "system";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  adminOnly?: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");
  // Remove auth dependency - all settings are now accessible
  const isAdmin = true; // Always true since we don't have authentication

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
  ];

  // Show all tabs since no authentication is required
  const availableTabs = tabs;

  const renderTabContent = () => {
    switch (activeTab) {
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettingsPanel />;
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex min-h-screen">
        {/* Settings Navigation */}
        <nav className="w-80 bg-gray-800 border-r border-gray-700 p-8 overflow-y-auto shrink-0">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-700">
            <SettingsIcon size={24} className="text-green-400" />
            <h1 className="text-2xl font-bold text-white m-0">Settings</h1>
          </div>

          <div className="flex flex-col gap-2">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 p-4 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-400/10 border border-green-400/20 text-green-400"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="shrink-0">{tab.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-500" />
              </button>
            ))}
          </div>

          {!isAdmin && (
            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-400 mb-1">Limited Access</h3>
                  <p className="text-xs text-gray-400">
                    Contact your administrator for access to advanced settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Settings Content */}
        <main className="flex-1 p-8">{renderTabContent()}</main>
      </div>
    </div>
  );
}



