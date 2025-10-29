// Email Intelligence Table Component

import { useState, useMemo, useEffect } from "react";
import {
  Shield,
  Search,
  ExternalLink,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Mail,
  User,
  Clock,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ArchiveX,
  Ban,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { EmailIntelligence } from "../../models/analytics";
import dataFetch from "@/services/apiService";

interface EmailIntelligenceTableProps {
  data?: EmailIntelligence[] | null;
  loading?: boolean;
}

type SortField = "email" | "reputation_score" | "threat_level" | "last_seen" | "is_blocked";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

function parseEmailAddress(emailString: string): { name: string; email: string } {
  // Handle format like "Kent Harold Belen" <202211399@gordoncollege.edu.ph>
  const match = emailString.match(/^"([^"]+)"\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1], email: match[2] };
  }
  // Handle format like <email@domain.com>
  const angleMatch = emailString.match(/^<([^>]+)>$/);
  if (angleMatch) {
    return { name: '', email: angleMatch[1] };
  }
  // Return as-is if no special formatting
  return { name: '', email: emailString };
}

function extractDomain(email: string): string {
  const emailPart = parseEmailAddress(email).email;
  const atIndex = emailPart.indexOf('@');
  return atIndex !== -1 ? emailPart.substring(atIndex + 1) : emailPart;
}

export function EmailIntelligenceTable({
  data: initialData,
  loading: initialLoading,
}: EmailIntelligenceTableProps) {
  const [data, setData] = useState<EmailIntelligence[]>(initialData || []);
  const [loading, setLoading] = useState(initialLoading || false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>("all");
  const [selectedBlockedStatus, setSelectedBlockedStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("threat_level");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [blockingEmails, setBlockingEmails] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const threatLevels = [
    { value: "all", label: "All Levels", color: "#6B7280" },
    { value: "malicious", label: "Malicious", color: "#DC2626" },
    { value: "suspicious", label: "Suspicious", color: "#F59E0B" },
    { value: "clean", label: "Clean", color: "#22C55E" },
  ];

  const blockedStatuses = [
    { value: "all", label: "All Status", color: "#6B7280" },
    { value: "blocked", label: "Blocked", color: "#DC2626" },
    { value: "non-blocked", label: "Not Blocked", color: "#22C55E" },
  ];

  // Fetch intelligence data on component mount
  useEffect(() => {
    const fetchIntelligenceData = async () => {
      try {
        setLoading(true);
        const response = await dataFetch<{ intelligence: EmailIntelligence[] }>(
          '/emails/intelligence',
          'GET'
        );
        setData(response.intelligence || []);
      } catch (error) {
        console.error('Failed to fetch email intelligence:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (!initialData) {
      fetchIntelligenceData();
    } else {
      setData(initialData);
    }
  }, [initialData]);

  // Toggle expanded row
  const toggleExpandedRow = (email: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(email)) {
      newExpandedRows.delete(email);
    } else {
      newExpandedRows.add(email);
    }
    setExpandedRows(newExpandedRows);
  };

  // Block/unblock sender functions
  const handleBlockSender = async (email: string) => {
    if (blockingEmails.has(email)) return;

    setBlockingEmails(prev => new Set(prev).add(email));
    try {
      // Extract the actual email address from formatted strings like "Name <email@domain.com>"
      const actualEmail = parseEmailAddress(email).email;
      await dataFetch('/emails/block', 'POST', {
        sender_email: actualEmail,
        reason: 'Manual block from dashboard',
        blocked_by: 'admin'
      });

      // Update local state
      setData(prevData =>
        prevData.map(item =>
          item.email === email ? { ...item, is_blocked: true } : item
        )
      );
    } catch (error) {
      console.error('Failed to block sender:', error);
    } finally {
      setBlockingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const handleUnblockSender = async (email: string) => {
    if (blockingEmails.has(email)) return;

    setBlockingEmails(prev => new Set(prev).add(email));
    try {
      // Extract the actual email address from formatted strings like "Name <email@domain.com>"
      const actualEmail = parseEmailAddress(email).email;
      await dataFetch(`/emails/blocked/${encodeURIComponent(actualEmail)}`, 'DELETE');

      // Update local state
      setData(prevData =>
        prevData.map(item =>
          item.email === email ? { ...item, is_blocked: false } : item
        )
      );
    } catch (error) {
      console.error('Failed to unblock sender:', error);
    } finally {
      setBlockingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const toggleRowExpansion = (email: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
      }
      return newSet;
    });
  };
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (email.sender_name && email.sender_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          email.categories.some((category) =>
            category.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply threat level filter
    if (selectedThreatLevel !== "all") {
      filtered = filtered.filter(
        (email) => email.threat_level === selectedThreatLevel
      );
    }

    // Apply blocked status filter
    if (selectedBlockedStatus !== "all") {
      const isBlocked = selectedBlockedStatus === "blocked";
      filtered = filtered.filter(
        (email) => email.is_blocked === isBlocked
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | boolean;
      let bValue: string | number | boolean;

      switch (sortField) {
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "reputation_score":
          aValue = a.reputation_score;
          bValue = b.reputation_score;
          break;
        case "threat_level":
          // Custom sorting: malicious -> suspicious -> clean
          const threatOrder = { malicious: 3, suspicious: 2, clean: 1 };
          aValue = threatOrder[a.threat_level as keyof typeof threatOrder] || 0;
          bValue = threatOrder[b.threat_level as keyof typeof threatOrder] || 0;
          break;
        case "last_seen":
          aValue = new Date(a.last_seen).getTime();
          bValue = new Date(b.last_seen).getTime();
          break;
        case "is_blocked":
          aValue = a.is_blocked;
          bValue = b.is_blocked;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, selectedThreatLevel, selectedBlockedStatus, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedThreatLevel]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };


  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-800 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading email intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Mail size={48} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-white">No Email Data</h3>
          <p className="text-gray-400">No email intelligence data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Email Intelligence</h2>
          <p className="text-sm text-gray-400">Reputation analysis for {data.length} email addresses</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
            />
          </div>

          {/* Threat Level Filter */}
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedThreatLevel}
              onChange={(e) => setSelectedThreatLevel(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-gray-800 text-white"
            >
              {threatLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Blocked Status Filter */}
          <div className="relative">
            <Shield size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedBlockedStatus}
              onChange={(e) => setSelectedBlockedStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-gray-800 text-white"
            >
              {blockedStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Emails</div>
          <div className="text-2xl font-bold text-white">{filteredAndSortedData.length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">High Risk</div>
          <div className="text-2xl font-bold text-red-400">
            {
              filteredAndSortedData.filter(
                (email) => email.threat_level === "malicious"
              ).length
            }
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Clean</div>
          <div className="text-2xl font-bold text-green-400">
            {
              filteredAndSortedData.filter((email) => email.threat_level === "clean")
                .length
            }
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-700 rounded-lg overflow-hidden w-full shadow-xl bg-gray-900/50 backdrop-blur-sm">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <table className="w-full min-w-[900px] max-w-none">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-800/90 border-b border-gray-700/50">
              <tr className="divide-x divide-gray-700/30">
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${
                    sortField === "email" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-1">
                    <span className="hidden sm:inline">Email Address</span>
                    <span className="sm:hidden">Email</span>
                    {sortField === "email" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Sender Name
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${
                    sortField === "threat_level" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => handleSort("threat_level")}
                >
                  <div className="flex items-center gap-1">
                    <Shield size={14} className="text-red-400" />
                    <span className="hidden sm:inline">Threat Level</span>
                    <span className="sm:hidden">Threat</span>
                    {sortField === "threat_level" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-150 hidden md:table-cell ${
                    sortField === "reputation_score" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => handleSort("reputation_score")}
                >
                  <div className="flex items-center gap-1">
                    Reputation
                    {sortField === "reputation_score" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Domain
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${
                    sortField === "is_blocked" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => handleSort("is_blocked")}
                >
                  <div className="flex items-center gap-1">
                    <Ban size={14} className="text-red-400" />
                    <span className="hidden sm:inline">Blocked</span>
                    <span className="sm:hidden">Block</span>
                    {sortField === "is_blocked" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/30 divide-y divide-gray-700/30">
              {paginatedData.flatMap((email, index) => {
                const mainRow = (
                  <tr key={index} className="hover:bg-gray-800/70 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleExpandedRow(email.email)}
                          className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700/50 rounded-md transition-all duration-200 group"
                          title={expandedRows.has(email.email) ? "Collapse details" : "Expand details"}
                        >
                          <ChevronRight
                            size={16}
                            className={`transform transition-transform duration-200 ${
                              expandedRows.has(email.email) ? 'rotate-90 text-green-400' : 'group-hover:translate-x-0.5'
                            }`}
                          />
                        </button>
                        <Mail size={16} className="text-gray-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-none">
                            {parseEmailAddress(email.email).email}
                          </div>
                          {(email.sender_name || parseEmailAddress(email.email).name) && (
                            <div className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-none">
                              {email.sender_name || parseEmailAddress(email.email).name}
                            </div>
                          )}
                          {expandedRows.has(email.email) && (
                            <div className="text-xs text-gray-500 mt-1">
                              Click to collapse
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-300 truncate max-w-[180px] block" title={email.sender_name || 'N/A'}>
                        {email.sender_name || 'N/A'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {email.threat_level === 'malicious' && (
                          <Shield size={16} className="text-red-500 shrink-0" />
                        )}
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            email.threat_level === 'malicious'
                              ? 'bg-red-900/30 text-red-300 border-red-500/50'
                              : email.threat_level === 'suspicious'
                              ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50'
                              : 'bg-green-900/30 text-green-300 border-green-500/50'
                          }`}
                        >
                          {email.threat_level.charAt(0).toUpperCase() + email.threat_level.slice(1)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white min-w-8">
                          {email.reputation_score}
                        </span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              email.reputation_score >= 80 ? 'bg-green-500' :
                              email.reputation_score >= 60 ? 'bg-yellow-500' :
                              email.reputation_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${email.reputation_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-white truncate max-w-[280px] block" title={email.domain.replace(/>+$/, '')}>
                        {email.domain.replace(/>+$/, '')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {email.is_blocked ? (
                          <CheckCircle size={16} className="text-red-500 shrink-0" />
                        ) : (
                          <div className="w-4 h-4"></div>
                        )}
                        <span className={`text-sm font-medium ${
                          email.is_blocked ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {email.is_blocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {email.is_blocked ? (
                          <button
                            onClick={() => handleUnblockSender(email.email)}
                            disabled={blockingEmails.has(email.email)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Unblock sender"
                          >
                            {blockingEmails.has(email.email) ? (
                              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockSender(email.email)}
                            disabled={blockingEmails.has(email.email)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Block sender"
                          >
                            {blockingEmails.has(email.email) ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Ban size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );

                const expandedRow = expandedRows.has(email.email) ? (
                  <tr key={`${index}-expanded`} className="bg-gray-800/50 border-t border-gray-700">
                    <td colSpan={8} className="px-6 py-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Domain Information */}

                        {/* Threat Reasons */}
                        {email.threat_reasons && email.threat_reasons.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                              <AlertTriangle size={16} />
                              Threat Reasons
                            </h4>
                            <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4">
                              <ul className="space-y-2">
                                {email.threat_reasons.map((reason: string, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-red-500 mt-1.5 shrink-0">•</span>
                                    <span className="leading-relaxed">{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Malicious Engines */}
                        {Array.isArray(email.malicious_engines) && email.malicious_engines.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                              <Shield size={16} />
                              Malicious Engines
                              <span className="text-xs text-gray-400 font-normal">
                                ({email.malicious_engines.length}/{email.total_engines})
                              </span>
                            </h4>
                            <div className="bg-orange-900/10 border border-orange-500/20 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {email.malicious_engines.map((engine: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-900/30 text-red-300 border border-red-500/30"
                                  >
                                    {engine}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Categories */}
                        {email.categories && email.categories.length > 0 && (
                          <div className="space-y-3 lg:col-span-2">
                            <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                              <Shield size={16} />
                              Categories
                            </h4>
                            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {email.categories.map((category, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-500/30"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Info */}
                        <div className="space-y-3 lg:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-400">Additional Information</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Total Emails</div>
                              <div className="text-lg font-semibold text-white">{email.email_count}</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">First Seen</div>
                              <div className="text-sm text-gray-300">{format(parseISO(email.first_seen), "MMM dd, yyyy")}</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Last Seen</div>
                              <div className="text-sm text-gray-300">{format(parseISO(email.last_seen), "MMM dd, yyyy")}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null;

                return [mainRow, expandedRow].filter(Boolean);
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedData.length)} of {filteredAndSortedData.length} emails
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12">
          <Search size={32} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No emails match your current filters</p>
        </div>
      )}
    </div>
  );
}