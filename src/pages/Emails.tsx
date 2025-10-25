// Emails Page - Main email management interface

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Settings, Download, Filter, Zap, Upload } from "lucide-react";
import { EmailList } from "../components/emails/EmailList";
import { EnhancedEmailFilters } from "../components/emails/EnhancedEmailFilters";
import { useEmails } from "../hooks/useEmails";
import { useBulkDelete } from "../hooks/useBulkDelete";
import { useDeleteEmail } from "../hooks/useDeleteEmail";
import type { Email } from "../models/email";

export function Emails() {
  const navigate = useNavigate();
  const {
    data: emails,
    loading,
    error,
    refetch,
    searchEmails,
    filterEmails,
    clearFilters,
    currentFilters,
  } = useEmails();
  const { bulkDeleteEmails, loading: bulkDeleteLoading } = useBulkDelete();
  const { deleteEmail, loading: deleteLoading } = useDeleteEmail();

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);

  // Handle email upload completion
  const handleUploadNavigation = () => {
    navigate("/emails/upload");
  };

  // Handle individual email view
  const handleEmailView = (email: Email) => {
    setSelectedEmail(email);
    setShowEmailDetail(true);
  };

  // Handle individual email deletion
  const handleEmailDelete = async (emailId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this email?"
    );
    if (!confirmed) return;

    try {
      await deleteEmail(emailId);
      await refetch(); // Refresh the email list
    } catch (error) {
      console.error("Failed to delete email:", error);
      // In a real app, you'd show a proper error notification
      alert("Failed to delete email. Please try again.");
    }
  };

  // Handle bulk email deletion
  const handleBulkDelete = async (emailIds: number[]) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${emailIds.length} email${
        emailIds.length === 1 ? "" : "s"
      }?`
    );
    if (!confirmed) return;

    try {
      await bulkDeleteEmails(emailIds);
      await refetch(); // Refresh the email list
    } catch (error) {
      console.error("Failed to delete emails:", error);
      alert("Failed to delete emails. Please try again.");
    }
  };

  const getEmailStats = () => {
    if (!emails)
      return { total: 0, critical: 0, malicious: 0, suspicious: 0, clean: 0 };

    const stats = {
      total: emails.length,
      critical: emails.filter(
        (e) => e.threat_summary.overall_risk === "critical"
      ).length,
      malicious: emails.filter(
        (e) => e.threat_summary.overall_risk === "malicious"
      ).length,
      suspicious: emails.filter(
        (e) => e.threat_summary.overall_risk === "suspicious"
      ).length,
      clean: emails.filter((e) => e.threat_summary.overall_risk === "clean")
        .length,
    };
    return stats;
  };

  const stats = getEmailStats();

  if (loading) {
    return (
      <div className="emails-page">
        <div className="emails-loading">
          <div className="loading-spinner"></div>
          <p>Loading emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emails-page">
        <div className="emails-error">
          <Mail size={48} />
          <h2>Failed to Load Emails</h2>
          <p>{error.error}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="emails-page">
      <div className="emails-header">
        <div className="emails-header__title">
          <Mail className="emails-header__icon" size={28} />
          <div>
            <h1>Email Security</h1>
            <p>
              Analyze and manage email threats detected by the security system
            </p>
          </div>
        </div>

        <div className="emails-header__actions">
          <button className="btn btn--secondary">
            <Download size={18} />
            Export Report
          </button>
          <button className="btn btn--secondary">
            <Filter size={18} />
            Advanced Filters
          </button>
          <button className="btn btn--secondary">
            <Settings size={18} />
            Settings
          </button>
          <button className="btn btn--primary" onClick={handleUploadNavigation}>
            <Upload size={18} />
            Upload Email
          </button>
          <button className="btn btn--primary">
            <Zap size={18} />
            Run Scan
          </button>
        </div>
      </div>

      <div className="emails-stats">
        <div className="stat-card">
          <div className="stat-card__value">{stats.total}</div>
          <div className="stat-card__label">Total Emails</div>
          <div className="stat-card__trend">
            <span className="trend-indicator trend-indicator--neutral">●</span>
            <span>All analyzed</span>
          </div>
        </div>

        <div className="stat-card stat-card--danger">
          <div className="stat-card__value">{stats.critical}</div>
          <div className="stat-card__label">Critical Threats</div>
          <div className="stat-card__trend">
            <span className="trend-indicator trend-indicator--up">▲</span>
            <span>Immediate action required</span>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__value">
            {stats.malicious + stats.suspicious}
          </div>
          <div className="stat-card__label">Suspicious</div>
          <div className="stat-card__trend">
            <span className="trend-indicator trend-indicator--up">▲</span>
            <span>Under investigation</span>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__value">{stats.clean}</div>
          <div className="stat-card__label">Clean</div>
          <div className="stat-card__trend">
            <span className="trend-indicator trend-indicator--down">▼</span>
            <span>Safe emails</span>
          </div>
        </div>

        <div className="stat-card stat-card--info">
          <div className="stat-card__value">
            {stats.total > 0
              ? Math.round((stats.clean / stats.total) * 100)
              : 0}
            %
          </div>
          <div className="stat-card__label">Safety Rate</div>
          <div className="stat-card__trend">
            <span className="trend-indicator trend-indicator--neutral">●</span>
            <span>System performance</span>
          </div>
        </div>
      </div>

      <div className="emails-actions-bar">
        <div className="quick-actions">
          <button
            className="quick-action-btn"
            disabled={bulkDeleteLoading || deleteLoading}
          >
            <Mail size={16} />
            Scan New Emails
          </button>
          <button
            className="quick-action-btn"
            onClick={() => refetch()}
            disabled={loading}
          >
            <Zap size={16} />
            Refresh List
          </button>
        </div>

        <div className="email-metrics">
          <div className="metric">
            <span className="metric-label">Avg. Risk Score:</span>
            <span className="metric-value">
              {emails && emails.length > 0
                ? (
                    (emails.reduce(
                      (sum, email) => sum + email.phishing_score_cti,
                      0
                    ) /
                      emails.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Auth Pass Rate:</span>
            <span className="metric-value">
              {emails && emails.length > 0
                ? Math.round(
                    (emails.filter(
                      (e) => e.spf_result === "pass" && e.dkim_result === "pass"
                    ).length /
                      emails.length) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      <EnhancedEmailFilters
        onFiltersChange={filterEmails}
        onSearch={searchEmails}
        onClearFilters={clearFilters}
        currentFilters={currentFilters}
        totalCount={emails?.length || 0}
        filteredCount={emails?.length || 0}
        loading={loading}
      />

      <EmailList
        emails={emails || []}
        onEmailView={handleEmailView}
        onEmailDelete={handleEmailDelete}
        onBulkDelete={handleBulkDelete}
      />

      {/* Email Detail Modal - Placeholder for future implementation */}
      {showEmailDetail && selectedEmail && (
        <div
          className="email-detail-modal-backdrop"
          onClick={() => setShowEmailDetail(false)}
        >
          <div
            className="email-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Email Details</h2>
              <button onClick={() => setShowEmailDetail(false)}>×</button>
            </div>
            <div className="modal-content">
              <h3>{selectedEmail.subject}</h3>
              <p>
                <strong>From:</strong> {selectedEmail.sender}
              </p>
              <p>
                <strong>To:</strong> {selectedEmail.recipient}
              </p>
              <p>
                <strong>Threat Level:</strong>{" "}
                {selectedEmail.threat_summary.overall_risk}
              </p>
              <p>
                <strong>Risk Score:</strong>{" "}
                {(selectedEmail.phishing_score_cti * 100).toFixed(1)}%
              </p>
              <div className="email-body">
                <h4>Email Body:</h4>
                <div className="email-content">{selectedEmail.body}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Emails Page Styles
const styles = `
.emails-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.emails-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.emails-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.emails-header__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.emails-header h1 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.emails-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.emails-header__actions {
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

/* Email Stats */
.emails-stats {
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
  margin-bottom: var(--spacing-sm);
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.trend-indicator {
  font-size: var(--font-size-sm);
}

.trend-indicator--up {
  color: var(--color-danger);
}

.trend-indicator--down {
  color: var(--color-success);
}

.trend-indicator--neutral {
  color: var(--text-muted);
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

.stat-card--success {
  border-color: var(--color-success);
  background: rgba(34, 197, 94, 0.05);
}

.stat-card--success .stat-card__value {
  color: var(--color-success);
}

.stat-card--info {
  border-color: var(--color-info);
  background: rgba(59, 130, 246, 0.05);
}

.stat-card--info .stat-card__value {
  color: var(--color-info);
}

/* Actions Bar */
.emails-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.quick-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.quick-action-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.email-metrics {
  display: flex;
  gap: var(--spacing-lg);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  text-align: center;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* Loading State */
.emails-loading {
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

.emails-loading p {
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}

/* Error State */
.emails-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-lg);
  text-align: center;
}

.emails-error svg {
  color: var(--color-danger);
}

.emails-error h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.emails-error p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-md);
}

.emails-error button {
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

.emails-error button:hover {
  background: #00CC80;
  transform: translateY(-1px);
}

/* Email Detail Modal */
.email-detail-modal-backdrop {
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

.email-detail-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.email-upload-modal {
  max-width: 900px;
  max-height: 90vh;
  padding: var(--spacing-lg);
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

.email-content {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-top: var(--spacing-sm);
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .emails-page {
    padding: var(--spacing-lg);
  }

  .emails-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }

  .emails-header__actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .emails-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-card__value {
    font-size: var(--font-size-2xl);
  }

  .emails-actions-bar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .email-metrics {
    justify-content: center;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("emails-page-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "emails-page-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
