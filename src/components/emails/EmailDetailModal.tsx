// Email Detail Modal - Comprehensive view of email with threat analysis

import {
  X,
  Mail,
  User,
  Calendar,
  Shield,
  Link as LinkIcon,
  Paperclip,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Email } from "../../models/email";

interface EmailDetailModalProps {
  email: Email;
  onClose: () => void;
}

export function EmailDetailModal({ email, onClose }: EmailDetailModalProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "var(--color-danger)";
      case "malicious":
        return "var(--color-danger)";
      case "high":
        return "var(--color-warning)";
      case "suspicious":
        return "var(--color-warning)";
      default:
        return "var(--color-success)";
    }
  };

  const getAuthIcon = (result: string) => {
    return result === "pass" ? (
      <CheckCircle size={16} className="auth-icon auth-icon--pass" />
    ) : (
      <XCircle size={16} className="auth-icon auth-icon--fail" />
    );
  };

  return (
    <div className="email-detail-backdrop" onClick={onClose}>
      <div className="email-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title">
            <Mail size={24} />
            <h2>Email Analysis Details</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Threat Summary Card */}
          <div
            className="threat-summary-card"
            style={{
              borderLeftColor: getRiskColor(email.threat_summary.overall_risk),
            }}
          >
            <div className="threat-summary-header">
              <Shield size={20} />
              <h3>Threat Assessment</h3>
            </div>
            <div className="threat-summary-grid">
              <div className="threat-stat">
                <span className="threat-stat__label">Overall Risk</span>
                <span
                  className="threat-stat__value"
                  style={{
                    color: getRiskColor(email.threat_summary.overall_risk),
                  }}
                >
                  {email.threat_summary.overall_risk.toUpperCase()}
                </span>
              </div>
              <div className="threat-stat">
                <span className="threat-stat__label">Confidence</span>
                <span className="threat-stat__value">
                  {email.threat_summary.confidence}
                </span>
              </div>
              <div className="threat-stat">
                <span className="threat-stat__label">Phishing Score</span>
                <span className="threat-stat__value">
                  {Math.round(email.phishing_score_cti * 100)}%
                </span>
              </div>
              <div className="threat-stat">
                <span className="threat-stat__label">Items Analyzed</span>
                <span className="threat-stat__value">
                  {email.threat_summary.total_analyzed}
                </span>
              </div>
              <div className="threat-stat">
                <span className="threat-stat__label">Malicious Found</span>
                <span className="threat-stat__value threat-stat__value--danger">
                  {email.threat_summary.malicious_found}
                </span>
              </div>
              <div className="threat-stat">
                <span className="threat-stat__label">Suspicious Found</span>
                <span className="threat-stat__value threat-stat__value--warning">
                  {email.threat_summary.suspicious_found}
                </span>
              </div>
            </div>
          </div>

          {/* Email Information */}
          <div className="info-section">
            <h3 className="section-title">Email Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <User size={16} />
                <div>
                  <span className="info-label">From</span>
                  <span className="info-value">{email.sender}</span>
                  {email.sender_name && (
                    <span className="info-subtext">{email.sender_name}</span>
                  )}
                </div>
              </div>
              <div className="info-item">
                <Mail size={16} />
                <div>
                  <span className="info-label">To</span>
                  <span className="info-value">{email.recipient}</span>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={16} />
                <div>
                  <span className="info-label">Received</span>
                  <span className="info-value">
                    {new Date(email.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="subject-box">
              <span className="info-label">Subject</span>
              <p className="subject-text">{email.subject}</p>
            </div>
          </div>

          {/* Authentication Results */}
          <div className="info-section">
            <h3 className="section-title">Email Authentication</h3>
            <div className="auth-results">
              <div className="auth-result">
                {getAuthIcon(email.spf_result || "fail")}
                <span className="auth-label">SPF</span>
                <span
                  className={`auth-status auth-status--${
                    email.spf_result || "fail"
                  }`}
                >
                  {email.spf_result || "fail"}
                </span>
              </div>
              <div className="auth-result">
                {getAuthIcon(email.dkim_result || "fail")}
                <span className="auth-label">DKIM</span>
                <span
                  className={`auth-status auth-status--${
                    email.dkim_result || "fail"
                  }`}
                >
                  {email.dkim_result || "fail"}
                </span>
              </div>
              <div className="auth-result">
                {getAuthIcon(email.dmarc_result || "fail")}
                <span className="auth-label">DMARC</span>
                <span
                  className={`auth-status auth-status--${
                    email.dmarc_result || "fail"
                  }`}
                >
                  {email.dmarc_result || "fail"}
                </span>
              </div>
            </div>
          </div>

          {/* CTI Flags */}
          {email.cti_flags && email.cti_flags.length > 0 && (
            <div className="info-section">
              <h3 className="section-title">
                <AlertTriangle size={16} />
                Detected Threats
              </h3>
              <div className="cti-flags">
                {email.cti_flags.map((flag, index) => (
                  <span key={index} className="cti-flag">
                    {flag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted URLs */}
          {email.extracted_urls && email.extracted_urls.length > 0 && (
            <div className="info-section">
              <h3 className="section-title">
                <LinkIcon size={16} />
                Extracted URLs ({email.extracted_urls.length})
              </h3>
              <div className="urls-list">
                {email.extracted_urls.map((url, index) => (
                  <div key={index} className="url-item">
                    <LinkIcon size={14} />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="url-link"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="info-section">
              <h3 className="section-title">
                <Paperclip size={16} />
                Attachments ({email.attachments.length})
              </h3>
              <div className="attachments-list">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <Paperclip size={14} />
                    <span className="attachment-name">{attachment}</span>
                    {email.attachment_hashes &&
                      email.attachment_hashes[index] && (
                        <span
                          className="attachment-hash"
                          title={email.attachment_hashes[index]}
                        >
                          {email.attachment_hashes[index].substring(0, 16)}...
                        </span>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed CTI Analysis */}
          {email.detailed_analysis && (
            <div className="info-section">
              <h3 className="section-title">VirusTotal Analysis</h3>

              {/* Domain Analysis */}
              {email.detailed_analysis.domains &&
                Object.keys(email.detailed_analysis.domains).length > 0 && (
                  <div className="cti-analysis-group">
                    <h4 className="cti-group-title">Domains</h4>
                    {Object.entries(email.detailed_analysis.domains).map(
                      ([domain, analysis]) => (
                        <div key={domain} className="cti-analysis-card">
                          <div className="cti-card-header">
                            <span className="cti-identifier">{domain}</span>
                            <span
                              className={`cti-threat-badge cti-threat-badge--${analysis.threat_level}`}
                            >
                              {analysis.threat_level}
                            </span>
                          </div>
                          <div className="cti-stats">
                            <div className="cti-stat">
                              <span className="cti-stat-label">
                                Reputation Score
                              </span>
                              <span className="cti-stat-value">
                                {analysis.reputation_score}/100
                              </span>
                            </div>
                            <div className="cti-stat">
                              <span className="cti-stat-label">
                                Malicious Engines
                              </span>
                              <span className="cti-stat-value">
                                {analysis.malicious_engines?.length || 0}
                              </span>
                            </div>
                            <div className="cti-stat">
                              <span className="cti-stat-label">
                                Last Analysis
                              </span>
                              <span className="cti-stat-value">
                                {analysis.last_analysis_date
                                  ? new Date(
                                      analysis.last_analysis_date
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* IP Analysis */}
              {email.detailed_analysis.ips &&
                Object.keys(email.detailed_analysis.ips).length > 0 && (
                  <div className="cti-analysis-group">
                    <h4 className="cti-group-title">IP Addresses</h4>
                    {Object.entries(email.detailed_analysis.ips).map(
                      ([ip, analysis]) => (
                        <div key={ip} className="cti-analysis-card">
                          <div className="cti-card-header">
                            <span className="cti-identifier">{ip}</span>
                            <span
                              className={`cti-threat-badge cti-threat-badge--${analysis.threat_level}`}
                            >
                              {analysis.threat_level}
                            </span>
                          </div>
                          <div className="cti-stats">
                            <div className="cti-stat">
                              <span className="cti-stat-label">
                                Reputation Score
                              </span>
                              <span className="cti-stat-value">
                                {analysis.reputation_score}/100
                              </span>
                            </div>
                            <div className="cti-stat">
                              <span className="cti-stat-label">
                                Malicious Engines
                              </span>
                              <span className="cti-stat-value">
                                {analysis.malicious_engines?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          )}

          {/* Email Body */}
          <div className="info-section">
            <h3 className="section-title">Email Content</h3>
            <div className="email-body">
              {email.body || "No content available"}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Email Detail Modal Styles
const styles = `
.email-detail-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-lg);
  backdrop-filter: blur(4px);
}

.email-detail-modal {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.modal-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.modal-header__title svg {
  color: var(--color-primary);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.modal-close {
  padding: var(--spacing-xs);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

/* Threat Summary Card */
.threat-summary-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-left: 4px solid var(--color-danger);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.threat-summary-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.threat-summary-header svg {
  color: var(--color-primary);
}

.threat-summary-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.threat-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.threat-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.threat-stat__label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.threat-stat__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.threat-stat__value--danger {
  color: var(--color-danger);
}

.threat-stat__value--warning {
  color: var(--color-warning);
}

/* Info Sections */
.info-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title svg {
  color: var(--color-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.info-item svg {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.info-item > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.info-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  word-break: break-all;
}

.info-subtext {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.subject-box {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.subject-text {
  margin: var(--spacing-xs) 0 0;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: 1.5;
}

/* Authentication Results */
.auth-results {
  display: flex;
  gap: var(--spacing-md);
}

.auth-result {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.auth-icon--pass {
  color: var(--color-success);
}

.auth-icon--fail {
  color: var(--color-danger);
}

.auth-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.auth-status {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.auth-status--pass {
  background: var(--bg-risk-clean);
  color: var(--color-success);
}

.auth-status--fail {
  background: var(--bg-risk-high);
  color: var(--color-danger);
}

/* CTI Flags */
.cti-flags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.cti-flag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-risk-high);
  color: var(--color-danger);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

/* URLs and Attachments */
.urls-list,
.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.url-item,
.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.url-item svg,
.attachment-item svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.url-link {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;
  word-break: break-all;
}

.url-link:hover {
  text-decoration: underline;
}

.attachment-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.attachment-hash {
  margin-left: auto;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-family: monospace;
}

/* CTI Analysis */
.cti-analysis-group {
  margin-bottom: var(--spacing-lg);
}

.cti-group-title {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cti-analysis-card {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-sm);
}

.cti-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.cti-identifier {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-family: monospace;
}

.cti-threat-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.cti-threat-badge--clean {
  background: var(--bg-risk-clean);
  color: var(--color-success);
}

.cti-threat-badge--low {
  background: var(--bg-risk-low);
  color: var(--color-primary);
}

.cti-threat-badge--medium {
  background: var(--bg-risk-medium);
  color: var(--color-warning);
}

.cti-threat-badge--high {
  background: var(--bg-risk-high);
  color: var(--color-danger);
}

.cti-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.cti-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cti-stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.cti-stat-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* Email Body */
.email-body {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Responsive Design */
@media (max-width: 768px) {
  .email-detail-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .threat-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .auth-results {
    flex-direction: column;
  }

  .cti-stats {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("email-detail-modal-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "email-detail-modal-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
