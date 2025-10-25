// Threats Page - Advanced threat monitoring and incident response

import { useState } from "react";
import { Shield, AlertTriangle, Activity } from "lucide-react";
import ThreatAlertDashboard from "../components/threats/ThreatAlertDashboard";
import { useThreatAlerts } from "../hooks/useThreatAlerts";
import type { ThreatAlert } from "../types/notifications";

export function Threats() {
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);
  const [showRuleManager, setShowRuleManager] = useState(false);

  const {
    isMonitoring,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
    refreshData,
  } = useThreatAlerts();

  const handleThreatSelect = (alert: ThreatAlert) => {
    setSelectedAlert(alert);
    // Navigate to email details or show threat analysis modal
    console.log("Selected threat:", alert);
  };

  const handleRuleManage = () => {
    setShowRuleManager(true);
  };

  if (loading) {
    return (
      <div className="threats-page">
        <div className="threats-loading">
          <div className="loading-spinner"></div>
          <p>Initializing threat monitoring system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="threats-page">
        <div className="threats-error">
          <AlertTriangle size={48} />
          <h2>Threat System Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="threats-page">
      <div className="threats-header">
        <div className="threats-header__title">
          <Shield className="threats-header__icon" size={28} />
          <div>
            <h1>Threat Intelligence Center</h1>
            <p>Advanced threat detection, monitoring, and incident response</p>
          </div>
        </div>

        <div className="threats-header__status">
          <div
            className={`monitoring-status ${
              isMonitoring ? "active" : "inactive"
            }`}
          >
            <Activity size={16} />
            <span>
              {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
            </span>
          </div>

          <div className="monitoring-controls">
            {!isMonitoring ? (
              <button className="btn btn--primary" onClick={startMonitoring}>
                <Shield size={16} />
                Start Monitoring
              </button>
            ) : (
              <button className="btn btn--secondary" onClick={stopMonitoring}>
                <AlertTriangle size={16} />
                Stop Monitoring
              </button>
            )}

            <button className="btn btn--outline" onClick={refreshData}>
              <Activity size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <ThreatAlertDashboard
        onThreatSelect={handleThreatSelect}
        onRuleManage={handleRuleManage}
      />

      {/* Threat Detail Modal - Future implementation */}
      {selectedAlert && (
        <div
          className="threat-modal-backdrop"
          onClick={() => setSelectedAlert(null)}
        >
          <div className="threat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Threat Analysis</h2>
              <button onClick={() => setSelectedAlert(null)}>×</button>
            </div>
            <div className="modal-content">
              <h3>{selectedAlert.payload.threat_type.toUpperCase()} Threat</h3>
              <p>
                <strong>Severity:</strong> {selectedAlert.payload.severity}
              </p>
              <p>
                <strong>Sender:</strong> {selectedAlert.payload.sender}
              </p>
              <p>
                <strong>Subject:</strong> {selectedAlert.payload.subject}
              </p>
              <p>
                <strong>Detected:</strong>{" "}
                {new Date(selectedAlert.timestamp).toLocaleString()}
              </p>
              {selectedAlert.payload.action_required && (
                <div className="action-required">
                  <AlertTriangle size={16} />
                  <span>Immediate action required</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rule Manager Modal - Future implementation */}
      {showRuleManager && (
        <div
          className="rule-manager-backdrop"
          onClick={() => setShowRuleManager(false)}
        >
          <div
            className="rule-manager-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Threat Detection Rules</h2>
              <button onClick={() => setShowRuleManager(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Rule management interface will be implemented here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Threats Page Styles
const styles = `
.threats-page {
  background: var(--bg-primary);
  min-height: 100vh;
}

.threats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.threats-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.threats-header__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.threats-header h1 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.threats-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.threats-header__status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.monitoring-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.monitoring-status.active {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.monitoring-status.inactive {
  background: rgba(156, 163, 175, 0.1);
  color: var(--text-muted);
}

.monitoring-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Loading and Error States */
.threats-loading,
.threats-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--spacing-lg);
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.threats-error svg {
  color: var(--color-danger);
}

.threats-error h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.threats-error p {
  margin: 0;
  color: var(--text-muted);
}

.threats-error button {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: var(--color-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

/* Modals */
.threat-modal-backdrop,
.rule-manager-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.threat-modal,
.rule-manager-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.modal-header button {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-sm);
}

.modal-content {
  padding: var(--spacing-lg);
}

.action-required {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
  font-weight: var(--font-weight-medium);
}

/* Button Styles */
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
  text-decoration: none;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--bg-primary);
  border-color: var(--color-primary);
}

.btn--primary:hover {
  background: #00CC80;
  border-color: #00CC80;
  transform: translateY(-1px);
}

.btn--secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.btn--secondary:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--color-primary);
}

.btn--outline {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.btn--outline:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--color-primary);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .threats-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }

  .threats-header__status {
    align-items: center;
  }

  .monitoring-controls {
    justify-content: center;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("threats-page-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "threats-page-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
