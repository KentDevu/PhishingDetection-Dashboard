// Enhanced Email Filters Component - Leverages API filtering capabilities

import { useState, useCallback } from "react";
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Mail,
  Shield,
  AlertTriangle,
  Paperclip,
  RefreshCw,
} from "lucide-react";
import type { EmailFilterParams } from "../../types/email";
import type { ThreatLevel, ConfidenceLevel } from "../../models/email";

interface EnhancedEmailFiltersProps {
  onFiltersChange: (filters: EmailFilterParams) => void;
  onSearch: (
    searchTerm: string,
    options?: {
      threatLevel?: ThreatLevel;
      confidence?: ConfidenceLevel;
      dateRange?: { start: string; end: string };
    }
  ) => void;
  onClearFilters: () => void;
  currentFilters: EmailFilterParams | null;
  totalCount: number;
  filteredCount: number;
  loading?: boolean;
}

export function EnhancedEmailFilters({
  onFiltersChange,
  onSearch,
  onClearFilters,
  currentFilters,
  totalCount,
  filteredCount,
  loading = false,
}: EnhancedEmailFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<EmailFilterParams>({});

  const threatLevelOptions: {
    value: ThreatLevel;
    label: string;
    color: string;
  }[] = [
    { value: "malicious", label: "Malicious", color: "#FF6B35" },
    { value: "suspicious", label: "Suspicious", color: "var(--color-warning)" },
    { value: "clean", label: "Clean", color: "var(--color-success)" },
  ];

  const confidenceLevelOptions: { value: ConfidenceLevel; label: string }[] = [
    { value: "high", label: "High Confidence" },
    { value: "medium", label: "Medium Confidence" },
    { value: "low", label: "Low Confidence" },
  ];

  const dateRangeOptions = [
    { value: "today", label: "Today", days: 0 },
    { value: "3d", label: "Last 3 Days", days: 3 },
    { value: "7d", label: "Last Week", days: 7 },
    { value: "30d", label: "Last Month", days: 30 },
    { value: "90d", label: "Last 3 Months", days: 90 },
  ];

  const handleQuickSearch = useCallback(() => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim(), {
        threatLevel: localFilters.threat_level as ThreatLevel,
        confidence: localFilters.cti_confidence,
        dateRange:
          localFilters.start_date && localFilters.end_date
            ? {
                start: localFilters.start_date,
                end: localFilters.end_date,
              }
            : undefined,
      });
    }
  }, [searchTerm, localFilters, onSearch]);

  const handleAdvancedFilter = useCallback(() => {
    onFiltersChange(localFilters);
  }, [localFilters, onFiltersChange]);

  const updateLocalFilter = useCallback(
    (key: keyof EmailFilterParams, value: any) => {
      setLocalFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleDateRangeChange = useCallback((range: string) => {
    if (range === "custom") {
      // Keep existing custom dates
      return;
    }

    const option = dateRangeOptions.find((opt) => opt.value === range);
    if (option) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - option.days);

      setLocalFilters((prev) => ({
        ...prev,
        start_date:
          option.days === 0
            ? endDate.toISOString().split("T")[0]
            : startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      }));
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setLocalFilters({});
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters =
    Object.keys(currentFilters || {}).length > 0 || searchTerm;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
      {/* Quick Search Bar */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search emails by sender or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                disabled={loading}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            onClick={handleQuickSearch}
            disabled={!searchTerm.trim() || loading}
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Search
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showAdvanced
                ? 'bg-cyan-900/50 border-cyan-400 text-cyan-400'
                : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
            }`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={16} />
            Advanced Filters
          </button>

          {hasActiveFilters && (
            <button
              className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-700 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
              onClick={clearAllFilters}
            >
              <X size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="border-t border-gray-700 pt-4">
        <div className="text-sm text-gray-400">
          <span className="text-white font-medium">{filteredCount.toLocaleString()}</span>
          <span className="mx-1">of</span>
          <span className="text-white font-medium">{totalCount.toLocaleString()}</span>
          <span className="ml-1">emails</span>
          {hasActiveFilters && !loading && (
            <span className="ml-3 inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/20 border border-cyan-700 text-cyan-400 text-xs font-medium rounded-full">
              <Filter size={10} />
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sender/Domain Filters */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-white">Sender & Domain</span>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Sender email"
                  value={localFilters.sender || ""}
                  onChange={(e) => updateLocalFilter("sender", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  placeholder="Domain (e.g., gmail.com)"
                  value={localFilters.sender_domain || ""}
                  onChange={(e) =>
                    updateLocalFilter("sender_domain", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-yellow-400" />
                <span className="text-sm font-medium text-white">Subject</span>
              </div>
              <input
                type="text"
                placeholder="Email subject keywords"
                value={localFilters.subject || ""}
                onChange={(e) => updateLocalFilter("subject", e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Threat Level Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-green-400" />
                <span className="text-sm font-medium text-white">Threat Level</span>
              </div>
              <select
                value={localFilters.threat_level || ""}
                onChange={(e) =>
                  updateLocalFilter("threat_level", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="">All Threat Levels</option>
                {threatLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Confidence Level Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">CTI Confidence</span>
              </div>
              <select
                value={localFilters.cti_confidence || ""}
                onChange={(e) =>
                  updateLocalFilter("cti_confidence", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="">All Confidence Levels</option>
                {confidenceLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phishing Score Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-red-400" />
                <span className="text-sm font-medium text-white">Phishing Score Range</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min score"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localFilters.score_min || ""}
                  onChange={(e) =>
                    updateLocalFilter("score_min", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                  title="Minimum phishing score (0.0 - 1.0)"
                />
                <span className="flex items-center text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="Max score"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localFilters.score_max || ""}
                  onChange={(e) =>
                    updateLocalFilter("score_max", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                  title="Maximum phishing score (0.0 - 1.0)"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-white">Date Range</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={localFilters.start_date || ""}
                    onChange={(e) =>
                      updateLocalFilter("start_date", e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    title="Start date"
                  />
                  <span className="flex items-center text-gray-400">to</span>
                  <input
                    type="date"
                    value={localFilters.end_date || ""}
                    onChange={(e) =>
                      updateLocalFilter("end_date", e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    title="End date"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs rounded transition-colors"
                      onClick={() => handleDateRangeChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attachment Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip size={16} className="text-orange-400" />
                <span className="text-sm font-medium text-white">Attachments</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="attachments"
                    checked={localFilters.has_attachments === undefined}
                    onChange={() =>
                      updateLocalFilter("has_attachments", undefined)
                    }
                    className="w-4 h-4 text-cyan-400 bg-gray-900 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">All emails</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="attachments"
                    checked={localFilters.has_attachments === true}
                    onChange={() => updateLocalFilter("has_attachments", true)}
                    className="w-4 h-4 text-cyan-400 bg-gray-900 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">With attachments</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="attachments"
                    checked={localFilters.has_attachments === false}
                    onChange={() => updateLocalFilter("has_attachments", false)}
                    className="w-4 h-4 text-cyan-400 bg-gray-900 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">Without attachments</span>
                </label>
              </div>
            </div>

            {/* URLs Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-white">URLs</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="urls"
                    checked={localFilters.has_urls === undefined}
                    onChange={() =>
                      updateLocalFilter("has_urls", undefined)
                    }
                    className="w-4 h-4 text-cyan-400 bg-gray-900 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">All emails</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="urls"
                    checked={localFilters.has_urls === true}
                    onChange={() => updateLocalFilter("has_urls", true)}
                    className="w-4 h-4 text-cyan-400 bg-gray-900 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">With URLs</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="urls"
                    checked={localFilters.has_urls === false}
                    onChange={() => updateLocalFilter("has_urls", false)}
                    className="w-4 h-4 text-cyan-400 bg-gray-900 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">Without URLs</span>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Filter Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              onClick={handleAdvancedFilter}
              disabled={loading}
            >
              <Filter size={16} />
              Apply Filters
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white rounded-lg transition-colors"
              onClick={() => setLocalFilters({})}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}