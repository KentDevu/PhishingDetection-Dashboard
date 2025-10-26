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

  const getThreatBadgeClasses = (threat: ThreatLevel) => {
    switch (threat) {
      case "critical":
      case "malicious":
        return 'bg-red-900/20 text-red-400 border border-red-700';
      case "high":
        return 'bg-orange-900/20 text-orange-400 border border-orange-700';
      case "suspicious":
        return 'bg-yellow-900/20 text-yellow-400 border border-yellow-700';
      case "clean":
      default:
        return 'bg-green-900/20 text-green-400 border border-green-700';
    }
  };

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg gap-6">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-transparent border border-gray-600 rounded-lg text-gray-400 text-sm cursor-pointer hover:bg-gray-700 hover:border-cyan-400 hover:text-cyan-400 transition-colors" onClick={handleSelectAll}>
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
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-cyan-900/20 border border-cyan-700 text-cyan-400 rounded-lg hover:bg-cyan-900/30 transition-colors"
                onClick={() => console.log("View selected emails")}
              >
                <Eye size={16} />
                View Selected
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-blue-900/20 border border-blue-700 text-blue-400 rounded-lg hover:bg-blue-900/30 transition-colors"
                onClick={() => console.log("Export selected emails")}
              >
                <Download size={16} />
                Export
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-700 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split("-");
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
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

          <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg p-1">
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "card"
                  ? 'bg-cyan-900/50 border border-cyan-700 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setViewMode("card")}
            >
              Card View
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? 'bg-cyan-900/50 border border-cyan-700 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setViewMode("table")}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {sortedEmails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Mail size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No emails found</h3>
          <p className="text-gray-400 max-w-md">
            {filters.search ||
            filters.threatLevel.length > 0 ||
            filters.sender !== ""
              ? "Try adjusting your filters to see more results."
              : "No emails are currently available."}
          </p>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-1 gap-4" : ""}>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="grid grid-cols-8 gap-4 p-4 bg-gray-900 border-b border-gray-700 font-medium text-gray-300 text-sm">
                <div className="flex items-center">
                  <button onClick={handleSelectAll} className="text-gray-400 hover:text-white">
                    {selectedEmails.size === sortedEmails.length &&
                    sortedEmails.length > 0 ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </div>
                <button
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort("threat_level")}
                >
                  Threat
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort("sender")}
                >
                  Sender
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort("subject")}
                >
                  Subject
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort("phishing_score")}
                >
                  Score
                  <ArrowUpDown size={14} />
                </button>
                <div className="flex items-center">Auth</div>
                <button
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort("timestamp")}
                >
                  Time
                  <ArrowUpDown size={14} />
                </button>
                <div className="flex items-center">Actions</div>
              </div>
              <div className="divide-y divide-gray-700">
                {sortedEmails.map((email) => (
                  <div key={email.id} className="grid grid-cols-8 gap-4 p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center">
                      <button onClick={() => handleSelectEmail(email.id)} className="text-gray-400 hover:text-white">
                        {selectedEmails.has(email.id) ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getThreatBadgeClasses(email.threat_summary?.overall_risk || "clean")}`}>
                        <AlertTriangle size={12} />
                        {(email.threat_summary?.overall_risk || "clean").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-gray-400" />
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">
                          {email.sender_name || "Unknown"}
                        </span>
                        <span className="text-gray-400 text-xs">{email.sender}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white text-sm font-medium line-clamp-2">
                        {email.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        {(email.attachments?.length || 0) > 0 && (
                          <span className="text-xs text-gray-400" title={`${email.attachments.length} attachments`}>
                            📎 {email.attachments.length}
                          </span>
                        )}
                        {(email.extracted_urls?.length || 0) > 0 && (
                          <span className="text-xs text-gray-400" title={`${email.extracted_urls.length} URLs`}>
                            🔗 {email.extracted_urls.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        email.threat_summary?.overall_risk === 'malicious'
                          ? 'text-red-400'
                          : email.threat_summary?.overall_risk === 'suspicious'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}>
                        {((email.phishing_score_cti || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        (email.spf_result || "unknown") === "pass"
                          ? 'bg-green-900/20 text-green-400 border border-green-700'
                          : 'bg-red-900/20 text-red-400 border border-red-700'
                      }`} title={`SPF: ${email.spf_result || "unknown"}`}>
                        <Shield size={10} />
                        SPF
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        (email.dkim_result || "unknown") === "pass"
                          ? 'bg-green-900/20 text-green-400 border border-green-700'
                          : 'bg-red-900/20 text-red-400 border border-red-700'
                      }`} title={`DKIM: ${email.dkim_result || "unknown"}`}>
                        <Shield size={10} />
                        DKIM
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock size={12} />
                      {formatRelativeTime(email.timestamp)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                        onClick={() => onEmailView?.(email)}
                        title="View email"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        onClick={() => onEmailDelete?.(email.id)}
                        title="Delete email"
                      >
                        <Trash2 size={14} />
                      </button>
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
