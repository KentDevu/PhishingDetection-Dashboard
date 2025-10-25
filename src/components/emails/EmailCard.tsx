// Email Card Component - Individual email display with threat analysis

import { useState } from "react";
import {
  Mail,
  AlertTriangle,
  Shield,
  Clock,
  User,
  Globe,
  Eye,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Flag,
  Link,
  Paperclip,
  Check,
  X,
} from "lucide-react";
import type { Email, ThreatLevel } from "../../models/email";
import { formatDistanceToNow, format } from "date-fns";

interface EmailCardProps {
  email: Email;
  isSelected?: boolean;
  onSelect?: (emailId: number) => void;
  onView?: (email: Email) => void;
  onDelete?: (emailId: number) => void;
}

export function EmailCard({
  email,
  isSelected = false,
  onSelect,
  onView,
  onDelete,
}: EmailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getThreatColor = (threat: ThreatLevel) => {
    switch (threat) {
      case "critical":
        return "var(--color-danger)";
      case "malicious":
        return "var(--color-danger)";
      case "high":
        return "#FF6B35";
      case "suspicious":
        return "var(--color-warning)";
      case "clean":
        return "var(--color-success)";
      default:
        return "var(--text-muted)";
    }
  };

  const getThreatIcon = (threat: ThreatLevel) => {
    switch (threat) {
      case "critical":
      case "malicious":
        return <AlertTriangle size={16} />;
      case "high":
      case "suspicious":
        return <Flag size={16} />;
      case "clean":
        return <Shield size={16} />;
      default:
        return <Shield size={16} />;
    }
  };

  const getAuthStatusIcon = (result: string) => {
    return result === "pass" ? <Check size={14} /> : <X size={14} />;
  };

  const getAuthStatusColor = (result: string) => {
    return result === "pass" ? "var(--color-success)" : "var(--color-danger)";
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you'd show a toast notification here
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  };

  return (
    <div className={`email-card ${isSelected ? "email-card--selected" : ""}`}>
      {/* Card Header */}
      <div className="email-card__header">
        <div className="email-card__select">
          <button
            className="select-checkbox"
            onClick={() => onSelect?.(email.id)}
          >
            <div
              className={`checkbox ${isSelected ? "checkbox--checked" : ""}`}
            >
              {isSelected && <Check size={12} />}
            </div>
          </button>
        </div>

        <div className="email-card__threat">
          <div
            className="threat-indicator"
            style={{
              color: getThreatColor(
                email.threat_summary?.overall_risk || "clean"
              ),
              backgroundColor: `${getThreatColor(
                email.threat_summary?.overall_risk || "clean"
              )}20`,
            }}
          >
            {getThreatIcon(email.threat_summary?.overall_risk || "clean")}
            <span className="threat-level">
              {(email.threat_summary?.overall_risk || "clean").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="email-card__main">
          <div className="email-header">
            <div className="sender-info">
              <User size={14} />
              <span className="sender-name">
                {email.sender_name || "Unknown"}
              </span>
              <span className="sender-email">&lt;{email.sender}&gt;</span>
            </div>
            <div className="email-timestamp">
              <Clock size={14} />
              <span>
                {formatDistanceToNow(new Date(email.timestamp), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="email-subject">
            <Mail size={16} />
            <h3>{email.subject}</h3>
          </div>

          <div className="email-recipient">
            <span>To: {email.recipient}</span>
          </div>
        </div>

        <div className="email-card__actions">
          <div className="phishing-score">
            <span className="score-label">Risk Score</span>
            <span
              className="score-value"
              style={{
                color: getThreatColor(
                  email.threat_summary?.overall_risk || "clean"
                ),
              }}
            >
              {formatScore(email.phishing_score_cti)}%
            </span>
          </div>

          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => onView?.(email)}
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              className="action-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <div className="dropdown">
              <button
                className="action-btn"
                onClick={() => setShowActions(!showActions)}
                title="More Actions"
              >
                <MoreVertical size={16} />
              </button>
              {showActions && (
                <div className="dropdown-menu">
                  <button onClick={() => handleCopyToClipboard(email.sender)}>
                    <Copy size={14} />
                    Copy Sender
                  </button>
                  <button onClick={() => handleCopyToClipboard(email.subject)}>
                    <Copy size={14} />
                    Copy Subject
                  </button>
                  <button onClick={() => onView?.(email)}>
                    <ExternalLink size={14} />
                    View Full Email
                  </button>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item--danger"
                    onClick={() => onDelete?.(email.id)}
                  >
                    <Trash2 size={14} />
                    Delete Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="email-card__content">
          {/* Authentication Status */}
          <div className="auth-section">
            <h4>Authentication Status</h4>
            <div className="auth-grid">
              <div className="auth-item">
                <span className="auth-label">SPF</span>
                <div
                  className="auth-status"
                  style={{ color: getAuthStatusColor(email.spf_result) }}
                >
                  {getAuthStatusIcon(email.spf_result)}
                  <span>{email.spf_result.toUpperCase()}</span>
                </div>
              </div>
              <div className="auth-item">
                <span className="auth-label">DKIM</span>
                <div
                  className="auth-status"
                  style={{ color: getAuthStatusColor(email.dkim_result) }}
                >
                  {getAuthStatusIcon(email.dkim_result)}
                  <span>{email.dkim_result.toUpperCase()}</span>
                </div>
              </div>
              <div className="auth-item">
                <span className="auth-label">DMARC</span>
                <div
                  className="auth-status"
                  style={{ color: getAuthStatusColor(email.dmarc_result) }}
                >
                  {getAuthStatusIcon(email.dmarc_result)}
                  <span>{email.dmarc_result.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Threat Analysis Summary */}
          <div className="threat-section">
            <h4>Threat Analysis</h4>
            <div className="threat-stats">
              <div className="threat-stat">
                <span className="stat-label">Confidence</span>
                <span className="stat-value">
                  {(
                    email.threat_summary?.confidence || "unknown"
                  ).toUpperCase()}
                </span>
              </div>
              <div className="threat-stat">
                <span className="stat-label">Malicious Found</span>
                <span className="stat-value">
                  {email.threat_summary?.malicious_found || 0}
                </span>
              </div>
              <div className="threat-stat">
                <span className="stat-label">Suspicious Found</span>
                <span className="stat-value">
                  {email.threat_summary?.suspicious_found || 0}
                </span>
              </div>
              <div className="threat-stat">
                <span className="stat-label">Avg Reputation</span>
                <span className="stat-value">
                  {(email.threat_summary?.average_reputation || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* URLs and Attachments */}
          <div className="content-section">
            <div className="urls-section">
              <h4>
                <Link size={16} />
                Extracted URLs ({email.extracted_urls.length})
              </h4>
              {email.extracted_urls.length > 0 ? (
                <div className="urls-list">
                  {email.extracted_urls.slice(0, 3).map((url, index) => (
                    <div key={index} className="url-item">
                      <Globe size={12} />
                      <span className="url-text">{url}</span>
                      <button onClick={() => handleCopyToClipboard(url)}>
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                  {email.extracted_urls.length > 3 && (
                    <div className="more-items">
                      +{email.extracted_urls.length - 3} more URLs
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">No URLs found</div>
              )}
            </div>

            <div className="attachments-section">
              <h4>
                <Paperclip size={16} />
                Attachments ({email.attachments.length})
              </h4>
              {email.attachments.length > 0 ? (
                <div className="attachments-list">
                  {email.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <Paperclip size={12} />
                      <span className="attachment-name">{attachment}</span>
                      {email.attachment_hashes[index] && (
                        <span className="attachment-hash">
                          {email.attachment_hashes[index].substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No attachments</div>
              )}
            </div>
          </div>

          {/* CTI Flags */}
          {email.cti_flags.length > 0 && (
            <div className="flags-section">
              <h4>Security Flags</h4>
              <div className="flags-list">
                {email.cti_flags.map((flag, index) => (
                  <span key={index} className="security-flag">
                    <Flag size={12} />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div className="technical-section">
            <h4>Technical Details</h4>
            <div className="technical-grid">
              <div className="tech-item">
                <span className="tech-label">Sender IP</span>
                <span className="tech-value">{email.sender_ip}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Sender Domain</span>
                <span className="tech-value">{email.sender_domain}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Timestamp</span>
                <span className="tech-value">
                  {format(new Date(email.timestamp), "PPpp")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Email Card Styles
const styles = `
.email-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-in-out);
  overflow: hidden;
}

.email-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(19, 255, 160, 0.1);
}

.email-card--selected {
  border-color: var(--color-primary);
  background: var(--bg-accent);
}

.email-card__header {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  align-items: flex-start;
}

.email-card__select {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--spacing-xs);
}

.select-checkbox {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.checkbox--checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--bg-primary);
}

.email-card__threat {
  display: flex;
  align-items: flex-start;
  padding-top: var(--spacing-xs);
}

.threat-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid currentColor;
}

.email-card__main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

.email-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.sender-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
}

.sender-email {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-timestamp {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.email-subject {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.email-subject h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-recipient {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: flex-end;
}

.phishing-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  text-align: center;
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.score-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
  min-width: 180px;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: slideDown var(--duration-fast) var(--ease-out);
}

.dropdown-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  text-align: left;
}

.dropdown-menu button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dropdown-item--danger {
  color: var(--color-danger) !important;
}

.dropdown-item--danger:hover {
  background: rgba(237, 51, 51, 0.1) !important;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid var(--border-primary);
  margin: var(--spacing-xs) 0;
}

/* Expanded Content */
.email-card__content {
  border-top: 1px solid var(--border-primary);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  animation: slideDown var(--duration-normal) var(--ease-out);
}

.email-card__content h4 {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.email-card__content > div:not(:last-child) {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

/* Authentication Section */
.auth-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.auth-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
}

.auth-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Threat Section */
.threat-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.threat-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  text-align: center;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* Content Section */
.content-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

.urls-list,
.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.url-item,
.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.url-text,
.attachment-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
}

.attachment-hash {
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.more-items {
  padding: var(--spacing-sm);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-style: italic;
}

.empty-state {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

/* Flags Section */
.flags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.security-flag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 193, 7, 0.1);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* Technical Section */
.technical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.tech-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
}

.tech-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

/* Animations */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .email-card__header {
    grid-template-columns: auto 1fr auto;
    gap: var(--spacing-sm);
  }

  .email-card__threat {
    grid-column: 1 / -1;
    order: 4;
    padding-top: var(--spacing-md);
  }

  .email-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .content-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .auth-grid {
    grid-template-columns: 1fr;
  }

  .threat-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .technical-grid {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("email-card-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "email-card-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
