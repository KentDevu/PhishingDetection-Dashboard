// Email Filters Component - Advanced filtering and search for emails

import { useState } from "react";
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Mail,
  Shield,
  AlertTriangle,
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

  const threatLevelOptions: ThreatLevel[] = [
    "critical",
    "malicious",
    "high",
    "suspicious",
    "clean",
  ];
  const authResultOptions: AuthResult[] = [
    "pass",
    "fail",
    "neutral",
    "softfail",
    "none",
  ];

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

  const getThreatColor = (threat: ThreatLevel) => {
    switch (threat) {
      case "critical":
        return "var(--color-danger)";
      case "malicious":
        return "var(--color-danger)";
      case "high":
        return "#FF6B35";
      case "suspicious":
        return "var(--color-warning)";
      case "clean":
        return "var(--color-success)";
    }
  };

  const getAuthColor = (result: AuthResult) => {
    return result === "pass" ? "var(--color-success)" : "var(--color-danger)";
  };

  return (
    <div className="email-filters">
      <div className="email-filters__header">
        <div className="email-filters__search">
          <div className="search-input-wrapper">
            <Search className="search-input__icon" size={18} />
            <input
              type="text"
              placeholder="Search emails by sender, subject, or content..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="search-input__field"
            />
            {filters.search && (
              <button
                className="search-input__clear"
                onClick={() => updateFilters({ search: "" })}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="email-filters__actions">
          <div className="email-count">
            <span className="email-count__filtered">{filteredCount}</span>
            <span className="email-count__separator">of</span>
            <span className="email-count__total">{totalCount}</span>
            <span className="email-count__label">emails</span>
          </div>

          <button
            className={`filter-toggle ${
              showAdvanced ? "filter-toggle--active" : ""
            }`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters() && <span className="filter-indicator"></span>}
          </button>

          {hasActiveFilters() && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="email-filters__advanced">
          {/* Threat Level Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <AlertTriangle size={16} />
              <span>Threat Level</span>
            </div>
            <div className="filter-options">
              {threatLevelOptions.map((threat) => (
                <label key={threat} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.threatLevel.includes(threat)}
                    onChange={() => toggleArrayFilter("threatLevel", threat)}
                  />
                  <div
                    className="threat-indicator"
                    style={{ backgroundColor: getThreatColor(threat) }}
                  ></div>
                  <span>
                    {threat.charAt(0).toUpperCase() + threat.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Authentication Filters */}
          <div className="filter-section">
            <div className="filter-section__header">
              <Shield size={16} />
              <span>SPF Authentication</span>
            </div>
            <div className="filter-options">
              {authResultOptions.map((result) => (
                <label key={result} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.spfResult.includes(result)}
                    onChange={() => toggleArrayFilter("spfResult", result)}
                  />
                  <div
                    className="auth-indicator"
                    style={{ backgroundColor: getAuthColor(result) }}
                  ></div>
                  <span>
                    {result.charAt(0).toUpperCase() + result.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section__header">
              <Shield size={16} />
              <span>DKIM Authentication</span>
            </div>
            <div className="filter-options">
              {authResultOptions.map((result) => (
                <label key={result} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.dkimResult.includes(result)}
                    onChange={() => toggleArrayFilter("dkimResult", result)}
                  />
                  <div
                    className="auth-indicator"
                    style={{ backgroundColor: getAuthColor(result) }}
                  ></div>
                  <span>
                    {result.charAt(0).toUpperCase() + result.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section__header">
              <Shield size={16} />
              <span>DMARC Authentication</span>
            </div>
            <div className="filter-options">
              {authResultOptions.map((result) => (
                <label key={result} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.dmarcResult.includes(result)}
                    onChange={() => toggleArrayFilter("dmarcResult", result)}
                  />
                  <div
                    className="auth-indicator"
                    style={{ backgroundColor: getAuthColor(result) }}
                  ></div>
                  <span>
                    {result.charAt(0).toUpperCase() + result.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Text Filters */}
          <div className="filter-section">
            <div className="filter-section__header">
              <User size={16} />
              <span>Sender & Recipients</span>
            </div>
            <div className="text-filters">
              <input
                type="text"
                placeholder="Sender email..."
                value={filters.sender}
                onChange={(e) => updateFilters({ sender: e.target.value })}
                className="filter-input"
              />
              <input
                type="text"
                placeholder="Recipient email..."
                value={filters.recipient}
                onChange={(e) => updateFilters({ recipient: e.target.value })}
                className="filter-input"
              />
              <input
                type="text"
                placeholder="Domain..."
                value={filters.domain}
                onChange={(e) => updateFilters({ domain: e.target.value })}
                className="filter-input"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <Calendar size={16} />
              <span>Date Range</span>
            </div>
            <div className="filter-options filter-options--radio">
              {[
                { value: "today", label: "Today" },
                { value: "3d", label: "Last 3 days" },
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "all", label: "All time" },
              ].map((option) => (
                <label key={option.value} className="filter-option">
                  <input
                    type="radio"
                    name="dateRange"
                    value={option.value}
                    checked={filters.dateRange === option.value}
                    onChange={(e) =>
                      updateFilters({ dateRange: e.target.value as any })
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Score Range */}
          <div className="filter-section">
            <div className="filter-section__header">
              <AlertTriangle size={16} />
              <span>Risk Score Range</span>
            </div>
            <div className="score-range">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.scoreRange[0]}
                onChange={(e) =>
                  updateFilters({
                    scoreRange: [
                      parseInt(e.target.value),
                      filters.scoreRange[1],
                    ],
                  })
                }
                className="score-slider"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.scoreRange[1]}
                onChange={(e) =>
                  updateFilters({
                    scoreRange: [
                      filters.scoreRange[0],
                      parseInt(e.target.value),
                    ],
                  })
                }
                className="score-slider"
              />
              <div className="score-values">
                <span>{filters.scoreRange[0]}%</span>
                <span>to</span>
                <span>{filters.scoreRange[1]}%</span>
              </div>
            </div>
          </div>

          {/* Content Filters */}
          <div className="filter-section">
            <div className="filter-section__header">
              <Mail size={16} />
              <span>Content</span>
            </div>
            <div className="filter-options filter-options--radio">
              <div className="content-filter-group">
                <span className="content-filter-label">Attachments:</span>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="hasAttachments"
                    value="all"
                    checked={filters.hasAttachments === "all"}
                    onChange={(e) =>
                      updateFilters({ hasAttachments: e.target.value as any })
                    }
                  />
                  <span>All</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="hasAttachments"
                    value="yes"
                    checked={filters.hasAttachments === "yes"}
                    onChange={(e) =>
                      updateFilters({ hasAttachments: e.target.value as any })
                    }
                  />
                  <span>With attachments</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="hasAttachments"
                    value="no"
                    checked={filters.hasAttachments === "no"}
                    onChange={(e) =>
                      updateFilters({ hasAttachments: e.target.value as any })
                    }
                  />
                  <span>No attachments</span>
                </label>
              </div>

              <div className="content-filter-group">
                <span className="content-filter-label">URLs:</span>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="hasUrls"
                    value="all"
                    checked={filters.hasUrls === "all"}
                    onChange={(e) =>
                      updateFilters({ hasUrls: e.target.value as any })
                    }
                  />
                  <span>All</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="hasUrls"
                    value="yes"
                    checked={filters.hasUrls === "yes"}
                    onChange={(e) =>
                      updateFilters({ hasUrls: e.target.value as any })
                    }
                  />
                  <span>With URLs</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="hasUrls"
                    value="no"
                    checked={filters.hasUrls === "no"}
                    onChange={(e) =>
                      updateFilters({ hasUrls: e.target.value as any })
                    }
                  />
                  <span>No URLs</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="active-filters">
          <span className="active-filters__label">Active filters:</span>
          <div className="active-filters__list">
            {filters.threatLevel.map((threat) => (
              <span key={`threat-${threat}`} className="active-filter-tag">
                {threat}
                <button
                  onClick={() => toggleArrayFilter("threatLevel", threat)}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.dateRange !== "all" && (
              <span className="active-filter-tag">
                {filters.dateRange}
                <button onClick={() => updateFilters({ dateRange: "all" })}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.sender && (
              <span className="active-filter-tag">
                sender: {filters.sender}
                <button onClick={() => updateFilters({ sender: "" })}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.recipient && (
              <span className="active-filter-tag">
                recipient: {filters.recipient}
                <button onClick={() => updateFilters({ recipient: "" })}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Email Filters Styles - using similar structure as AlertFilters but adapted for emails
const styles = `
.email-filters {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  overflow: hidden;
}

.email-filters__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.email-filters__search {
  flex: 1;
  min-width: 0;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input__icon {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input__field {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.search-input__field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

.search-input__clear {
  position: absolute;
  right: var(--spacing-md);
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

.search-input__clear:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.email-filters__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.email-count {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.email-count__filtered {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.email-count__total {
  color: var(--text-muted);
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  position: relative;
}

.filter-toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-toggle--active {
  background: var(--bg-accent);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: var(--color-danger);
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-secondary);
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.clear-filters-btn:hover {
  background: rgba(237, 51, 51, 0.1);
}

/* Advanced Filters */
.email-filters__advanced {
  border-top: 1px solid var(--border-primary);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  animation: slideDown var(--duration-normal) var(--ease-out);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-section__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-in-out);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.filter-option:hover {
  background: var(--bg-tertiary);
}

.threat-indicator,
.auth-indicator {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.text-filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.filter-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(19, 255, 160, 0.1);
}

.score-range {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.score-slider {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
}

.score-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

.score-values {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.content-filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.content-filter-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xs);
}

/* Active Filters */
.active-filters {
  border-top: 1px solid var(--border-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.active-filters__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
}

.active-filters__list {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.active-filter-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px 6px;
  background: var(--bg-accent);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
}

.active-filter-tag button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 1px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.active-filter-tag button:hover {
  background: rgba(19, 255, 160, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .email-filters__header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .email-filters__actions {
    width: 100%;
    justify-content: space-between;
  }

  .email-filters__advanced {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .active-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("email-filters-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "email-filters-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
