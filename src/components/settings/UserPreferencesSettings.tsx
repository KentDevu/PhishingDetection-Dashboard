// User Preferences Settings Component

import { useState } from "react";
import {
  User,
  Monitor,
  Globe,
  Clock,
  Bell,
  RefreshCw,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import type { UserPreferences } from "../../models/settings";

export function UserPreferencesSettings() {
  const {
    data: preferences,
    loading,
    error,
    updatePreferences,
    resetToDefaults,
  } = useUserPreferences();

  const [localChanges, setLocalChanges] = useState<Partial<UserPreferences>>(
    {}
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentPreferences = { ...preferences, ...localChanges };

  const handleFieldChange = (field: keyof UserPreferences, value: any) => {
    setLocalChanges((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(localChanges).length === 0) return;

    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      await updatePreferences(localChanges);
      setLocalChanges({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all preferences to default values?"
    );
    if (!confirmed) return;

    try {
      await resetToDefaults();
      setLocalChanges({});
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  };

  const themeOptions = [
    { value: "light", label: "Light Theme" },
    { value: "dark", label: "Dark Theme" },
    { value: "auto", label: "Auto (System)" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "ja", label: "Japanese" },
  ];

  const timezoneOptions = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "Europe/London", label: "GMT" },
    { value: "Europe/Paris", label: "Central European Time" },
    { value: "Asia/Tokyo", label: "Japan Standard Time" },
  ];

  const dateFormatOptions = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  const refreshIntervals = [
    { value: 30, label: "30 seconds" },
    { value: 60, label: "1 minute" },
    { value: 300, label: "5 minutes" },
    { value: 600, label: "10 minutes" },
    { value: 1800, label: "30 minutes" },
  ];

  const pageSizes = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  if (loading && !preferences) {
    return (
      <div className="user-preferences-settings">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-preferences-settings">
        <div className="settings-error">
          <AlertTriangle size={48} />
          <h3>Failed to Load Preferences</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-preferences-settings">
      <div className="settings-header">
        <div className="settings-header__title">
          <User size={24} />
          <div>
            <h2>User Preferences</h2>
            <p>Customize your personal experience and interface settings</p>
          </div>
        </div>

        <div className="settings-actions">
          {saveSuccess && (
            <div className="save-success">
              <Check size={16} />
              <span>Saved successfully</span>
            </div>
          )}

          <button
            className="btn btn--secondary"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>

          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saveLoading || Object.keys(localChanges).length === 0}
          >
            {saveLoading ? (
              <RefreshCw size={16} className="spinning" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* Appearance Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Monitor size={20} />
            <h3>Appearance</h3>
            <p>Theme and display preferences</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Theme</label>
              <select
                value={currentPreferences.theme || "auto"}
                onChange={(e) =>
                  handleFieldChange("theme", e.target.value as any)
                }
              >
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-description">
                Choose your preferred color theme
              </p>
            </div>

            <div className="setting-field">
              <label>Compact View</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={currentPreferences.compact_view || false}
                  onChange={(e) =>
                    handleFieldChange("compact_view", e.target.checked)
                  }
                />
                <span>Use compact layout for tables and lists</span>
              </div>
            </div>
          </div>
        </div>

        {/* Localization Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Globe size={20} />
            <h3>Localization</h3>
            <p>Language and regional settings</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Language</label>
              <select
                value={currentPreferences.language || "en"}
                onChange={(e) => handleFieldChange("language", e.target.value)}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-field">
              <label>Timezone</label>
              <select
                value={currentPreferences.timezone || "UTC"}
                onChange={(e) => handleFieldChange("timezone", e.target.value)}
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-field">
              <label>Date Format</label>
              <select
                value={currentPreferences.date_format || "YYYY-MM-DD"}
                onChange={(e) =>
                  handleFieldChange("date_format", e.target.value as any)
                }
              >
                {dateFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-field">
              <label>Time Format</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="time_format"
                    value="12h"
                    checked={currentPreferences.time_format === "12h"}
                    onChange={(e) =>
                      handleFieldChange("time_format", e.target.value as any)
                    }
                  />
                  <span>12-hour (AM/PM)</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="time_format"
                    value="24h"
                    checked={currentPreferences.time_format === "24h"}
                    onChange={(e) =>
                      handleFieldChange("time_format", e.target.value as any)
                    }
                  />
                  <span>24-hour</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Interface Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Clock size={20} />
            <h3>Interface</h3>
            <p>Dashboard and data display preferences</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Auto-refresh Interval</label>
              <select
                value={currentPreferences.dashboard_refresh_interval || 300}
                onChange={(e) =>
                  handleFieldChange(
                    "dashboard_refresh_interval",
                    parseInt(e.target.value)
                  )
                }
              >
                {refreshIntervals.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-description">
                How often to refresh dashboard data
              </p>
            </div>

            <div className="setting-field">
              <label>Default Page Size</label>
              <select
                value={currentPreferences.default_page_size || 25}
                onChange={(e) =>
                  handleFieldChange(
                    "default_page_size",
                    parseInt(e.target.value)
                  )
                }
              >
                {pageSizes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-description">
                Number of items to show per page in tables
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h3>Notifications</h3>
            <p>Alert and sound preferences</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Notifications</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={currentPreferences.notifications_enabled !== false}
                  onChange={(e) =>
                    handleFieldChange("notifications_enabled", e.target.checked)
                  }
                />
                <span>Enable desktop notifications</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Sound Effects</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={currentPreferences.sound_enabled !== false}
                  onChange={(e) =>
                    handleFieldChange("sound_enabled", e.target.checked)
                  }
                />
                <span>Play sounds for alerts and notifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Preferences Settings Styles
const styles = `
.user-preferences-settings {
  padding: var(--spacing-xl);
  max-width: 1000px;
  margin: 0 auto;
}

/* Loading and Error States */
.settings-loading,
.settings-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-lg);
  text-align: center;
}

.settings-error svg {
  color: var(--color-danger);
}

.settings-error h3 {
  margin: 0;
  color: var(--text-primary);
}

.settings-error p {
  margin: 0;
  color: var(--text-muted);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Header */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.settings-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.settings-header__title svg {
  color: var(--color-primary);
}

.settings-header h2 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.settings-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.settings-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.save-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  border: 1px solid transparent;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--bg-primary);
  border-color: var(--color-primary);
}

.btn--primary:hover:not(:disabled) {
  background: #00CC80;
  border-color: #00CC80;
  transform: translateY(-1px);
}

.btn--secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--color-primary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Content */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

/* Settings Sections */
.settings-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-primary);
}

.section-header svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.section-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.section-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  margin-left: auto;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.setting-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.setting-field label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.setting-field select,
.setting-field input[type="text"],
.setting-field input[type="number"] {
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--duration-fast) var(--ease-in-out);
}

.setting-field select:focus,
.setting-field input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

.field-description {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 0;
}

/* Checkbox Field */
.checkbox-field {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.checkbox-field input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

.checkbox-field span {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: var(--spacing-lg);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.radio-option input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.radio-option span {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-preferences-settings {
    padding: var(--spacing-lg);
  }

  .settings-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }

  .settings-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById(
    "user-preferences-settings-styles"
  );
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "user-preferences-settings-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
