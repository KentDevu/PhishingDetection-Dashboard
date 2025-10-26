// Domain Intelligence Table Component

import { useState, useMemo } from "react";
import {
  Shield,
  Search,
  ExternalLink,
  Filter,
  ChevronUp,
  ChevronDown,
  Globe,
  MapPin,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DomainIntelligence } from "../../models/analytics";

interface DomainIntelligenceTableProps {
  data: DomainIntelligence[] | null;
  loading?: boolean;
}

type SortField = "domain" | "reputation_score" | "email_count" | "last_seen";
type SortDirection = "asc" | "desc";

export function DomainIntelligenceTable({
  data,
  loading,
}: DomainIntelligenceTableProps) {
  console.log("DomainIntelligenceTable: data received", data);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("reputation_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const threatLevels = [
    { value: "all", label: "All Levels", color: "#6B7280" },
    { value: "malicious", label: "Malicious", color: "#DC2626" },
    { value: "suspicious", label: "Suspicious", color: "#F59E0B" },
    { value: "clean", label: "Clean", color: "#22C55E" },
  ];

  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (domain) =>
          domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
          domain.categories.some((category) =>
            category.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply threat level filter
    if (selectedThreatLevel !== "all") {
      filtered = filtered.filter(
        (domain) => domain.threat_level === selectedThreatLevel
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "domain":
          aValue = a.domain.toLowerCase();
          bValue = b.domain.toLowerCase();
          break;
        case "reputation_score":
          aValue = a.reputation_score;
          bValue = b.reputation_score;
          break;
        case "email_count":
          aValue = a.email_count;
          bValue = b.email_count;
          break;
        case "last_seen":
          aValue = new Date(a.last_seen).getTime();
          bValue = new Date(b.last_seen).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, selectedThreatLevel, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getThreatLevelColor = (level: string) => {
    const levelConfig = threatLevels.find((t) => t.value === level);
    return levelConfig?.color || "#6B7280";
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-800 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading domain intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Globe size={48} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-white">No Domain Data</h3>
          <p className="text-gray-400">No domain intelligence data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Domain Intelligence</h2>
          <p className="text-sm text-gray-400">Reputation analysis for {data.length} domains</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search domains..."
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
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Domains</div>
          <div className="text-2xl font-bold text-white">{filteredAndSortedData.length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">High Risk</div>
          <div className="text-2xl font-bold text-red-400">
            {
              filteredAndSortedData.filter(
                (d) => d.threat_level === "malicious"
              ).length
            }
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Clean</div>
          <div className="text-2xl font-bold text-green-400">
            {
              filteredAndSortedData.filter((d) => d.threat_level === "clean")
                .length
            }
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 ${
                    sortField === "domain" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => handleSort("domain")}
                >
                  <div className="flex items-center gap-1">
                    Domain
                    {sortField === "domain" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Threat Level
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 ${
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
                <th
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${
                    sortField === "email_count" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSort("email_count")}
                >
                  <div className="flex items-center gap-1">
                    Email Count
                    {sortField === "email_count" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Detection Engines
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 ${
                    sortField === "last_seen" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => handleSort("last_seen")}
                >
                  <div className="flex items-center gap-1">
                    Last Seen
                    {sortField === "last_seen" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredAndSortedData.map((domain, index) => {
                console.log("DomainIntelligenceTable: rendering domain", domain);
                return (
                  <tr key={index} className="hover:bg-gray-800/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-white">{domain.domain}</div>
                          {domain.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {domain.categories
                                .slice(0, 2)
                                .map((category, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-900/50 text-cyan-300 border border-cyan-700">
                                    {category}
                                  </span>
                                ))}
                              {domain.categories.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{domain.categories.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${getThreatLevelColor(domain.threat_level)}20`,
                          color: getThreatLevelColor(domain.threat_level),
                          borderColor: `${getThreatLevelColor(domain.threat_level)}40`,
                        }}
                      >
                        {domain.threat_level.charAt(0).toUpperCase() +
                          domain.threat_level.slice(1)}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {domain.reputation_score}
                        </span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              domain.reputation_score >= 80 ? 'bg-green-500' :
                              domain.reputation_score >= 60 ? 'bg-yellow-500' :
                              domain.reputation_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${domain.reputation_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      {domain.email_count.toLocaleString()}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      <span className="text-red-600 font-medium">{domain.malicious_engines.length}</span>
                      <span className="text-gray-500"> / {domain.total_engines}</span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Clock size={14} className="text-gray-400" />
                        {format(parseISO(domain.last_seen), "MMM dd, yyyy")}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="View Details">
                          <Shield size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="External Analysis">
                          <ExternalLink size={14} />
                        </button>
                        {domain.geographic_distribution.length > 0 && (
                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Geographic Data">
                            <MapPin size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12">
          <Search size={32} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No domains match your current filters</p>
        </div>
      )}
    </div>
  );
}
