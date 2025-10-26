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
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-base">Loading emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 text-center">
          <Mail size={48} className="text-red-500" />
          <h2 className="text-xl font-semibold text-white">Failed to Load Emails</h2>
          <p className="text-gray-400">{error.error}</p>
          <button 
            className="px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no emails in database
  if (!loading && (!emails || emails.length === 0)) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Mail className="text-green-400 shrink-0" size={28} />
            <div>
              <h1 className="m-0 mb-1 text-3xl font-bold text-white">Email Security Dashboard</h1>
              <p className="m-0 text-gray-400 text-sm">
                View and manage emails analyzed by your n8n automation workflow
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button 
              className="px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
              onClick={() => refetch()}
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
          <Mail size={64} strokeWidth={1.5} className="text-gray-600" />
          <h2 className="text-xl font-semibold text-white">No Emails Found</h2>
          <p className="text-gray-400 max-w-md">
            Your n8n automation hasn't processed any emails yet, or no emails
            match your current filters.
          </p>
          <div className="flex gap-4">
            <button 
              className="px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
              onClick={() => refetch()}
            >
              <RefreshCw size={18} />
              Check for New Emails
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Mail className="text-green-400 shrink-0" size={28} />
          <div>
            <h1 className="m-0 mb-1 text-3xl font-bold text-white">Email Security Dashboard</h1>
            <p className="m-0 text-gray-400 text-sm">
              View and manage emails analyzed by your n8n automation workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button 
            className="px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
            onClick={() => refetch()}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Total Emails</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">●</span>
            <span className="text-xs text-gray-500">All analyzed</span>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-2">{stats.malicious}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Malicious Threats</div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">▲</span>
            <span className="text-xs text-gray-500">Immediate action required</span>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-2">{stats.suspicious}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Suspicious</div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">▲</span>
            <span className="text-xs text-gray-500">Under investigation</span>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 md:col-span-3">
          <div className="text-3xl font-bold text-white mb-2">{stats.clean}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Clean</div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">▼</span>
            <span className="text-xs text-gray-500">Safe emails</span>
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
