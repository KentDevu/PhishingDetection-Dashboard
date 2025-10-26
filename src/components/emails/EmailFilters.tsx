// Email Filters Component - Advanced filtering and search for emails

import { useState } from "react";
import {
  Search,
  Filter,
  X,
} from "lucide-react";
import type { ThreatLevel, AuthResult } from "../../models/email";

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

interface EmailFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export function EmailFilters({
  onFiltersChange,
  totalCount,
  filteredCount,
}: EmailFiltersProps) {
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

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleArrayFilter = <T,>(key: keyof FilterState, value: T) => {
    const currentArray = filters[key] as T[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    updateFilters({ [key]: newArray });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
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
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== "" ||
      filters.threatLevel.length > 0 ||
      filters.spfResult.length > 0 ||
      filters.dkimResult.length > 0 ||
      filters.dmarcResult.length > 0 ||
      filters.sender !== "" ||
      filters.recipient !== "" ||
      filters.domain !== "" ||
      filters.dateRange !== "all" ||
      filters.scoreRange[0] !== 0 ||
      filters.scoreRange[1] !== 100 ||
      filters.hasAttachments !== "all" ||
      filters.hasUrls !== "all"
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search emails by sender, subject, or content..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
            />
            {filters.search && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() => updateFilters({ search: "" })}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            <span className="text-white font-medium">{filteredCount}</span>
            <span className="mx-1">of</span>
            <span className="text-white font-medium">{totalCount}</span>
            <span className="ml-1">emails</span>
          </div>

          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showAdvanced
                ? 'bg-cyan-900/50 border-cyan-400 text-cyan-400'
                : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
            }`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters() && <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>}
          </button>

          {hasActiveFilters() && (
            <button
              className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-700 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
              onClick={clearFilters}
            >
              <X size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="border-t border-gray-700 pt-4">
          <div className="text-center text-gray-400 py-8">
            Advanced filters coming soon...
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="border-t border-gray-700 pt-4">
          <span className="text-sm text-gray-400 mr-3">Active filters:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.threatLevel.map((threat) => (
              <span key={`threat-${threat}`} className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/20 border border-cyan-700 text-cyan-400 text-xs font-medium rounded-full">
                {threat}
                <button
                  onClick={() => toggleArrayFilter("threatLevel", threat)}
                  className="ml-1 hover:bg-cyan-800/50 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {filters.dateRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/20 border border-cyan-700 text-cyan-400 text-xs font-medium rounded-full">
                {filters.dateRange}
                <button
                  onClick={() => updateFilters({ dateRange: "all" })}
                  className="ml-1 hover:bg-cyan-800/50 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.sender && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/20 border border-cyan-700 text-cyan-400 text-xs font-medium rounded-full">
                sender: {filters.sender}
                <button
                  onClick={() => updateFilters({ sender: "" })}
                  className="ml-1 hover:bg-cyan-800/50 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.recipient && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/20 border border-cyan-700 text-cyan-400 text-xs font-medium rounded-full">
                recipient: {filters.recipient}
                <button
                  onClick={() => updateFilters({ recipient: "" })}
                  className="ml-1 hover:bg-cyan-800/50 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


