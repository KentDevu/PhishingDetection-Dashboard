// System Configuration Component

import { useState } from "react";
import {
  Server,
  Mail,
  HardDrive,
  Monitor,
  AlertTriangle,
  Check,
  RefreshCw,
  Save,
  Activity,
  Shield,
  Brain,
} from "lucide-react";
import { useSystemSettings } from "../../hooks/useSystemSettings";
import type { SystemConfiguration } from "../../models/settings";

export function SystemConfigurationPanel() {
  const { systemConfig, updateSystemConfig } = useSystemSettings();

  const [localChanges, setLocalChanges] = useState<
    Partial<SystemConfiguration>
  >({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentSettings = {
    ...systemConfig.data,
    ...localChanges,
  } as SystemConfiguration;

  const handleNestedFieldChange = (
    section: keyof SystemConfiguration,
    field: string,
    value: any
  ) => {
    setLocalChanges((prev) => ({
      ...prev,
      [section]: {
        ...((prev[section] as any) || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (Object.keys(localChanges).length === 0) return;

    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      await updateSystemConfig(localChanges);
      setLocalChanges({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save system configuration:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const sensitivityLevels = [
    { value: "low", label: "Low - Minimal detection" },
    { value: "medium", label: "Medium - Balanced approach" },
    { value: "high", label: "High - Strict detection" },
    { value: "paranoid", label: "Paranoid - Maximum security" },
  ];

  const backupFrequencies = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
  ];

  if (systemConfig.loading && !systemConfig.data) {
    return (
      <div className="system-config-panel">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading system configuration...</p>
        </div>
      </div>
    );
  }

  if (systemConfig.error) {
    return (
      <div className="system-config-panel">
        <div className="settings-error">
          <AlertTriangle size={48} />
          <h3>Failed to Load System Configuration</h3>
          <p>{systemConfig.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-config-panel">
      <div className="settings-header">
        <div className="settings-header__title">
          <Server size={24} />
          <div>
            <h2>System Configuration</h2>
            <p>Core system settings, performance tuning, and maintenance</p>
          </div>
        </div>

        <div className="settings-actions">
          {saveSuccess && (
            <div className="save-success">
              <Check size={16} />
              <span>Configuration saved</span>
            </div>
          )}

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
            Save Configuration
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* Email Processing Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Mail size={20} />
            <h3>Email Processing</h3>
            <p>Email scanning and processing configuration</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Scan Frequency</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={
                    currentSettings.email_processing?.scan_frequency_minutes ||
                    5
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "email_processing",
                      "scan_frequency_minutes",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>minutes between scans</span>
              </div>
              <p className="field-description">
                <Activity size={14} />
                How often to scan for new emails
              </p>
            </div>

            <div className="setting-field">
              <label>Concurrent Scans</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={
                    currentSettings.email_processing?.max_concurrent_scans || 3
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "email_processing",
                      "max_concurrent_scans",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>simultaneous scans</span>
              </div>
              <p className="field-description">
                Maximum parallel email processing threads
              </p>
            </div>

            <div className="setting-field">
              <label>Quarantine Suspicious Emails</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={
                    currentSettings.email_processing?.quarantine_suspicious !==
                    false
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "email_processing",
                      "quarantine_suspicious",
                      e.target.checked
                    )
                  }
                />
                <span>Automatically quarantine suspicious emails</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Auto-delete Malicious</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={
                    currentSettings.email_processing?.auto_delete_malicious ||
                    false
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "email_processing",
                      "auto_delete_malicious",
                      e.target.checked
                    )
                  }
                />
                <span>Automatically delete confirmed malicious emails</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Email Retention</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="30"
                  max="2555"
                  value={currentSettings.email_processing?.retention_days || 90}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "email_processing",
                      "retention_days",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>days to keep processed emails</span>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Detection Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Shield size={20} />
            <h3>Threat Detection</h3>
            <p>AI-powered threat detection and analysis settings</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Detection Sensitivity</label>
              <select
                value={
                  currentSettings.threat_detection?.sensitivity_level ||
                  "medium"
                }
                onChange={(e) =>
                  handleNestedFieldChange(
                    "threat_detection",
                    "sensitivity_level",
                    e.target.value as any
                  )
                }
              >
                {sensitivityLevels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-description">
                <Brain size={14} />
                Controls how strict the AI detection algorithms are
              </p>
            </div>

            <div className="setting-field">
              <label>AI Model Version</label>
              <input
                type="text"
                value={
                  currentSettings.threat_detection?.ai_model_version || "v2.1.0"
                }
                onChange={(e) =>
                  handleNestedFieldChange(
                    "threat_detection",
                    "ai_model_version",
                    e.target.value
                  )
                }
                placeholder="v2.1.0"
              />
              <p className="field-description">
                Version of the AI model to use for detection
              </p>
            </div>

            <div className="setting-field">
              <label>Custom Rules</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={
                    currentSettings.threat_detection?.custom_rules_enabled !==
                    false
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "threat_detection",
                      "custom_rules_enabled",
                      e.target.checked
                    )
                  }
                />
                <span>Enable custom detection rules</span>
              </div>
              <p className="field-description">
                Allow administrators to define custom threat patterns
              </p>
            </div>

            <div className="setting-field">
              <label>Reputation Threshold</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    currentSettings.threat_detection?.reputation_threshold || 50
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "threat_detection",
                      "reputation_threshold",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>% minimum reputation score</span>
              </div>
              <p className="field-description">
                Minimum sender reputation to avoid blocking
              </p>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Server size={20} />
            <h3>API Configuration</h3>
            <p>API performance and rate limiting settings</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Requests Per Minute</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={
                    currentSettings.api_settings?.rate_limiting
                      ?.requests_per_minute || 1000
                  }
                  onChange={(e) =>
                    handleNestedFieldChange("api_settings", "rate_limiting", {
                      ...currentSettings.api_settings?.rate_limiting,
                      requests_per_minute: parseInt(e.target.value),
                    })
                  }
                />
                <span>requests/minute per user</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Burst Limit</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={
                    currentSettings.api_settings?.rate_limiting?.burst_limit ||
                    100
                  }
                  onChange={(e) =>
                    handleNestedFieldChange("api_settings", "rate_limiting", {
                      ...currentSettings.api_settings?.rate_limiting,
                      burst_limit: parseInt(e.target.value),
                    })
                  }
                />
                <span>requests in burst</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Request Timeout</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={currentSettings.api_settings?.timeout_seconds || 30}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "api_settings",
                      "timeout_seconds",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>seconds</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Retry Attempts</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={currentSettings.api_settings?.retry_attempts || 3}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "api_settings",
                      "retry_attempts",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>retries for failed requests</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Cache TTL</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={currentSettings.api_settings?.cache_ttl_minutes || 15}
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "api_settings",
                      "cache_ttl_minutes",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>minutes to cache responses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="settings-section">
          <div className="section-header">
            <HardDrive size={20} />
            <h3>Database Management</h3>
            <p>Database backup and maintenance configuration</p>
          </div>

          <div className="settings-grid">
            <div className="setting-field">
              <label>Backup Frequency</label>
              <select
                value={
                  currentSettings.database_settings?.backup_frequency || "daily"
                }
                onChange={(e) =>
                  handleNestedFieldChange(
                    "database_settings",
                    "backup_frequency",
                    e.target.value as any
                  )
                }
              >
                {backupFrequencies.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-description">
                How often to create database backups
              </p>
            </div>

            <div className="setting-field">
              <label>Backup Retention</label>
              <div className="number-input-group">
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={
                    currentSettings.database_settings?.backup_retention_days ||
                    30
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "database_settings",
                      "backup_retention_days",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span>days to keep backups</span>
              </div>
            </div>

            <div className="setting-field">
              <label>Auto Cleanup</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={
                    currentSettings.database_settings?.auto_cleanup_enabled !==
                    false
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "database_settings",
                      "auto_cleanup_enabled",
                      e.target.checked
                    )
                  }
                />
                <span>Automatically clean up old data</span>
              </div>
              <p className="field-description">
                Remove expired records and optimize database
              </p>
            </div>

            <div className="setting-field">
              <label>Performance Monitoring</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  checked={
                    currentSettings.database_settings
                      ?.performance_monitoring !== false
                  }
                  onChange={(e) =>
                    handleNestedFieldChange(
                      "database_settings",
                      "performance_monitoring",
                      e.target.checked
                    )
                  }
                />
                <span>Monitor database performance metrics</span>
              </div>
              <p className="field-description">
                <Monitor size={14} />
                Track query performance and system health
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// System Configuration Styles
const styles = `
.system-config-panel {
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
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 0;
}

.field-description svg {
  flex-shrink: 0;
  opacity: 0.7;
}

/* Number Input Groups */
.number-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.number-input-group input[type="number"] {
  width: 100px;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  text-align: center;
}

.number-input-group span {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

/* Checkbox Fields */
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

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .system-config-panel {
    padding: var(--spacing-lg);
  }

  .settings-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }

  .settings-actions {
    justify-content: center;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .number-input-group {
    flex-wrap: wrap;
  }

  .number-input-group input[type="number"] {
    width: 80px;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("system-config-panel-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "system-config-panel-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
