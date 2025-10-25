// Email List Component - Display and manage multiple emails

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  Eye,
  Trash2,
  Download,
  CheckSquare,
  Square,
  Mail,
  AlertTriangle,
  Clock,
  User,
  Shield,
} from "lucide-react";
import { EmailCard } from "./EmailCard";
import { EmailFilters } from "./EmailFilters";
import type { Email, ThreatLevel, AuthResult } from "../../models/email";

interface FilterState {
  search: string;
  threatLevel: ThreatLevel[];
  spfResult: AuthResult[];
  dkimResult: AuthResult[];
  dmarcResult: AuthResult[];
  sender: string;
  recipient: string;
  domain: string;
  dateRange: "today" | "3d" | "7d" | "30d" | "all";
  scoreRange: [number, number];
  hasAttachments: "all" | "yes" | "no";
  hasUrls: "all" | "yes" | "no";
}

interface EmailListProps {
  emails: Email[];
  onEmailView?: (email: Email) => void;
  onEmailDelete?: (emailId: number) => void;
  onBulkDelete?: (emailIds: number[]) => void;
}

type SortField =
  | "timestamp"
  | "sender"
  | "subject"
  | "threat_level"
  | "phishing_score";
type SortDirection = "asc" | "desc";

const THREAT_ORDER = {
  critical: 5,
  malicious: 4,
  high: 3,
  suspicious: 2,
  clean: 1,
};

export function EmailList({
  emails,
  onEmailView,
  onEmailDelete,
  onBulkDelete,
}: EmailListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    threatLevel: [],
    spfResult: [],
    dkimResult: [],
    dmarcResult: [],
    sender: "",
    recipient: "",
    domain: "",
    dateRange: "all",
    scoreRange: [0, 100],
    hasAttachments: "all",
    hasUrls: "all",
  });

  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedEmails, setSelectedEmails] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Filter emails based on current filters
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !email.subject.toLowerCase().includes(searchLower) &&
          !email.sender.toLowerCase().includes(searchLower) &&
          !email.body.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Threat level filter
      if (
        filters.threatLevel.length > 0 &&
        !filters.threatLevel.includes(email.threat_summary.overall_risk)
      ) {
        return false;
      }

      // Authentication filters
      if (
        filters.spfResult.length > 0 &&
        !filters.spfResult.includes(email.spf_result)
      ) {
        return false;
      }

      if (
        filters.dkimResult.length > 0 &&
        !filters.dkimResult.includes(email.dkim_result)
      ) {
        return false;
      }

      if (
        filters.dmarcResult.length > 0 &&
        !filters.dmarcResult.includes(email.dmarc_result)
      ) {
        return false;
      }

      // Sender/recipient filters
      if (
        filters.sender &&
        !email.sender.toLowerCase().includes(filters.sender.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.recipient &&
        !email.recipient.toLowerCase().includes(filters.recipient.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.domain &&
        !email.sender_domain
          .toLowerCase()
          .includes(filters.domain.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const emailDate = new Date(email.timestamp);
        const daysDiff = Math.floor(
          (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.dateRange) {
          case "today":
            if (daysDiff > 0) return false;
            break;
          case "3d":
            if (daysDiff > 3) return false;
            break;
          case "7d":
            if (daysDiff > 7) return false;
            break;
          case "30d":
            if (daysDiff > 30) return false;
            break;
        }
      }

      // Score range filter
      const scorePercent = email.phishing_score_cti * 100;
      if (
        scorePercent < filters.scoreRange[0] ||
        scorePercent > filters.scoreRange[1]
      ) {
        return false;
      }

      // Attachment filter
      if (filters.hasAttachments === "yes" && email.attachments.length === 0) {
        return false;
      }
      if (filters.hasAttachments === "no" && email.attachments.length > 0) {
        return false;
      }

      // URL filter
      if (filters.hasUrls === "yes" && email.extracted_urls.length === 0) {
        return false;
      }
      if (filters.hasUrls === "no" && email.extracted_urls.length > 0) {
        return false;
      }

      return true;
    });
  }, [emails, filters]);

  // Sort filtered emails
  const sortedEmails = useMemo(() => {
    return [...filteredEmails].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "timestamp":
          comparison =
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case "sender":
          comparison = a.sender.localeCompare(b.sender);
          break;
        case "subject":
          comparison = a.subject.localeCompare(b.subject);
          break;
        case "threat_level":
          comparison =
            THREAT_ORDER[a.threat_summary.overall_risk] -
            THREAT_ORDER[b.threat_summary.overall_risk];
          break;
        case "phishing_score":
          comparison = a.phishing_score_cti - b.phishing_score_cti;
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredEmails, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectEmail = (emailId: number) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === sortedEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(sortedEmails.map((email) => email.id)));
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedEmails.size > 0) {
      onBulkDelete(Array.from(selectedEmails));
      setSelectedEmails(new Set());
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
    }
  };

  return (
    <div className="email-list">
      <EmailFilters
        onFiltersChange={setFilters}
        totalCount={emails.length}
        filteredCount={filteredEmails.length}
      />

      <div className="email-list__controls">
        <div className="email-list__selection">
          <button className="select-all-btn" onClick={handleSelectAll}>
            {selectedEmails.size === sortedEmails.length &&
            sortedEmails.length > 0 ? (
              <CheckSquare size={18} />
            ) : (
              <Square size={18} />
            )}
            <span>
              {selectedEmails.size > 0
                ? `${selectedEmails.size} selected`
                : "Select all"}
            </span>
          </button>

          {selectedEmails.size > 0 && (
            <div className="bulk-actions">
              <button
                className="bulk-action-btn bulk-action-btn--primary"
                onClick={() => console.log("View selected emails")}
              >
                <Eye size={16} />
                View Selected
              </button>
              <button
                className="bulk-action-btn bulk-action-btn--secondary"
                onClick={() => console.log("Export selected emails")}
              >
                <Download size={16} />
                Export
              </button>
              <button
                className="bulk-action-btn bulk-action-btn--danger"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="email-list__view-controls">
          <div className="sort-controls">
            <span className="sort-label">Sort by:</span>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split("-");
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="sort-select"
            >
              <option value="timestamp-desc">Newest first</option>
              <option value="timestamp-asc">Oldest first</option>
              <option value="threat_level-desc">Highest threat</option>
              <option value="threat_level-asc">Lowest threat</option>
              <option value="phishing_score-desc">Highest score</option>
              <option value="phishing_score-asc">Lowest score</option>
              <option value="sender-asc">Sender A-Z</option>
              <option value="subject-asc">Subject A-Z</option>
            </select>
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${
                viewMode === "card" ? "view-mode-btn--active" : ""
              }`}
              onClick={() => setViewMode("card")}
            >
              Card View
            </button>
            <button
              className={`view-mode-btn ${
                viewMode === "table" ? "view-mode-btn--active" : ""
              }`}
              onClick={() => setViewMode("table")}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {sortedEmails.length === 0 ? (
        <div className="empty-state">
          <Mail size={48} className="empty-state__icon" />
          <h3 className="empty-state__title">No emails found</h3>
          <p className="empty-state__description">
            {filters.search ||
            filters.threatLevel.length > 0 ||
            filters.sender !== ""
              ? "Try adjusting your filters to see more results."
              : "No emails are currently available."}
          </p>
        </div>
      ) : (
        <div className={`email-list__content email-list__content--${viewMode}`}>
          {viewMode === "card" ? (
            <div className="email-cards-grid">
              {sortedEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  isSelected={selectedEmails.has(email.id)}
                  onSelect={handleSelectEmail}
                  onView={onEmailView}
                  onDelete={onEmailDelete}
                />
              ))}
            </div>
          ) : (
            <div className="email-table">
              <div className="email-table__header">
                <div className="email-table__header-cell email-table__header-cell--checkbox">
                  <button onClick={handleSelectAll}>
                    {selectedEmails.size === sortedEmails.length &&
                    sortedEmails.length > 0 ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </div>
                <button
                  className="email-table__header-cell email-table__header-cell--sortable"
                  onClick={() => handleSort("threat_level")}
                >
                  Threat
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="email-table__header-cell email-table__header-cell--sortable"
                  onClick={() => handleSort("sender")}
                >
                  Sender
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="email-table__header-cell email-table__header-cell--sortable"
                  onClick={() => handleSort("subject")}
                >
                  Subject
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="email-table__header-cell email-table__header-cell--sortable"
                  onClick={() => handleSort("phishing_score")}
                >
                  Score
                  <ArrowUpDown size={14} />
                </button>
                <div className="email-table__header-cell">Auth</div>
                <button
                  className="email-table__header-cell email-table__header-cell--sortable"
                  onClick={() => handleSort("timestamp")}
                >
                  Time
                  <ArrowUpDown size={14} />
                </button>
                <div className="email-table__header-cell">Actions</div>
              </div>
              <div className="email-table__body">
                {sortedEmails.map((email) => (
                  <div key={email.id} className="email-table__row">
                    <div className="email-table__cell email-table__cell--checkbox">
                      <button onClick={() => handleSelectEmail(email.id)}>
                        {selectedEmails.has(email.id) ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </div>
                    <div className="email-table__cell">
                      <span
                        className={`threat-badge threat-badge--${
                          email.threat_summary?.overall_risk || "clean"
                        }`}
                      >
                        <AlertTriangle size={12} />
                        {(
                          email.threat_summary?.overall_risk || "clean"
                        ).toUpperCase()}
                      </span>
                    </div>
                    <div className="email-table__cell email-table__cell--sender">
                      <div className="sender-info">
                        <User size={12} />
                        <span className="sender-name">
                          {email.sender_name || "Unknown"}
                        </span>
                        <span className="sender-email">{email.sender}</span>
                      </div>
                    </div>
                    <div className="email-table__cell email-table__cell--subject">
                      <div className="subject-content">
                        <span className="subject-text">{email.subject}</span>
                        <div className="email-indicators">
                          {(email.attachments?.length || 0) > 0 && (
                            <span
                              className="indicator"
                              title={`${email.attachments.length} attachments`}
                            >
                              📎 {email.attachments.length}
                            </span>
                          )}
                          {(email.extracted_urls?.length || 0) > 0 && (
                            <span
                              className="indicator"
                              title={`${email.extracted_urls.length} URLs`}
                            >
                              🔗 {email.extracted_urls.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="email-table__cell">
                      <span
                        className="score-value"
                        style={{
                          color: getThreatColor(
                            email.threat_summary?.overall_risk || "clean"
                          ),
                        }}
                      >
                        {((email.phishing_score_cti || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="email-table__cell">
                      <div className="auth-indicators">
                        <span
                          className={`auth-badge ${
                            (email.spf_result || "unknown") === "pass"
                              ? "auth-badge--pass"
                              : "auth-badge--fail"
                          }`}
                          title={`SPF: ${email.spf_result || "unknown"}`}
                        >
                          <Shield size={10} />
                          SPF
                        </span>
                        <span
                          className={`auth-badge ${
                            (email.dkim_result || "unknown") === "pass"
                              ? "auth-badge--pass"
                              : "auth-badge--fail"
                          }`}
                          title={`DKIM: ${email.dkim_result || "unknown"}`}
                        >
                          <Shield size={10} />
                          DKIM
                        </span>
                      </div>
                    </div>
                    <div className="email-table__cell">
                      <div className="email-timestamp">
                        <Clock size={12} />
                        {formatRelativeTime(email.timestamp)}
                      </div>
                    </div>
                    <div className="email-table__cell">
                      <div className="table-actions">
                        <button
                          className="table-action-btn"
                          onClick={() => onEmailView?.(email)}
                          title="View email"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="table-action-btn table-action-btn--danger"
                          onClick={() => onEmailDelete?.(email.id)}
                          title="Delete email"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Email List Styles
const styles = `
.email-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.email-list__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  gap: var(--spacing-lg);
}

.email-list__selection {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.select-all-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.select-all-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.bulk-action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.bulk-action-btn--primary {
  background: var(--bg-accent);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.bulk-action-btn--primary:hover {
  background: var(--color-primary);
  color: var(--bg-primary);
}

.bulk-action-btn--secondary {
  background: var(--bg-primary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.bulk-action-btn--secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.bulk-action-btn--danger {
  background: rgba(237, 51, 51, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.bulk-action-btn--danger:hover {
  background: var(--color-danger);
  color: white;
}

.email-list__view-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.view-mode-toggle {
  display: flex;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-mode-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.view-mode-btn:not(:last-child) {
  border-right: 1px solid var(--border-primary);
}

.view-mode-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.view-mode-btn--active {
  background: var(--bg-accent);
  color: var(--color-primary);
}

/* Email Cards Grid */
.email-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: var(--spacing-lg);
  padding: 0 var(--spacing-md);
}

/* Responsive Design for Email Cards */
@media (max-width: 1400px) {
  .email-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-md);
  }
}

@media (max-width: 1200px) {
  .email-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: 0 var(--spacing-sm);
  }
}

@media (max-width: 900px) {
  .email-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-sm);
  }
}

@media (max-width: 768px) {
  .email-cards-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
    padding: 0;
  }
}

@media (max-width: 480px) {
  .email-cards-grid {
    gap: var(--spacing-xs);
  }
}

/* Email Table */
.email-table {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.email-table__header {
  display: grid;
  grid-template-columns: 40px 120px 200px 1fr 80px 100px 120px 80px;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.email-table__header-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  white-space: nowrap;
}

.email-table__header-cell--sortable {
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.email-table__header-cell--sortable:hover {
  color: var(--color-primary);
}

.email-table__header-cell--checkbox {
  justify-content: center;
}

.email-table__body {
  max-height: 800px;
  overflow-y: auto;
}

.email-table__row {
  display: grid;
  grid-template-columns: 40px 120px 200px 1fr 80px 100px 120px 80px;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  transition: background-color var(--duration-fast) var(--ease-in-out);
  align-items: center;
}

.email-table__row:hover {
  background: var(--bg-tertiary);
}

.email-table__row:last-child {
  border-bottom: none;
}

.email-table__cell {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  min-width: 0;
}

.email-table__cell--checkbox {
  justify-content: center;
}

.email-table__cell--checkbox button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.email-table__cell--checkbox button:hover {
  color: var(--color-primary);
}

.email-table__cell--sender {
  min-width: 0;
}

.sender-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sender-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sender-email {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-table__cell--subject {
  min-width: 0;
}

.subject-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.subject-text {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-indicators {
  display: flex;
  gap: var(--spacing-xs);
}

.indicator {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.threat-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid currentColor;
  background: currentColor;
  opacity: 0.9;
}

.threat-badge--clean {
  background: var(--color-success);
  color: var(--text-primary);
  border-color: var(--color-success);
}

.threat-badge--low {
  background: var(--color-success);
  color: var(--text-primary);
  border-color: var(--color-success);
}

.threat-badge--medium {
  background: var(--color-warning);
  color: var(--text-primary);
  border-color: var(--color-warning);
}

.threat-badge--suspicious {
  background: var(--color-warning);
  color: var(--text-primary);
  border-color: var(--color-warning);
}

.threat-badge--high {
  background: #FF6B35;
  color: white;
  border-color: #FF6B35;
}

.threat-badge--critical,
.threat-badge--malicious {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

.score-value {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.auth-indicators {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.auth-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.auth-badge--pass {
  background: rgba(34, 197, 94, 0.2);
  color: var(--color-success);
}

.auth-badge--fail {
  background: rgba(237, 51, 51, 0.2);
  color: var(--color-danger);
}

.email-timestamp {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.table-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.table-action-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.table-action-btn--danger:hover {
  background: rgba(237, 51, 51, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.empty-state__icon {
  color: var(--text-muted);
  margin: 0 auto var(--spacing-lg);
}

.empty-state__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
}

.empty-state__description {
  color: var(--text-muted);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .email-list__controls {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-md);
  }

  .email-list__view-controls {
    gap: var(--spacing-md);
  }

  .sort-controls {
    gap: var(--spacing-xs);
  }

  .sort-label {
    display: none;
  }

  .email-table__header,
  .email-table__row {
    grid-template-columns: 30px 100px 1fr 60px 80px 50px;
  }

  .email-table__cell:nth-child(6),
  .email-table__cell:nth-child(7) {
    display: none;
  }

  .email-table__header-cell:nth-child(6),
  .email-table__header-cell:nth-child(7) {
    display: none;
  }
}

@media (max-width: 900px) {
  .email-list__controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }

  .email-list__selection {
    justify-content: center;
  }

  .email-list__view-controls {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .bulk-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .sort-select {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .view-mode-btn {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

@media (max-width: 768px) {
  .email-list {
    gap: var(--spacing-md);
  }

  .email-list__controls {
    margin: 0 var(--spacing-sm);
  }

  .email-list__selection {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .bulk-actions {
    justify-content: center;
  }

  .email-list__view-controls {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .sort-controls {
    order: 2;
  }

  .view-mode-toggle {
    order: 1;
  }

  .email-table__header,
  .email-table__row {
    grid-template-columns: 30px 1fr 60px 40px;
    font-size: var(--font-size-xs);
    padding: var(--spacing-sm);
  }

  .email-table__cell:nth-child(n+5) {
    display: none;
  }

  .email-table__header-cell:nth-child(n+5) {
    display: none;
  }

  .sender-info {
    gap: 1px;
  }

  .subject-content {
    gap: 2px;
  }

  .email-indicators {
    gap: 2px;
  }

  .indicator {
    font-size: 10px;
    padding: 1px 3px;
  }
}

@media (max-width: 480px) {
  .email-list {
    gap: var(--spacing-sm);
  }

  .email-list__controls {
    margin: 0;
    border-radius: var(--radius-md);
  }

  .select-all-btn {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .bulk-action-btn {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .email-table__header,
  .email-table__row {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
  }

  .empty-state {
    padding: var(--spacing-xl);
  }

  .empty-state__title {
    font-size: var(--font-size-md);
  }

  .empty-state__description {
    font-size: var(--font-size-sm);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("email-list-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "email-list-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
