// Alert Detail Modal - Comprehensive alert analysis and management

import { useState } from "react";
import {
  X,
  AlertTriangle,
  Clock,
  User,
  ExternalLink,
  Copy,
  Download,
  Shield,
  Globe,
  Mail,
  FileText,
  Activity,
  MessageSquare,
  Plus,
} from "lucide-react";
import type { Alert, AlertStatus } from "./AlertCard";
import { formatDistanceToNow, format } from "date-fns";

interface AlertDetailModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (alertId: number, status: AlertStatus) => void;
  onAssign?: (alertId: number, assignee: string) => void;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type:
    | "created"
    | "status_change"
    | "assignment"
    | "comment"
    | "investigation";
  user: string;
  description: string;
  metadata?: any;
}

export function AlertDetailModal({
  alert,
  isOpen,
  onClose,
  onStatusChange,
  onAssign,
}: AlertDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "evidence" | "actions"
  >("overview");
  const [newComment, setNewComment] = useState("");
  const [assigneeInput, setAssigneeInput] = useState("");

  if (!isOpen || !alert) return null;

  const mockTimeline: TimelineEvent[] = [
    {
      id: "1",
      timestamp: alert.timestamp,
      type: "created",
      user: "System",
      description: "Alert created by automated detection system",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: "status_change",
      user: "John Doe",
      description: "Status changed to investigating",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: "comment",
      user: "Jane Smith",
      description: "Initial analysis indicates this is a targeted attack",
      metadata: {
        comment:
          "Similar patterns detected in previous incidents. Escalating to security team.",
      },
    },
  ];

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "phishing":
        return <Mail size={16} />;
      case "malware":
        return <Shield size={16} />;
      case "spam":
        return <MessageSquare size={16} />;
      case "policy_violation":
        return <FileText size={16} />;
      case "anomaly":
        return <Activity size={16} />;
    }
  };

  const handleStatusChange = (status: AlertStatus) => {
    if (onStatusChange) {
      onStatusChange(alert.id, status);
    }
  };

  const handleAssignment = () => {
    if (onAssign && assigneeInput.trim()) {
      onAssign(alert.id, assigneeInput.trim());
      setAssigneeInput("");
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you'd show a toast notification here
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="alert-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__left">
            <div className="alert-type-icon">{getTypeIcon(alert.type)}</div>
            <div className="modal-title-section">
              <h2 className="modal-title">{alert.title}</h2>
              <div className="modal-subtitle">
                <span
                  className={`severity-badge severity-badge--${alert.severity}`}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span className={`status-badge status-badge--${alert.status}`}>
                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                </span>
                <span className="alert-id">Alert #{alert.id}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {(["overview", "timeline", "evidence", "actions"] as const).map(
            (tab) => (
              <button
                key={tab}
                className={`modal-tab ${
                  activeTab === tab ? "modal-tab--active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Content */}
        <div className="modal-content">
          {activeTab === "overview" && (
            <div className="tab-content">
              <div className="alert-overview">
                <div className="overview-section">
                  <h3>Description</h3>
                  <p>{alert.description}</p>
                </div>

                <div className="overview-grid">
                  <div className="overview-card">
                    <div className="overview-card__header">
                      <Clock size={16} />
                      <span>Detection Time</span>
                    </div>
                    <div className="overview-card__content">
                      <div className="overview-value">
                        {format(new Date(alert.timestamp), "PPpp")}
                      </div>
                      <div className="overview-meta">
                        {formatDistanceToNow(new Date(alert.timestamp), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="overview-card__header">
                      <Mail size={16} />
                      <span>Affected Emails</span>
                    </div>
                    <div className="overview-card__content">
                      <div className="overview-value">
                        {alert.affectedEmails}
                      </div>
                      <div className="overview-meta">emails impacted</div>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="overview-card__header">
                      <Shield size={16} />
                      <span>Source</span>
                    </div>
                    <div className="overview-card__content">
                      <div className="overview-value">
                        {alert.source || "Unknown"}
                      </div>
                      <div className="overview-meta">detection engine</div>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="overview-card__header">
                      <User size={16} />
                      <span>Assignee</span>
                    </div>
                    <div className="overview-card__content">
                      <div className="overview-value">
                        {alert.assignee || "Unassigned"}
                      </div>
                      <div className="overview-meta">current owner</div>
                    </div>
                  </div>
                </div>

                {alert.metadata && (
                  <div className="overview-section">
                    <h3>Technical Details</h3>
                    <div className="metadata-grid">
                      {Object.entries(alert.metadata).map(([key, value]) => (
                        <div key={key} className="metadata-item">
                          <div className="metadata-label">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div className="metadata-value">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : String(value)}
                            <button
                              className="copy-btn"
                              onClick={() =>
                                handleCopyToClipboard(String(value))
                              }
                              title="Copy to clipboard"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="tab-content">
              <div className="timeline">
                {mockTimeline.map((event) => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-user">{event.user}</span>
                        <span className="timeline-time">
                          {formatDistanceToNow(new Date(event.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="timeline-description">
                        {event.description}
                      </div>
                      {event.metadata?.comment && (
                        <div className="timeline-comment">
                          {event.metadata.comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-comment">
                <h4>Add Comment</h4>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add investigation notes or comments..."
                  className="comment-textarea"
                  rows={3}
                />
                <button className="btn btn--primary">
                  <Plus size={16} />
                  Add Comment
                </button>
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="tab-content">
              <div className="evidence-section">
                <h3>Evidence & Artifacts</h3>
                <div className="evidence-list">
                  <div className="evidence-item">
                    <div className="evidence-icon">
                      <FileText size={20} />
                    </div>
                    <div className="evidence-details">
                      <div className="evidence-name">
                        Original Email Headers
                      </div>
                      <div className="evidence-meta">2.3 KB • Plain Text</div>
                    </div>
                    <div className="evidence-actions">
                      <button className="btn btn--secondary btn--sm">
                        <ExternalLink size={14} />
                        View
                      </button>
                      <button className="btn btn--secondary btn--sm">
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="evidence-item">
                    <div className="evidence-icon">
                      <Globe size={20} />
                    </div>
                    <div className="evidence-details">
                      <div className="evidence-name">URL Analysis Report</div>
                      <div className="evidence-meta">15.7 KB • JSON</div>
                    </div>
                    <div className="evidence-actions">
                      <button className="btn btn--secondary btn--sm">
                        <ExternalLink size={14} />
                        View
                      </button>
                      <button className="btn btn--secondary btn--sm">
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="evidence-item">
                    <div className="evidence-icon">
                      <Shield size={20} />
                    </div>
                    <div className="evidence-details">
                      <div className="evidence-name">
                        Threat Intelligence Data
                      </div>
                      <div className="evidence-meta">8.1 KB • JSON</div>
                    </div>
                    <div className="evidence-actions">
                      <button className="btn btn--secondary btn--sm">
                        <ExternalLink size={14} />
                        View
                      </button>
                      <button className="btn btn--secondary btn--sm">
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "actions" && (
            <div className="tab-content">
              <div className="actions-section">
                <div className="action-group">
                  <h3>Status Management</h3>
                  <div className="action-buttons">
                    <button
                      className="btn btn--info"
                      onClick={() => handleStatusChange("investigating")}
                    >
                      Mark as Investigating
                    </button>
                    <button
                      className="btn btn--success"
                      onClick={() => handleStatusChange("resolved")}
                    >
                      Resolve Alert
                    </button>
                    <button
                      className="btn btn--secondary"
                      onClick={() => handleStatusChange("dismissed")}
                    >
                      Dismiss Alert
                    </button>
                  </div>
                </div>

                <div className="action-group">
                  <h3>Assignment</h3>
                  <div className="assignment-controls">
                    <input
                      type="text"
                      value={assigneeInput}
                      onChange={(e) => setAssigneeInput(e.target.value)}
                      placeholder="Enter assignee name or email"
                      className="assignment-input"
                    />
                    <button
                      className="btn btn--primary"
                      onClick={handleAssignment}
                      disabled={!assigneeInput.trim()}
                    >
                      Assign
                    </button>
                  </div>
                </div>

                <div className="action-group">
                  <h3>Escalation & Reporting</h3>
                  <div className="action-buttons">
                    <button className="btn btn--warning">
                      <AlertTriangle size={16} />
                      Escalate to Security Team
                    </button>
                    <button className="btn btn--secondary">
                      <Download size={16} />
                      Generate Report
                    </button>
                    <button className="btn btn--secondary">
                      <ExternalLink size={16} />
                      Create Incident Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Alert Detail Modal Styles
const styles = `
.modal-overlay {
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

.alert-detail-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-primary);
}

.modal-header__left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.alert-type-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--bg-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.modal-title-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.modal-subtitle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.severity-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.severity-badge--critical {
  background: rgba(237, 51, 51, 0.2);
  color: var(--color-danger);
}

.severity-badge--high {
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
}

.severity-badge--medium {
  background: rgba(255, 193, 7, 0.2);
  color: var(--color-warning);
}

.severity-badge--low {
  background: rgba(19, 255, 160, 0.2);
  color: var(--color-primary);
}

.status-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.status-badge--open {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-muted);
}

.status-badge--investigating {
  background: rgba(59, 130, 246, 0.2);
  color: var(--color-info);
}

.status-badge--resolved {
  background: rgba(34, 197, 94, 0.2);
  color: var(--color-success);
}

.status-badge--dismissed {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-muted);
}

.alert-id {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Modal Tabs */
.modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-primary);
}

.modal-tab {
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.modal-tab:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.modal-tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background: var(--bg-secondary);
}

/* Modal Content */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

.tab-content {
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

/* Overview Tab */
.alert-overview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.overview-section h3 {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.overview-section p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.overview-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.overview-card__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
}

.overview-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.overview-meta {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* Metadata */
.metadata-grid {
  display: grid;
  gap: var(--spacing-sm);
}

.metadata-item {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-primary);
  align-items: center;
}

.metadata-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
}

.metadata-value {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.copy-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.metadata-item:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Timeline Tab */
.timeline {
  position: relative;
  margin-bottom: var(--spacing-xl);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-primary);
}

.timeline-item {
  position: relative;
  padding-left: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.timeline-marker {
  position: absolute;
  left: 4px;
  top: var(--spacing-xs);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--bg-secondary);
}

.timeline-content {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.timeline-user {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.timeline-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.timeline-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.timeline-comment {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  font-style: italic;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* Add Comment */
.add-comment {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.add-comment h4 {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.comment-textarea {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  resize: vertical;
  margin-bottom: var(--spacing-md);
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

/* Evidence Tab */
.evidence-section h3 {
  margin: 0 0 var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.evidence-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.evidence-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.evidence-details {
  flex: 1;
}

.evidence-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.evidence-meta {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.evidence-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Actions Tab */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.action-group h3 {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.assignment-controls {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.assignment-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.assignment-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

/* Buttons */
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
  white-space: nowrap;
}

.btn--sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.btn--primary {
  background: var(--color-primary);
  color: var(--bg-primary);
  border-color: var(--color-primary);
}

.btn--primary:hover:not(:disabled) {
  background: #00CC80;
  border-color: #00CC80;
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--secondary {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.btn--secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--color-primary);
}

.btn--info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
  border-color: var(--color-info);
}

.btn--info:hover {
  background: var(--color-info);
  color: white;
}

.btn--success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border-color: var(--color-success);
}

.btn--success:hover {
  background: var(--color-success);
  color: white;
}

.btn--warning {
  background: rgba(255, 193, 7, 0.1);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.btn--warning:hover {
  background: var(--color-warning);
  color: var(--bg-primary);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-md);
  }

  .modal-header {
    padding: var(--spacing-md);
  }

  .modal-header__left {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .alert-type-icon {
    width: 32px;
    height: 32px;
  }

  .modal-title {
    font-size: var(--font-size-lg);
  }

  .modal-content {
    padding: var(--spacing-lg);
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .metadata-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }

  .assignment-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
  }

  .evidence-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .evidence-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("alert-detail-modal-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "alert-detail-modal-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
