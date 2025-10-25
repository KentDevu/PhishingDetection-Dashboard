// Alerts Page - Main alert management interface

import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Settings, Download, Bell } from "lucide-react";
import { AlertList } from "../components/alerts/AlertList";
import type { Alert } from "../models/alerts";

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock alert data
        const mockAlerts: Alert[] = [
          {
            id: 1,
            title: "Suspicious Email Activity Detected",
            description:
              "Multiple phishing attempts detected from suspicious domains targeting user credentials.",
            severity: "critical",
            status: "open",
            type: "phishing",
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
            source: "Email Scanner",
            affected_emails: 5,
            metadata: {
              sourceIp: "192.168.1.100",
              targetUsers: ["john.doe@company.com", "jane.smith@company.com"],
              domains: ["suspicious-site.com", "fake-bank.net"],
              confidence: 95,
            },
          },
          {
            id: 2,
            title: "Malware Attachment Blocked",
            description:
              "Dangerous executable file blocked in incoming email. Potential trojan detected.",
            severity: "high",
            status: "investigating",
            type: "malware",
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
            source: "Anti-Malware Engine",
            affected_emails: 1,
            metadata: {
              fileName: "invoice_urgent.exe",
              sender: "noreply@suspicious-domain.com",
              fileHash: "a1b2c3d4e5f6...",
              confidence: 88,
            },
          },
          {
            id: 3,
            title: "Bulk Spam Campaign Detected",
            description:
              "Large volume of spam emails detected from coordinated botnet campaign.",
            severity: "medium",
            status: "resolved",
            type: "spam",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            source: "Spam Filter",
            affected_emails: 247,
            metadata: {
              campaign: "Crypto Investment Scam",
              blockedEmails: 247,
              sourceCountries: ["Unknown", "Russia", "China"],
              confidence: 76,
            },
          },
          {
            id: 4,
            title: "Policy Violation: External Sharing",
            description:
              "Confidential document shared with unauthorized external recipients.",
            severity: "medium",
            status: "open",
            type: "policy_violation",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            source: "DLP Engine",
            affected_emails: 1,
            metadata: {
              document: "Financial_Report_Q4.pdf",
              sender: "finance@company.com",
              recipients: ["competitor@rival-company.com"],
              confidence: 92,
            },
          },
          {
            id: 5,
            title: "Unusual Email Pattern Detected",
            description:
              "Anomalous email behavior detected - potential account compromise.",
            severity: "high",
            status: "investigating",
            type: "anomaly",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            source: "Behavioral Analytics",
            affected_emails: 12,
            metadata: {
              user: "executive@company.com",
              anomalyType: "Login from unusual location",
              location: "Unknown (VPN)",
              confidence: 84,
            },
          },
          {
            id: 6,
            title: "Phishing Kit Detection",
            description:
              "Known phishing kit signatures detected in email content.",
            severity: "critical",
            status: "dismissed",
            type: "phishing",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            source: "Threat Intelligence",
            affected_emails: 8,
            metadata: {
              kit: "Office365 Credential Harvester v2.3",
              iocs: ["phish-site.com", "192.168.1.1"],
              ttps: ["T1566.001", "T1204.002"],
              confidence: 98,
            },
          },
        ];

        setAlerts(mockAlerts);
        setError(null);
      } catch (err) {
        setError("Failed to load alerts");
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleBulkAction = async (alertIds: string[], action: string) => {
    try {
      console.log(`Performing ${action} on alerts:`, alertIds);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update alerts based on action
      setAlerts(
        (prevAlerts) =>
          prevAlerts
            .map((alert) => {
              if (alertIds.includes(alert.id.toString())) {
                switch (action) {
                  case "investigate":
                    return { ...alert, status: "investigating" as const };
                  case "resolve":
                    return { ...alert, status: "resolved" as const };
                  case "dismiss":
                    return { ...alert, status: "dismissed" as const };
                  case "delete":
                    return null; // Will be filtered out
                  default:
                    return alert;
                }
              }
              return alert;
            })
            .filter(Boolean) as Alert[]
      );
    } catch (err) {
      console.error("Error performing bulk action:", err);
    }
  };

  const getAlertStats = () => {
    const stats = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === "critical").length,
      high: alerts.filter((a) => a.severity === "high").length,
      open: alerts.filter((a) => a.status === "open").length,
      investigating: alerts.filter((a) => a.status === "investigating").length,
    };
    return stats;
  };

  const stats = getAlertStats();

  if (loading) {
    return (
      <div className="alerts-page">
        <div className="alerts-loading">
          <div className="loading-spinner"></div>
          <p>Loading security alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alerts-page">
        <div className="alerts-error">
          <AlertTriangle size={48} />
          <h2>Failed to Load Alerts</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div className="alerts-header__title">
          <Bell className="alerts-header__icon" size={28} />
          <div>
            <h1>Security Alerts</h1>
            <p>Monitor and respond to security threats in real-time</p>
          </div>
        </div>

        <div className="alerts-header__actions">
          <button className="btn btn--secondary">
            <Download size={18} />
            Export
          </button>
          <button className="btn btn--secondary">
            <Settings size={18} />
            Settings
          </button>
          <button className="btn btn--primary">
            <Plus size={18} />
            Create Alert
          </button>
        </div>
      </div>

      <div className="alerts-stats">
        <div className="stat-card">
          <div className="stat-card__value">{stats.total}</div>
          <div className="stat-card__label">Total Alerts</div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-card__value">{stats.critical}</div>
          <div className="stat-card__label">Critical</div>
        </div>
        <div className="stat-card stat-card--warning">
          <div className="stat-card__value">{stats.high}</div>
          <div className="stat-card__label">High Priority</div>
        </div>
        <div className="stat-card stat-card--info">
          <div className="stat-card__value">{stats.open}</div>
          <div className="stat-card__label">Open</div>
        </div>
        <div className="stat-card stat-card--primary">
          <div className="stat-card__value">{stats.investigating}</div>
          <div className="stat-card__label">Under Investigation</div>
        </div>
      </div>

      <AlertList alerts={alerts} onBulkAction={handleBulkAction} />
    </div>
  );
}

// Alerts Page Styles
const styles = `
.alerts-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.alerts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.alerts-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.alerts-header__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.alerts-header h1 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.alerts-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.alerts-header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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

.btn--primary:hover {
  background: #00CC80;
  border-color: #00CC80;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(19, 255, 160, 0.2);
}

.btn--secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.btn--secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--color-primary);
}

/* Alert Stats */
.alerts-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card__value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-card__label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-card--danger {
  border-color: var(--color-danger);
  background: rgba(237, 51, 51, 0.05);
}

.stat-card--danger .stat-card__value {
  color: var(--color-danger);
}

.stat-card--warning {
  border-color: var(--color-warning);
  background: rgba(255, 193, 7, 0.05);
}

.stat-card--warning .stat-card__value {
  color: var(--color-warning);
}

.stat-card--info {
  border-color: var(--color-info);
  background: rgba(59, 130, 246, 0.05);
}

.stat-card--info .stat-card__value {
  color: var(--color-info);
}

.stat-card--primary {
  border-color: var(--color-primary);
  background: var(--bg-accent);
}

.stat-card--primary .stat-card__value {
  color: var(--color-primary);
}

/* Loading State */
.alerts-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-lg);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.alerts-loading p {
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}

/* Error State */
.alerts-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-lg);
  text-align: center;
}

.alerts-error svg {
  color: var(--color-danger);
}

.alerts-error h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.alerts-error p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-md);
}

.alerts-error button {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: var(--color-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.alerts-error button:hover {
  background: #00CC80;
  transform: translateY(-1px);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .alerts-page {
    padding: var(--spacing-lg);
  }

  .alerts-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }

  .alerts-header__actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .alerts-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-card__value {
    font-size: var(--font-size-2xl);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("alerts-page-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "alerts-page-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
