// Recent Emails Table - Displays latest email threats with risk indicators

import { formatDistanceToNow } from "date-fns";
import { Mail, ShieldCheck, ShieldX, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import type { Email } from "../../models/email";

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
  const tableData = emails?.slice(0, limit) ?? [];

  const getRiskBadgeVariant = (risk: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (risk?.toLowerCase()) {
      case "critical":
      case "high":
      case "malicious":
        return "destructive";
      case "medium":
      case "suspicious":
        return "secondary";
      case "low":
      case "clean":
        return "default";
      default:
        return "outline";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "critical":
      case "high":
      case "malicious":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg border border-gray-700 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {/* Header skeleton */}
            <div className="grid grid-cols-6 gap-4 pb-4 border-b border-gray-700">
              <div className="col-span-2 h-5 bg-gray-700 rounded"></div>
              <div className="col-span-1 h-5 bg-gray-700 rounded"></div>
              <div className="col-span-1 h-5 bg-gray-700 rounded"></div>
              <div className="col-span-1 h-5 bg-gray-700 rounded"></div>
              <div className="col-span-1 h-5 bg-gray-700 rounded"></div>
            </div>
            {/* Row skeletons */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-700 last:border-b-0">
                <div className="col-span-2 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
                <div className="col-span-1 h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="col-span-1 h-6 bg-gray-700 rounded-full w-16"></div>
                <div className="col-span-1 space-y-1">
                  <div className="h-2 bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-800 rounded w-8"></div>
                </div>
                <div className="col-span-1 flex gap-1">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg border border-gray-700 shadow-sm">
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Mail className="w-12 h-12 mb-4 text-gray-600" />
          <h3 className="text-lg font-medium mb-2 text-gray-300">No emails found</h3>
          <p className="text-sm text-center max-w-md text-gray-500">
            There are no emails to display at the moment. New emails will appear here as they are processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg border border-gray-700 shadow-sm overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Enhanced Header */}
        <div className="grid grid-cols-6 gap-6 px-6 py-4 bg-linear-to-r from-gray-800 to-gray-900 border-b border-gray-700">
          <div className="col-span-1 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-white">Sender</h3>
            <p className="text-xs text-gray-400">Domain</p>
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Subject</h3>
              <p className="text-xs text-gray-400">Email content</p>
            </div>
          </div>
          <div className="col-span-1 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-white">Risk Level</h3>
            <p className="text-xs text-gray-400">Threat assessment</p>
          </div>
          <div className="col-span-1 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-white">Phishing Score</h3>
            <p className="text-xs text-gray-400">Confidence level</p>
          </div>
          <div className="col-span-1 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-white">Auth</h3>
            <p className="text-xs text-gray-400">SPF/DKIM/DMARC</p>
          </div>
        </div>

        {/* Enhanced Table Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-700">
            {tableData.map((email) => (
              <div
                key={email.id}
                className="grid grid-cols-6 gap-6 px-6 py-4 hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer group"
              >
                {/* Sender Column */}
                <div className="col-span-1 flex flex-col justify-center">
                  <div className="text-sm font-medium text-white truncate" title={email.sender_domain}>
                    {email.sender_domain || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {email.sender_domain ? `@${email.sender_domain.split('.').slice(-2).join('.')}` : ''}
                  </div>
                </div>
                {/* Subject Column */}
                <div className="col-span-2 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${
                      (email.threat_summary?.overall_risk || "clean").toLowerCase() === "high" ||
                      (email.threat_summary?.overall_risk || "clean").toLowerCase() === "critical"
                        ? 'bg-red-500'
                        : (email.threat_summary?.overall_risk || "clean").toLowerCase() === "medium"
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                      {email.subject || "No subject"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(email.timestamp || ""), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>



                {/* Risk Level Column */}
                <div className="col-span-1 flex items-center">
                  <Badge
                    variant={getRiskBadgeVariant(email.threat_summary?.overall_risk || "clean")}
                    className="text-xs font-medium px-2 py-1 flex items-center gap-1"
                  >
                    {getRiskIcon(email.threat_summary?.overall_risk || "clean")}
                    {email.threat_summary?.overall_risk || "clean"}
                  </Badge>
                </div>

                {/* Phishing Score Column */}
                <div className="col-span-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-20">
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            (email.phishing_score_cti || 0) * 100 >= 80 ? 'bg-linear-to-r from-red-500 to-red-600' :
                            (email.phishing_score_cti || 0) * 100 >= 60 ? 'bg-linear-to-r from-orange-500 to-red-500' :
                            (email.phishing_score_cti || 0) * 100 >= 40 ? 'bg-linear-to-r from-yellow-500 to-orange-500' :
                            'bg-linear-to-r from-green-500 to-green-600'
                          }`}
                          style={{ width: `${Math.max((email.phishing_score_cti || 0) * 100, 5)}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-medium min-w-10 text-right ${
                      (email.phishing_score_cti || 0) * 100 >= 80 ? 'text-red-400' :
                      (email.phishing_score_cti || 0) * 100 >= 60 ? 'text-orange-400' :
                      (email.phishing_score_cti || 0) * 100 >= 40 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {Math.round((email.phishing_score_cti || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Auth Column */}
                <div className="col-span-1 flex items-center gap-1">
                  <div
                    className="flex items-center gap-1 p-1 rounded-md bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors border border-gray-600"
                    title={`SPF: ${email.spf_result || 'unknown'} | DKIM: ${email.dkim_result || 'unknown'} | DMARC: ${email.dmarc_result || 'unknown'}`}
                  >
                    {email.spf_result === "pass" ? (
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <ShieldX className="w-4 h-4 text-red-400" />
                    )}
                    {email.dkim_result === "pass" ? (
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <ShieldX className="w-4 h-4 text-red-400" />
                    )}
                    {email.dmarc_result === "pass" ? (
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <ShieldX className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with summary */}
        {tableData.length > 0 && (
          <div className="px-6 py-3 bg-gray-800/50 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>Showing {tableData.length} of {emails?.length || 0} emails</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs">Suspicious</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs">High Risk</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
