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
import type { EmailFilterParams } from "../../services/emailService";
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
    { value: "critical", label: "Critical", color: "var(--color-danger)" },
    { value: "malicious", label: "Malicious", color: "#FF6B35" },
    { value: "high", label: "High", color: "#FF8C42" },
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
    <div className="enhanced-email-filters">
      {/* Quick Search Bar */}
      <div className="filter-section filter-section--search">
        <div className="search-input-group">
          <div className="search-input-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search emails by sender or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
              className="search-input"
              disabled={loading}
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className="btn btn--primary"
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

        <div className="filter-actions">
          <button
            className={`btn btn--outline ${showAdvanced ? "btn--active" : ""}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={16} />
            Advanced Filters
          </button>

          {hasActiveFilters && (
            <button
              className="btn btn--outline btn--danger"
              onClick={clearAllFilters}
            >
              <X size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="filter-results-summary">
        <div className="results-info">
          <span className="results-count">
            {loading ? (
              "Loading..."
            ) : (
              <>
                Showing <strong>{filteredCount.toLocaleString()}</strong> of{" "}
                <strong>{totalCount.toLocaleString()}</strong> emails
              </>
            )}
          </span>
          {hasActiveFilters && !loading && (
            <span className="filter-indicator">
              <Filter size={12} />
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="filter-section filter-section--advanced">
          <div className="advanced-filters-grid">
            {/* Sender/Domain Filters */}
            <div className="filter-group">
              <label className="filter-label">
                <Mail size={16} />
                Sender & Domain
              </label>
              <div className="filter-inputs">
                <input
                  type="text"
                  placeholder="Sender email"
                  value={localFilters.sender || ""}
                  onChange={(e) => updateLocalFilter("sender", e.target.value)}
                  className="filter-input"
                />
                <input
                  type="text"
                  placeholder="Domain (e.g., gmail.com)"
                  value={localFilters.sender_domain || ""}
                  onChange={(e) =>
                    updateLocalFilter("sender_domain", e.target.value)
                  }
                  className="filter-input"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <AlertTriangle size={16} />
                Subject
              </label>
              <input
                type="text"
                placeholder="Email subject keywords"
                value={localFilters.subject || ""}
                onChange={(e) => updateLocalFilter("subject", e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Threat Level Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <Shield size={16} />
                Threat Level
              </label>
              <select
                value={localFilters.threat_level || ""}
                onChange={(e) =>
                  updateLocalFilter("threat_level", e.target.value)
                }
                className="filter-select"
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
            <div className="filter-group">
              <label className="filter-label">
                <User size={16} />
                CTI Confidence
              </label>
              <select
                value={localFilters.cti_confidence || ""}
                onChange={(e) =>
                  updateLocalFilter("cti_confidence", e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Confidence Levels</option>
                {confidenceLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <Calendar size={16} />
                Date Range
              </label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={localFilters.start_date || ""}
                  onChange={(e) =>
                    updateLocalFilter("start_date", e.target.value)
                  }
                  className="filter-input filter-input--date"
                  title="Start date"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={localFilters.end_date || ""}
                  onChange={(e) =>
                    updateLocalFilter("end_date", e.target.value)
                  }
                  className="filter-input filter-input--date"
                  title="End date"
                />
              </div>
              <div className="date-presets">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    className="date-preset-btn"
                    onClick={() => handleDateRangeChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Attachment Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <Paperclip size={16} />
                Attachments
              </label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attachments"
                    checked={localFilters.has_attachments === undefined}
                    onChange={() =>
                      updateLocalFilter("has_attachments", undefined)
                    }
                  />
                  All emails
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attachments"
                    checked={localFilters.has_attachments === true}
                    onChange={() => updateLocalFilter("has_attachments", true)}
                  />
                  With attachments
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attachments"
                    checked={localFilters.has_attachments === false}
                    onChange={() => updateLocalFilter("has_attachments", false)}
                  />
                  Without attachments
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Filter Actions */}
          <div className="advanced-filter-actions">
            <button
              className="btn btn--primary"
              onClick={handleAdvancedFilter}
              disabled={loading}
            >
              <Filter size={16} />
              Apply Filters
            </button>
            <button
              className="btn btn--outline"
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

// Enhanced Email Filters Styles
const styles = `
.enhanced-email-filters {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

/* Search Section */
.filter-section--search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.search-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.search-input-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 3rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

.search-icon {
  position: absolute;
  left: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.clear-search-btn {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.clear-search-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Results Summary */
.filter-results-summary {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: var(--spacing-lg);
}

.results-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.results-count {
  color: var(--text-secondary);
}

.filter-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px 6px;
  background: var(--bg-accent);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* Advanced Filters */
.filter-section--advanced {
  border-top: 1px solid var(--border-primary);
  padding-top: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.advanced-filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.filter-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-input {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.filter-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

.filter-input--date {
  max-width: 150px;
}

.filter-select {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

/* Date Range */
.date-range-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.date-separator {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.date-presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.date-preset-btn {
  padding: 2px 6px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  background: var(--bg-primary);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.date-preset-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Radio Group */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.radio-option input[type="radio"] {
  margin: 0;
}

/* Actions */
.advanced-filter-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--bg-primary);
  border-color: var(--color-primary);
}

.btn--primary:hover:not(:disabled) {
  background: #00CC80;
  border-color: #00CC80;
  transform: translateY(-1px);
}

.btn--outline {
  background: transparent;
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.btn--outline:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn--active {
  background: var(--bg-accent);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn--danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn--danger:hover:not(:disabled) {
  background: rgba(237, 51, 51, 0.1);
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-section--search {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .search-input-group {
    flex-direction: column;
  }

  .filter-actions {
    justify-content: center;
  }

  .advanced-filters-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .advanced-filter-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range-inputs {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("enhanced-email-filters-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "enhanced-email-filters-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
