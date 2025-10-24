// Notification Settings Component

import { useState, useEffect } from "react";
import { Bell, Volume2, VolumeX, Monitor, Smartphone } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import type { NotificationPreferences } from "../../types/notifications";

export function NotificationSettings() {
  const { preferences, updatePreferences, requestBrowserPermission } =
    useNotifications();
  const [localPreferences, setLocalPreferences] =
    useState<NotificationPreferences>(preferences);
  const [isChanged, setIsChanged] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    setLocalPreferences(preferences);

    // Check current notification permission
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [preferences]);

  useEffect(() => {
    // Check if preferences have changed
    const hasChanged =
      JSON.stringify(localPreferences) !== JSON.stringify(preferences);
    setIsChanged(hasChanged);
  }, [localPreferences, preferences]);

  const handlePreferenceChange = (
    key: keyof NotificationPreferences,
    value: any
  ) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    setIsChanged(false);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setIsChanged(false);
  };

  const handleRequestPermission = async () => {
    const permission = await requestBrowserPermission();
    setPermissionStatus(permission ? "granted" : "denied");
  };

  const testNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification from your phishing detection platform.",
        icon: "/favicon.ico",
      });
    }
  };

  return (
    <div className="notification-settings">
      <div className="notification-settings__header">
        <div className="notification-settings__title">
          <Bell size={24} />
          <h2>Notification Settings</h2>
        </div>
        <p>
          Configure how and when you receive notifications from the platform.
        </p>
      </div>

      {/* Permission Status */}
      <div className="notification-settings__section">
        <h3>Browser Permissions</h3>
        <div className="permission-status">
          <div className="permission-status__info">
            <Monitor size={20} />
            <div>
              <h4>Browser Notifications</h4>
              <p>Allow the platform to show desktop notifications</p>
            </div>
          </div>
          <div className="permission-status__actions">
            <span
              className={`permission-badge permission-badge--${permissionStatus}`}
            >
              {permissionStatus === "granted"
                ? "Enabled"
                : permissionStatus === "denied"
                ? "Blocked"
                : "Not Set"}
            </span>
            {permissionStatus !== "granted" && (
              <button
                className="btn btn--primary btn--sm"
                onClick={handleRequestPermission}
              >
                Enable
              </button>
            )}
            {permissionStatus === "granted" && (
              <button
                className="btn btn--outline btn--sm"
                onClick={testNotification}
              >
                Test
              </button>
            )}
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="notification-settings__section">
        <h3>General Settings</h3>

        <div className="setting-item">
          <div className="setting-item__info">
            <Bell size={20} />
            <div>
              <h4>Browser Notifications</h4>
              <p>Show notifications in your browser</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.browser_notifications}
              onChange={(e) =>
                handlePreferenceChange(
                  "browser_notifications",
                  e.target.checked
                )
              }
              disabled={permissionStatus !== "granted"}
            />
            <span className="toggle__slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-item__info">
            <Smartphone size={20} />
            <div>
              <h4>Email Notifications</h4>
              <p>Receive notifications via email</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.email_notifications}
              onChange={(e) =>
                handlePreferenceChange("email_notifications", e.target.checked)
              }
            />
            <span className="toggle__slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-item__info">
            {localPreferences.sound_enabled ? (
              <Volume2 size={20} />
            ) : (
              <VolumeX size={20} />
            )}
            <div>
              <h4>Sound Notifications</h4>
              <p>Play sound when notifications arrive</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.sound_enabled}
              onChange={(e) =>
                handlePreferenceChange("sound_enabled", e.target.checked)
              }
            />
            <span className="toggle__slider"></span>
          </label>
        </div>
      </div>

      {/* Notification Types */}
      <div className="notification-settings__section">
        <h3>Notification Types</h3>

        {Object.entries(localPreferences.notification_types).map(
          ([type, typeSettings]) => (
            <div key={type} className="setting-item">
              <div className="setting-item__info">
                <span className={`type-icon type-icon--${type}`}>
                  {getTypeIcon(type)}
                </span>
                <div>
                  <h4>{formatTypeName(type)}</h4>
                  <p>{getTypeDescription(type)}</p>
                </div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={typeSettings.enabled}
                  onChange={(e) =>
                    handlePreferenceChange("notification_types", {
                      ...localPreferences.notification_types,
                      [type]: {
                        ...typeSettings,
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
                <span className="toggle__slider"></span>
              </label>
            </div>
          )
        )}
      </div>

      {/* Additional Alert Settings */}
      <div className="notification-settings__section">
        <h3>Alert Categories</h3>

        <div className="setting-item">
          <div className="setting-item__info">
            <span className="type-icon">🛡️</span>
            <div>
              <h4>Threat Alerts</h4>
              <p>Security threats and phishing attempts detected</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.threat_alerts}
              onChange={(e) =>
                handlePreferenceChange("threat_alerts", e.target.checked)
              }
            />
            <span className="toggle__slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-item__info">
            <span className="type-icon">⚙️</span>
            <div>
              <h4>System Updates</h4>
              <p>System status updates and maintenance notifications</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.system_updates}
              onChange={(e) =>
                handlePreferenceChange("system_updates", e.target.checked)
              }
            />
            <span className="toggle__slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-item__info">
            <span className="type-icon">📧</span>
            <div>
              <h4>Email Reports</h4>
              <p>Email scan results and processing status</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.email_reports}
              onChange={(e) =>
                handlePreferenceChange("email_reports", e.target.checked)
              }
            />
            <span className="toggle__slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-item__info">
            <span className="type-icon">📊</span>
            <div>
              <h4>Weekly Summary</h4>
              <p>Weekly reports and analytics summaries</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.weekly_summary}
              onChange={(e) =>
                handlePreferenceChange("weekly_summary", e.target.checked)
              }
            />
            <span className="toggle__slider"></span>
          </label>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="notification-settings__section">
        <h3>Quiet Hours</h3>

        <div className="setting-item">
          <div className="setting-item__info">
            <div>
              <h4>Do Not Disturb</h4>
              <p>Disable notifications during specified hours</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localPreferences.do_not_disturb}
              onChange={(e) =>
                handlePreferenceChange("do_not_disturb", e.target.checked)
              }
            />
            <span className="toggle__slider"></span>
          </label>
        </div>

        {localPreferences.do_not_disturb_schedule && (
          <div className="setting-item">
            <div className="setting-item__info">
              <div>
                <h4>Schedule Do Not Disturb</h4>
                <p>Set specific hours for do not disturb mode</p>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={localPreferences.do_not_disturb_schedule.enabled}
                onChange={(e) =>
                  handlePreferenceChange("do_not_disturb_schedule", {
                    ...localPreferences.do_not_disturb_schedule,
                    enabled: e.target.checked,
                  })
                }
                disabled={!localPreferences.do_not_disturb}
              />
              <span className="toggle__slider"></span>
            </label>
          </div>
        )}

        {localPreferences.do_not_disturb_schedule?.enabled && (
          <div className="quiet-hours-config">
            <div className="time-range">
              <div className="time-input">
                <label>From</label>
                <input
                  type="time"
                  value={localPreferences.do_not_disturb_schedule.start_time}
                  onChange={(e) =>
                    handlePreferenceChange("do_not_disturb_schedule", {
                      ...localPreferences.do_not_disturb_schedule!,
                      start_time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="time-input">
                <label>To</label>
                <input
                  type="time"
                  value={localPreferences.do_not_disturb_schedule.end_time}
                  onChange={(e) =>
                    handlePreferenceChange("do_not_disturb_schedule", {
                      ...localPreferences.do_not_disturb_schedule!,
                      end_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Actions */}
      {isChanged && (
        <div className="notification-settings__actions">
          <button className="btn btn--outline" onClick={handleReset}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getTypeIcon(type: string): string {
  switch (type) {
    case "threat":
      return "🛡️";
    case "system":
      return "⚙️";
    case "email":
      return "📧";
    case "success":
      return "✅";
    case "warning":
      return "⚠️";
    case "error":
      return "❌";
    case "info":
      return "ℹ️";
    default:
      return "📢";
  }
}

function formatTypeName(type: string): string {
  switch (type) {
    case "threat":
      return "Threat Alerts";
    case "system":
      return "System Updates";
    case "email":
      return "Email Notifications";
    case "success":
      return "Success Messages";
    case "warning":
      return "Warnings";
    case "error":
      return "Error Messages";
    case "info":
      return "Information";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

function getTypeDescription(type: string): string {
  switch (type) {
    case "threat":
      return "Security threats and phishing attempts detected";
    case "system":
      return "System status updates and maintenance notifications";
    case "email":
      return "Email scan results and processing status";
    case "success":
      return "Successful operations and confirmations";
    case "warning":
      return "Important warnings that require attention";
    case "error":
      return "System errors and failed operations";
    case "info":
      return "General information and tips";
    default:
      return "Notifications of this type";
  }
}

// Notification Settings Styles
const styles = `
.notification-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.notification-settings__header {
  margin-bottom: var(--spacing-2xl);
}

.notification-settings__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.notification-settings__title svg {
  color: var(--color-primary);
}

.notification-settings__title h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.notification-settings__header p {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  max-width: 600px;
}

.notification-settings__section {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.notification-settings__section h3 {
  margin: 0 0 var(--spacing-lg);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.permission-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
}

.permission-status__info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.permission-status__info svg {
  color: var(--text-muted);
}

.permission-status__info h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.permission-status__info p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.permission-status__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.permission-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.permission-badge--granted {
  background: rgba(19, 255, 160, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(19, 255, 160, 0.2);
}

.permission-badge--denied {
  background: rgba(255, 107, 107, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.permission-badge--default {
  background: rgba(255, 193, 7, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--border-secondary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item__info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.setting-item__info svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 14px;
  flex-shrink: 0;
}

.setting-item__info h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.setting-item__info p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle__slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all var(--duration-normal) var(--ease-in-out);
}

.toggle__slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-muted);
  border-radius: 50%;
  transition: all var(--duration-normal) var(--ease-in-out);
}

.toggle input:checked + .toggle__slider {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.toggle input:checked + .toggle__slider:before {
  transform: translateX(20px);
  background-color: white;
}

.toggle input:disabled + .toggle__slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.quiet-hours-config {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
}

.time-range {
  display: flex;
  gap: var(--spacing-xl);
}

.time-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.time-input label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.time-input input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.time-input input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

.notification-settings__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-xl);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn--sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.btn--primary {
  background: var(--color-primary);
  color: var(--bg-primary);
}

.btn--primary:hover {
  background: #00CC80;
}

.btn--outline {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.btn--outline:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .notification-settings {
    padding: var(--spacing-lg);
  }
  
  .permission-status,
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .permission-status__actions,
  .notification-settings__actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .time-range {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("notification-settings-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "notification-settings-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
