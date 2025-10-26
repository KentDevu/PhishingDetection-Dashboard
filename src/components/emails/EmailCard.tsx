// Email Card Component - Individual email display with threat analysis

import { useState } from "react";
import {
  Mail,
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
        return "text-red-400";
      case "malicious":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "suspicious":
        return "text-yellow-400";
      case "clean":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getAuthStatusIcon = (result: string) => {
    return result === "pass" ? <Check size={14} /> : <X size={14} />;
  };

  const getAuthStatusColor = (result: string) => {
    return result === "pass" ? "text-green-400" : "text-red-400";
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you'd show a toast notification here
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  };

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg transition-all duration-200 ease-in-out overflow-hidden hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/10 ${isSelected ? "border-cyan-400 bg-gray-900/50" : ""}`}>
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center">
          <button
            className="w-5 h-5 border border-gray-600 rounded flex items-center justify-center hover:border-cyan-400 transition-colors"
            onClick={() => onSelect?.(email.id)}
          >
            <div className={`w-3 h-3 rounded-sm flex items-center justify-center ${isSelected ? "bg-cyan-400" : ""}`}>
              {isSelected && <Check size={10} className="text-gray-900" />}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            onClick={() => onView?.(email)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className="relative">
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              onClick={() => setShowActions(!showActions)}
              title="More Actions"
            >
              <MoreVertical size={16} />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
                  onClick={() => handleCopyToClipboard(email.sender)}
                >
                  <Copy size={14} />
                  Copy Sender
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
                  onClick={() => handleCopyToClipboard(email.subject)}
                >
                  <Copy size={14} />
                  Copy Subject
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
                  onClick={() => onView?.(email)}
                >
                  <ExternalLink size={14} />
                  View Full Email
                </button>
                <hr className="border-gray-700 my-1" />
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2 transition-colors"
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

      {/* Card Header */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-400" />
                <span className="text-white font-medium truncate max-w-32">
                  {email.sender_name || "Unknown"}
                </span>
                <span className="text-gray-400 truncate max-w-48">&lt;{email.sender}&gt;</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} />
                <span>
                  {formatDistanceToNow(new Date(email.timestamp), {
                    addSuffix: true,
                  })}
                </span>
                <span className={`font-medium ${getThreatColor(email.threat_summary?.overall_risk || "clean")}`}>
                  • {(email.threat_summary?.overall_risk || "clean").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-2">
              <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <h3 className="text-white font-medium leading-tight">{email.subject}</h3>
            </div>

            <div className="text-sm text-gray-400">
              <span>To: {email.recipient}</span>
            </div>
          </div>

          <div className="ml-4 shrink-0">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Risk Score</div>
              <div className={`text-lg font-bold ${getThreatColor(email.threat_summary?.overall_risk || "clean")}`}>
                {formatScore(email.phishing_score_cti)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 space-y-6">
          {/* Authentication Status */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              Authentication Status
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">SPF</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${getAuthStatusColor(email.spf_result)}`}>
                  {getAuthStatusIcon(email.spf_result)}
                  <span>{email.spf_result.toUpperCase()}</span>
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">DKIM</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${getAuthStatusColor(email.dkim_result)}`}>
                  {getAuthStatusIcon(email.dkim_result)}
                  <span>{email.dkim_result.toUpperCase()}</span>
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">DMARC</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${getAuthStatusColor(email.dmarc_result)}`}>
                  {getAuthStatusIcon(email.dmarc_result)}
                  <span>{email.dmarc_result.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Threat Analysis Summary */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Threat Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Confidence</div>
                <div className="text-sm font-medium text-white">
                  {(email.threat_summary?.confidence || "unknown").toUpperCase()}
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Malicious Found</div>
                <div className="text-sm font-medium text-red-400">
                  {email.threat_summary?.malicious_found || 0}
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Suspicious Found</div>
                <div className="text-sm font-medium text-yellow-400">
                  {email.threat_summary?.suspicious_found || 0}
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Avg Reputation</div>
                <div className="text-sm font-medium text-cyan-400">
                  {(email.threat_summary?.average_reputation || 0).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* URLs and Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Link size={16} />
                Extracted URLs ({email.extracted_urls.length})
              </h4>
              {email.extracted_urls.length > 0 ? (
                <div className="space-y-2">
                  {email.extracted_urls.slice(0, 3).map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-900/50 border border-gray-700 rounded-lg">
                      <Globe size={12} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-300 flex-1 truncate">{url}</span>
                      <button
                        onClick={() => handleCopyToClipboard(url)}
                        className="text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                  {email.extracted_urls.length > 3 && (
                    <div className="text-xs text-gray-400 text-center">
                      +{email.extracted_urls.length - 3} more URLs
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No URLs found</div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Paperclip size={16} />
                Attachments ({email.attachments.length})
              </h4>
              {email.attachments.length > 0 ? (
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-900/50 border border-gray-700 rounded-lg">
                      <Paperclip size={12} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-300 flex-1 truncate">{attachment}</span>
                      {email.attachment_hashes[index] && (
                        <span className="text-xs text-gray-500 font-mono">
                          {email.attachment_hashes[index].substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No attachments</div>
              )}
            </div>
          </div>

          {/* CTI Flags */}
          {email.cti_flags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Security Flags</h4>
              <div className="flex flex-wrap gap-2">
                {email.cti_flags.map((flag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/20 border border-red-700 text-red-400 text-xs font-medium rounded-full">
                    <Flag size={12} />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Technical Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Sender IP</div>
                <div className="text-sm font-medium text-white font-mono">{email.sender_ip}</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Sender Domain</div>
                <div className="text-sm font-medium text-white font-mono">{email.sender_domain}</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Timestamp</div>
                <div className="text-sm font-medium text-white">
                  {format(new Date(email.timestamp), "PPpp")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


