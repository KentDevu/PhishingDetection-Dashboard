// Alert Card Component - Individual alert display with actions

import { useState } from "react";
import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "investigating" | "resolved" | "dismissed";
export type AlertType =
  | "phishing"
  | "malware"
  | "spam"
  | "policy_violation"
  | "anomaly";

export interface Alert {
  id: number;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  type: AlertType;
  timestamp: string;
  affectedEmails: number;
  source?: string;
  assignee?: string;
  tags?: string[];
  metadata?: {
    [key: string]: any;
  };
}

interface AlertCardProps {
  alert: Alert;
  onStatusChange?: (alertId: number, status: AlertStatus) => void;
  onView?: (alertId: number) => void;
  onAssign?: (alertId: number, assignee: string) => void;
}

export function AlertCard({
  alert,
  onStatusChange,
  onView,
  onAssign,
}: AlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return (
          <AlertTriangle
            size={18}
            className="alert-icon alert-icon--critical"
          />
        );
      case "high":
        return (
          <AlertTriangle size={18} className="alert-icon alert-icon--high" />
        );
      case "medium":
        return <Shield size={18} className="alert-icon alert-icon--medium" />;
      default:
        return <Shield size={18} className="alert-icon alert-icon--low" />;
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case "resolved":
        return (
          <CheckCircle
            size={14}
            className="status-icon status-icon--resolved"
          />
        );
      case "dismissed":
        return (
          <XCircle size={14} className="status-icon status-icon--dismissed" />
        );
      case "investigating":
        return (
          <Eye size={14} className="status-icon status-icon--investigating" />
        );
      default:
        return <Clock size={14} className="status-icon status-icon--open" />;
    }
  };

  const handleStatusChange = (newStatus: AlertStatus) => {
    onStatusChange?.(alert.id, newStatus);
    setShowActions(false);
  };

  return (
    <div
      className={`alert-card alert-card--${alert.severity} ${
        alert.status === "resolved" ? "alert-card--resolved" : ""
      }`}
    >
      <div className="alert-card__header">
        <div className="alert-card__main">
          <div className="alert-card__icon">
            {getSeverityIcon(alert.severity)}
          </div>

          <div className="alert-card__content">
            <div className="alert-card__title-row">
              <h3 className="alert-card__title">{alert.title}</h3>
              <div className="alert-card__badges">
                <span className={`alert-badge alert-badge--${alert.severity}`}>
                  {alert.severity}
                </span>
                <span className={`status-badge status-badge--${alert.status}`}>
                  {getStatusIcon(alert.status)}
                  {alert.status}
                </span>
              </div>
            </div>

            <p className="alert-card__description">{alert.description}</p>

            <div className="alert-card__meta">
              <span className="alert-meta-item">
                <Clock size={12} />
                {formatDistanceToNow(new Date(alert.timestamp), {
                  addSuffix: true,
                })}
              </span>
              {alert.affectedEmails > 0 && (
                <span className="alert-meta-item">
                  {alert.affectedEmails} email
                  {alert.affectedEmails !== 1 ? "s" : ""} affected
                </span>
              )}
              {alert.source && (
                <span className="alert-meta-item">Source: {alert.source}</span>
              )}
            </div>
          </div>
        </div>

        <div className="alert-card__actions">
          <button
            className="alert-action-btn"
            onClick={() => onView?.(alert.id)}
            title="View Details"
          >
            <Eye size={16} />
          </button>

          <div className="alert-actions-dropdown">
            <button
              className="alert-action-btn"
              onClick={() => setShowActions(!showActions)}
              title="More Actions"
            >
              <MoreHorizontal size={16} />
            </button>

            {showActions && (
              <div className="alert-actions-menu">
                <button
                  className="alert-action-menu-item"
                  onClick={() => handleStatusChange("investigating")}
                >
                  Mark as Investigating
                </button>
                <button
                  className="alert-action-menu-item"
                  onClick={() => handleStatusChange("resolved")}
                >
                  Mark as Resolved
                </button>
                <button
                  className="alert-action-menu-item"
                  onClick={() => handleStatusChange("dismissed")}
                >
                  Dismiss Alert
                </button>
                <hr className="alert-action-divider" />
                <button
                  className="alert-action-menu-item"
                  onClick={() => onAssign?.(alert.id, "current-user")}
                >
                  Assign to Me
                </button>
              </div>
            )}
          </div>

          <button
            className="alert-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="alert-card__details">
          <div className="alert-details-grid">
            <div className="alert-detail-item">
              <label>Alert Type:</label>
              <span>{alert.type.replace("_", " ").toUpperCase()}</span>
            </div>

            <div className="alert-detail-item">
              <label>Assignee:</label>
              <span>{alert.assignee || "Unassigned"}</span>
            </div>

            {alert.metadata?.domain && (
              <div className="alert-detail-item">
                <label>Domain:</label>
                <span className="alert-detail-code">
                  {alert.metadata.domain}
                </span>
              </div>
            )}

            {alert.metadata?.ip && (
              <div className="alert-detail-item">
                <label>IP Address:</label>
                <span className="alert-detail-code">{alert.metadata.ip}</span>
              </div>
            )}

            {alert.metadata?.confidence && (
              <div className="alert-detail-item">
                <label>Confidence:</label>
                <div className="confidence-bar">
                  <div
                    className="confidence-bar__fill"
                    style={{ width: `${alert.metadata.confidence * 100}%` }}
                  ></div>
                  <span className="confidence-text">
                    {Math.round(alert.metadata.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {alert.tags && alert.tags.length > 0 && (
            <div className="alert-tags">
              <label>Tags:</label>
              <div className="alert-tags-list">
                {alert.tags.map((tag, index) => (
                  <span key={index} className="alert-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Alert Card Styles
const styles = `
.alert-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.alert-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.alert-card--critical {
  border-left: 4px solid var(--color-danger);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(237, 51, 51, 0.05) 100%);
}

.alert-card--high {
  border-left: 4px solid #FF6B35;
}

.alert-card--medium {
  border-left: 4px solid var(--color-warning);
}

.alert-card--low {
  border-left: 4px solid var(--color-primary);
}

.alert-card--resolved {
  opacity: 0.7;
  background: var(--bg-primary);
}

.alert-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}

.alert-card__main {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.alert-card__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-icon--critical {
  color: var(--color-danger);
  animation: pulse 2s infinite;
}

.alert-icon--high {
  color: #FF6B35;
}

.alert-icon--medium {
  color: var(--color-warning);
}

.alert-icon--low {
  color: var(--color-primary);
}

.alert-card__content {
  flex: 1;
  min-width: 0;
}

.alert-card__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.alert-card__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.alert-card__badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.alert-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert-badge--critical {
  background: rgba(237, 51, 51, 0.2);
  color: var(--color-danger);
}

.alert-badge--high {
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
}

.alert-badge--medium {
  background: rgba(184, 233, 107, 0.2);
  color: var(--color-warning);
}

.alert-badge--low {
  background: rgba(19, 255, 160, 0.2);
  color: var(--color-primary);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.status-badge--open {
  background: rgba(107, 114, 128, 0.2);
  color: var(--text-muted);
}

.status-badge--investigating {
  background: rgba(139, 121, 241, 0.2);
  color: var(--color-info);
}

.status-badge--resolved {
  background: rgba(13, 187, 100, 0.2);
  color: var(--color-success);
}

.status-badge--dismissed {
  background: rgba(107, 114, 128, 0.2);
  color: var(--text-muted);
}

.status-icon--resolved {
  color: var(--color-success);
}

.status-icon--dismissed {
  color: var(--text-muted);
}

.status-icon--investigating {
  color: var(--color-info);
}

.status-icon--open {
  color: var(--text-muted);
}

.alert-card__description {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.alert-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.alert-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.alert-card__actions {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.alert-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.alert-action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.alert-expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.alert-expand-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Dropdown Menu */
.alert-actions-dropdown {
  position: relative;
}

.alert-actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  min-width: 200px;
  padding: var(--spacing-xs);
  margin-top: 4px;
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.alert-action-menu-item {
  display: block;
  width: 100%;
  padding: var(--spacing-sm);
  background: none;
  border: none;
  text-align: left;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.alert-action-menu-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.alert-action-divider {
  border: none;
  height: 1px;
  background: var(--border-primary);
  margin: var(--spacing-xs) 0;
}

/* Expanded Details */
.alert-card__details {
  border-top: 1px solid var(--border-primary);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  animation: slideDown var(--duration-normal) var(--ease-out);
}

.alert-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.alert-detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.alert-detail-item label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert-detail-item span {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.alert-detail-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.confidence-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.confidence-bar__fill {
  flex: 1;
  height: 6px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  position: relative;
  overflow: hidden;
}

.confidence-bar__fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-tertiary);
  z-index: -1;
}

.confidence-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  min-width: 40px;
}

.alert-tags {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.alert-tags label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.alert-tag {
  padding: 2px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
    padding-top: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .alert-card__header {
    padding: var(--spacing-md);
  }

  .alert-card__title-row {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .alert-card__badges {
    align-self: flex-start;
  }

  .alert-details-grid {
    grid-template-columns: 1fr;
  }

  .alert-card__meta {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("alert-card-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "alert-card-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
