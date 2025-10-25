// Emails Page - Display emails analyzed by n8n automation (READ-ONLY)

import { useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { EmailList } from "../../components/emails/EmailList";
import { EnhancedEmailFilters } from "../../components/emails/EnhancedEmailFilters";
import { EmailDetailModal } from "../../components/emails/EmailDetailModal";
import { useEmails } from "../../hooks/useEmails";
import { useBulkDelete } from "../../hooks/useBulkDelete";
import { useDeleteEmail } from "../../hooks/useDeleteEmail";
import { useNotifications } from "../../contexts/NotificationContext";
import type { Email } from "../../models/email";
import "./Emails.css";

export function Emails() {
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
  const { bulkDeleteEmails } = useBulkDelete();
  const { deleteEmail } = useDeleteEmail();
  const { addNotification } = useNotifications();

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);

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
      await refetch();
      addNotification({
        type: "success",
        message: "The email has been successfully removed.",
      });
    } catch (error) {
      console.error("Failed to delete email:", error);
      addNotification({
        type: "error",
        message: "Unable to delete the email. Please try again.",
      });
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
      await refetch();
      addNotification({
        type: "success",
        message: `Successfully deleted ${emailIds.length} email${
          emailIds.length === 1 ? "" : "s"
        }.`,
      });
    } catch (error) {
      console.error("Failed to delete emails:", error);
      addNotification({
        type: "error",
        message: "Unable to delete the selected emails. Please try again.",
      });
    }
  };

  const mapRiskLevel = (risk: string) => {
    switch (risk) {
      case "low":
      case "clean":
        return "clean";
      case "medium":
      case "suspicious":
        return "suspicious";
      case "high":
      case "critical":
      case "malicious":
        return "malicious";
      default:
        return "clean"; // default to clean
    }
  };

  const getEmailStats = () => {
    if (!emails)
      return { total: 0, malicious: 0, suspicious: 0, clean: 0 };

    console.log("Emails stats debug:", {
      totalEmails: emails.length,
      sampleRisks: emails.slice(0, 5).map(e => e.threat_summary?.overall_risk),
      allRisks: emails.map(e => e.threat_summary?.overall_risk)
    });

    const stats = {
      total: emails.length,
      malicious: emails.filter(
        (e) => mapRiskLevel(e.threat_summary?.overall_risk || "low") === "malicious"
      ).length,
      suspicious: emails.filter(
        (e) => mapRiskLevel(e.threat_summary?.overall_risk || "low") === "suspicious"
      ).length,
      clean: emails.filter((e) => mapRiskLevel(e.threat_summary?.overall_risk || "low") === "clean")
        .length,
    };
    console.log("Calculated stats:", stats);
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
          <button className="btn btn--primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no emails in database
  if (!loading && (!emails || emails.length === 0)) {
    return (
      <div className="emails-page">
        <div className="emails-header">
          <div className="emails-header__title">
            <Mail className="emails-header__icon" size={28} />
            <div>
              <h1>Email Security Dashboard</h1>
              <p>
                View and manage emails analyzed by your n8n automation workflow
              </p>
            </div>
          </div>
          <div className="emails-header__actions">
            <button className="btn btn--primary" onClick={() => refetch()}>
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div className="emails-empty">
          <Mail size={64} strokeWidth={1.5} />
          <h2>No Emails Found</h2>
          <p>
            Your n8n automation hasn't processed any emails yet, or no emails
            match your current filters.
          </p>
          <div className="empty-actions">
            <button className="btn btn--primary" onClick={() => refetch()}>
              <RefreshCw size={18} />
              Check for New Emails
            </button>
          </div>
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
            <h1>Email Security Dashboard</h1>
            <p>
              View and manage emails analyzed by your n8n automation workflow
            </p>
          </div>
        </div>

        <div className="emails-header__actions">
          <button className="btn btn--primary" onClick={() => refetch()}>
            <RefreshCw size={18} />
            Refresh
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
          <div className="stat-card__value">{stats.malicious}</div>
          <div className="stat-card__label">Malicious Threats</div>
          <div className="stat-card__trend">
            <span className="trend-indicator trend-indicator--up">▲</span>
            <span>Immediate action required</span>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__value">{stats.suspicious}</div>
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
      </div>

      <div className="emails-actions-bar">
        <div className="quick-actions">
          <button
            className="quick-action-btn"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh Data
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

      {/* Email Detail Modal */}
      {showEmailDetail && selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          onClose={() => setShowEmailDetail(false)}
        />
      )}
    </div>
  );
}
