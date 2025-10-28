// Emails Page - Display emails analyzed by n8n automation (READ-ONLY)

import { useState, useEffect, useMemo } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { EmailList } from "../../components/emails/EmailList";
import { EmailDetailModal } from "../../components/emails/EmailDetailModal";
import { EnhancedEmailFilters } from "../../components/emails/EnhancedEmailFilters";
import { useApi } from "../../contexts/ApiContext";
import type { Email } from "../../models/email";

// Define the actual API response structure
interface EmailsApiResponse {
  emails: Email[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function Emails() {
  const { dataFetch } = useApi();
  const [emailsData, setEmailsData] = useState<EmailsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Emails per page
  const [filters, setFilters] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        // Fetch all emails for complete stats and client-side filtering
        const response = await dataFetch<EmailsApiResponse>('/emails/all?limit=1000', 'GET');
        console.log("Emails page fetched all emails:", response, "Type:", typeof response, "Is array:", Array.isArray(response));
        setEmailsData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch emails');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [dataFetch]);

  // Extract emails from response
  const emails = emailsData?.emails || [];

  const mapRiskLevel = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "critical":
      case "malicious":
      case "high":
        return "malicious";
      case "suspicious":
      case "medium":
        return "suspicious";
      case "clean":
      case "low":
      default:
        return "clean";
    }
  };

  // Client-side filtering
  const filteredEmails = useMemo(() => {
    if (!Array.isArray(emails)) return [];
    if (!filters && !searchTerm) return emails;

    return emails.filter((email) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !email.subject.toLowerCase().includes(searchLower) &&
          !email.sender.toLowerCase().includes(searchLower) &&
          !email.body.toLowerCase().includes(searchLower) &&
          !email.sender_name?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Threat level filter
      if (filters?.threat_level) {
        const emailRisk = mapRiskLevel(email.threat_summary?.overall_risk || "clean");
        if (emailRisk !== filters.threat_level) {
          return false;
        }
      }

      // CTI confidence filter
      if (filters?.cti_confidence) {
        if (email.threat_summary?.confidence !== filters.cti_confidence) {
          return false;
        }
      }

      // Phishing score range filter
      if (filters?.score_min !== undefined && email.phishing_score_cti < filters.score_min) {
        return false;
      }
      if (filters?.score_max !== undefined && email.phishing_score_cti > filters.score_max) {
        return false;
      }

      // Sender filter
      if (filters?.sender && !email.sender.toLowerCase().includes(filters.sender.toLowerCase())) {
        return false;
      }

      // Sender domain filter
      if (filters?.sender_domain && !email.sender_domain?.toLowerCase().includes(filters.sender_domain.toLowerCase())) {
        return false;
      }

      // Subject filter
      if (filters?.subject && !email.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters?.start_date || filters?.end_date) {
        const emailDate = new Date(email.timestamp);
        if (filters.start_date) {
          const startDate = new Date(filters.start_date);
          if (emailDate < startDate) return false;
        }
        if (filters.end_date) {
          const endDate = new Date(filters.end_date);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (emailDate > endDate) return false;
        }
      }

      // Attachments filter
      if (filters?.has_attachments !== undefined) {
        const hasAttachments = email.attachments && email.attachments.length > 0;
        if (filters.has_attachments && !hasAttachments) return false;
        if (!filters.has_attachments && hasAttachments) return false;
      }

      // URLs filter
      if (filters?.has_urls !== undefined) {
        const hasUrls = email.extracted_urls && email.extracted_urls.length > 0;
        if (filters.has_urls && !hasUrls) return false;
        if (!filters.has_urls && hasUrls) return false;
      }

      return true;
    });
  }, [emails, filters, searchTerm]);

  // Paginate filtered emails
  const paginatedEmails = useMemo(() => {
    if (!Array.isArray(filteredEmails)) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEmails.slice(startIndex, endIndex);
  }, [filteredEmails, currentPage, pageSize]);

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);

  const refetch = async () => {
    try {
      setLoading(true);
      // Build query parameters for pagination and filters
      const params = new URLSearchParams();
      params.append('limit', pageSize.toString());
      params.append('offset', ((currentPage - 1) * pageSize).toString());

      // Add filters if they exist - map to API parameter names
      if (filters) {
        if (filters.sender) params.append('sender', filters.sender);
        if (filters.sender_domain) params.append('sender_domain', filters.sender_domain);
        if (filters.subject) params.append('subject', filters.subject);
        if (filters.threat_level) params.append('threat_level', filters.threat_level);
        if (filters.cti_confidence) params.append('cti_confidence', filters.cti_confidence);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.has_attachments !== undefined) params.append('has_attachments', filters.has_attachments.toString());
        if (filters.has_urls !== undefined) params.append('has_urls', filters.has_urls.toString());
      }

      // Add search term if it exists
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const queryString = params.toString();
      const endpoint = `/emails/all${queryString ? `?${queryString}` : ''}`;

      const response = await dataFetch<EmailsApiResponse>(endpoint, 'GET');
      setEmailsData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && !emails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading emails...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !emails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to load emails</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
      await dataFetch(`/emails/${emailId}`, 'DELETE');
      await refetch();
    } catch (error) {
      console.error("Failed to delete email:", error);
      alert("Unable to delete the email. Please try again.");
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search
  const handleSearch = (term: string, options?: any) => {
    setSearchTerm(term);
    if (options) {
      // Apply additional search options as filters
      const searchFilters = { ...filters };
      if (options.threatLevel) searchFilters.threat_level = options.threatLevel;
      if (options.confidence) searchFilters.cti_confidence = options.confidence;
      if (options.dateRange) {
        searchFilters.start_date = options.dateRange.start;
        searchFilters.end_date = options.dateRange.end;
      }
      setFilters(searchFilters);
    }
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      await dataFetch('/emails/bulk-delete', 'DELETE', { ids: emailIds });
      await refetch();
    } catch (error) {
      console.error("Failed to delete emails:", error);
      alert("Unable to delete the selected emails. Please try again.");
    }
  };

  const getEmailStats = () => {
    // Always show stats for all emails (not filtered)
    if (!emailsData) {
      return { total: 0, malicious: 0, suspicious: 0, clean: 0 };
    }

    const allEmails = emailsData.emails || [];

    console.log("Calculating overall stats from all emails:", {
      totalEmails: allEmails.length,
      sampleRisks: allEmails.slice(0, 5).map((e: Email) => ({
        risk: e.threat_summary?.overall_risk,
        mapped: mapRiskLevel(e.threat_summary?.overall_risk || "clean")
      })),
    });

    const stats = {
      total: emailsData.pagination?.total || allEmails.length,
      malicious: allEmails.filter((e: Email) => {
        const risk = mapRiskLevel(e.threat_summary?.overall_risk || "clean");
        return risk === "malicious";
      }).length,
      suspicious: allEmails.filter((e: Email) => {
        const risk = mapRiskLevel(e.threat_summary?.overall_risk || "clean");
        return risk === "suspicious";
      }).length,
      clean: allEmails.filter((e: Email) => {
        const risk = mapRiskLevel(e.threat_summary?.overall_risk || "clean");
        return risk === "clean";
      }).length,
    };

    console.log("Overall stats:", stats);
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
          <p className="text-gray-400">{error}</p>
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
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        currentFilters={filters}
        totalCount={emails?.length || 0}
        filteredCount={filteredEmails?.length || 0}
        loading={loading}
      />

      <EmailList
        emails={paginatedEmails}
        onEmailView={handleEmailView}
        onEmailDelete={handleEmailDelete}
        onBulkDelete={handleBulkDelete}
      />

      {/* Pagination */}
      {filteredEmails && filteredEmails.length > pageSize && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredEmails.length)} of {filteredEmails.length} emails
            {filteredEmails.length !== emails.length && ` (filtered from ${emails.length} total)`}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            <span className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              {currentPage}
            </span>
            <button
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * pageSize >= filteredEmails.length || loading}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
