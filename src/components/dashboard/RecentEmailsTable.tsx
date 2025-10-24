// Recent Emails Table - Displays latest email threats with risk indicators

import { formatDistanceToNow } from "date-fns";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import type { Email, ThreatLevel } from "../../models/email";

interface RecentEmailsTableProps {
  emails?: Email[];
  loading?: boolean;
  limit?: number;
}

export function RecentEmailsTable({
  emails,
  loading = false,
  limit = 10,
}: RecentEmailsTableProps) {
  // Generate demo data
  const generateDemoEmails = (): Partial<Email>[] => {
    return [
      {
        id: 1,
        subject: "Urgent: Account Security Alert",
        sender: "security@phishingsite.com",
        sender_domain: "phishingsite.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        phishing_score_cti: 0.85,
        threat_summary: {
          overall_risk: "high" as ThreatLevel,
          confidence: "high",
          total_analyzed: 3,
          malicious_found: 2,
          suspicious_found: 1,
          average_reputation: 36,
        },
        spf_result: "fail",
        dkim_result: "fail",
        dmarc_result: "fail",
      },
      {
        id: 2,
        subject: "Weekly Security Newsletter",
        sender: "newsletter@trusted-corp.com",
        sender_domain: "trusted-corp.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        phishing_score_cti: 0.05,
        threat_summary: {
          overall_risk: "clean" as ThreatLevel,
          confidence: "high",
          total_analyzed: 2,
          malicious_found: 0,
          suspicious_found: 0,
          average_reputation: 98,
        },
        spf_result: "pass",
        dkim_result: "pass",
        dmarc_result: "pass",
      },
      {
        id: 3,
        subject: "Invoice #INV-2023-001",
        sender: "billing@suspicious-domain.net",
        sender_domain: "suspicious-domain.net",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        phishing_score_cti: 0.67,
        threat_summary: {
          overall_risk: "medium" as ThreatLevel,
          confidence: "medium",
          total_analyzed: 3,
          malicious_found: 1,
          suspicious_found: 2,
          average_reputation: 65,
        },
        spf_result: "pass",
        dkim_result: "fail",
        dmarc_result: "fail",
      },
    ];
  };

  const tableData = emails?.slice(0, limit) || generateDemoEmails();

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case "critical":
        return "risk-badge risk-badge--critical";
      case "high":
        return "risk-badge risk-badge--high";
      case "medium":
        return "risk-badge risk-badge--medium";
      case "low":
        return "risk-badge risk-badge--low";
      default:
        return "risk-badge risk-badge--clean";
    }
  };

  const getAuthIcon = (result: string) => {
    return result === "pass" ? (
      <CheckCircle size={14} className="auth-icon auth-icon--pass" />
    ) : (
      <XCircle size={14} className="auth-icon auth-icon--fail" />
    );
  };

  const getPhishingScoreColor = (score: number) => {
    if (score >= 0.7) return "score-bar--high";
    if (score >= 0.4) return "score-bar--medium";
    return "score-bar--low";
  };

  if (loading) {
    return (
      <div className="recent-emails recent-emails--loading">
        <div className="recent-emails__skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton skeleton--subject"></div>
              <div className="skeleton skeleton--sender"></div>
              <div className="skeleton skeleton--badge"></div>
              <div className="skeleton skeleton--time"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="recent-emails">
      <div className="recent-emails__table">
        <div className="table-header">
          <div className="table-header__cell table-header__cell--subject">
            <Mail size={16} />
            <span>Subject</span>
          </div>
          <div className="table-header__cell table-header__cell--sender">
            Sender
          </div>
          <div className="table-header__cell table-header__cell--risk">
            Risk Level
          </div>
          <div className="table-header__cell table-header__cell--score">
            Phishing Score
          </div>
          <div className="table-header__cell table-header__cell--auth">
            Auth
          </div>
          <div className="table-header__cell table-header__cell--time">
            Time
          </div>
        </div>

        <div className="table-body">
          {tableData.map((email) => (
            <div key={email.id} className="table-row">
              <div className="table-cell table-cell--subject">
                <div className="email-subject">
                  <span className="email-subject__text" title={email.subject}>
                    {email.subject}
                  </span>
                </div>
              </div>

              <div className="table-cell table-cell--sender">
                <div className="email-sender">
                  <span className="email-sender__domain">
                    {email.sender_domain}
                  </span>
                </div>
              </div>

              <div className="table-cell table-cell--risk">
                <span
                  className={getRiskBadgeClass(
                    email.threat_summary?.overall_risk || "clean"
                  )}
                >
                  {email.threat_summary?.overall_risk || "clean"}
                </span>
              </div>

              <div className="table-cell table-cell--score">
                <div className="phishing-score">
                  <div className="score-bar">
                    <div
                      className={`score-bar__fill ${getPhishingScoreColor(
                        email.phishing_score_cti || 0
                      )}`}
                      style={{
                        width: `${(email.phishing_score_cti || 0) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="score-text">
                    {Math.round((email.phishing_score_cti || 0) * 100)}%
                  </span>
                </div>
              </div>

              <div className="table-cell table-cell--auth">
                <div className="auth-indicators">
                  <div
                    className="auth-indicator"
                    title={`SPF: ${email.spf_result}`}
                  >
                    {getAuthIcon(email.spf_result || "fail")}
                  </div>
                  <div
                    className="auth-indicator"
                    title={`DKIM: ${email.dkim_result}`}
                  >
                    {getAuthIcon(email.dkim_result || "fail")}
                  </div>
                  <div
                    className="auth-indicator"
                    title={`DMARC: ${email.dmarc_result}`}
                  >
                    {getAuthIcon(email.dmarc_result || "fail")}
                  </div>
                </div>
              </div>

              <div className="table-cell table-cell--time">
                <span className="time-ago">
                  {formatDistanceToNow(new Date(email.timestamp || ""), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Recent Emails Table Styles
const styles = `
.recent-emails {
  width: 100%;
  height: 100%;
}

.recent-emails__table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 0.8fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-primary);
}

.table-header__cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 0.8fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-primary);
  transition: background-color var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.table-row:hover {
  background: var(--bg-tertiary);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

/* Subject Column */
.email-subject {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.email-subject__text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sender Column */
.email-sender__domain {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Risk Badge */
.risk-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.risk-badge--clean {
  background: var(--bg-risk-clean);
  color: var(--color-success);
}

.risk-badge--low {
  background: var(--bg-risk-low);
  color: var(--color-primary);
}

.risk-badge--medium {
  background: var(--bg-risk-medium);
  color: var(--color-warning);
}

.risk-badge--high {
  background: var(--bg-risk-high);
  color: var(--color-danger);
}

.risk-badge--critical {
  background: var(--bg-risk-critical);
  color: var(--color-danger);
  animation: pulse 2s infinite;
}

/* Phishing Score */
.phishing-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
}

.score-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-primary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.score-bar__fill {
  height: 100%;
  border-radius: inherit;
  transition: width var(--duration-normal) var(--ease-out);
}

.score-bar--low {
  background: var(--color-success);
}

.score-bar--medium {
  background: var(--color-warning);
}

.score-bar--high {
  background: var(--color-danger);
}

.score-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  min-width: 35px;
  text-align: right;
}

/* Authentication Indicators */
.auth-indicators {
  display: flex;
  gap: 2px;
}

.auth-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-icon--pass {
  color: var(--color-success);
}

.auth-icon--fail {
  color: var(--color-danger);
}

/* Time Column */
.time-ago {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

/* Loading States */
.recent-emails--loading {
  padding: var(--spacing-md);
}

.recent-emails__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.skeleton-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  gap: var(--spacing-md);
  align-items: center;
}

.skeleton--subject { height: 16px; }
.skeleton--sender { height: 14px; width: 80%; }
.skeleton--badge { height: 20px; width: 60px; }
.skeleton--time { height: 12px; width: 70%; }

/* Responsive Design */
@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 2fr 1.5fr 1fr 1fr;
  }

  .table-header__cell--auth,
  .table-cell--auth {
    display: none;
  }
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .table-header__cell--score,
  .table-cell--score {
    display: none;
  }

  .table-header,
  .table-row {
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-row {
    grid-template-areas: 
      "subject"
      "meta";
    gap: var(--spacing-xs);
  }

  .table-cell--subject {
    grid-area: subject;
  }

  .table-cell--sender,
  .table-cell--risk,
  .table-cell--time {
    display: none;
  }

  .table-header {
    display: none;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("recent-emails-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "recent-emails-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
