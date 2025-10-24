// Alert Filters Component - Advanced filtering and search for alerts

import { useState } from "react";
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { AlertSeverity, AlertStatus, AlertType } from "./AlertCard";

interface FilterState {
  search: string;
  severity: AlertSeverity[];
  status: AlertStatus[];
  type: AlertType[];
  assignee: string[];
  dateRange: "today" | "3d" | "7d" | "30d" | "custom" | "all";
  tags: string[];
}

interface AlertFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export function AlertFilters({
  onFiltersChange,
  totalCount,
  filteredCount,
}: AlertFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    severity: [],
    status: [],
    type: [],
    assignee: [],
    dateRange: "all",
    tags: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const severityOptions: AlertSeverity[] = [
    "critical",
    "high",
    "medium",
    "low",
  ];
  const statusOptions: AlertStatus[] = [
    "open",
    "investigating",
    "resolved",
    "dismissed",
  ];
  const typeOptions: AlertType[] = [
    "phishing",
    "malware",
    "spam",
    "policy_violation",
    "anomaly",
  ];
  const assigneeOptions = [
    "Unassigned",
    "John Doe",
    "Jane Smith",
    "Security Team",
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
      severity: [],
      status: [],
      type: [],
      assignee: [],
      dateRange: "all",
      tags: [],
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== "" ||
      filters.severity.length > 0 ||
      filters.status.length > 0 ||
      filters.type.length > 0 ||
      filters.assignee.length > 0 ||
      filters.dateRange !== "all" ||
      filters.tags.length > 0
    );
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "var(--color-danger)";
      case "high":
        return "#FF6B35";
      case "medium":
        return "var(--color-warning)";
      case "low":
        return "var(--color-primary)";
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case "open":
        return "var(--text-muted)";
      case "investigating":
        return "var(--color-info)";
      case "resolved":
        return "var(--color-success)";
      case "dismissed":
        return "var(--text-muted)";
    }
  };

  return (
    <div className="alert-filters">
      <div className="alert-filters__header">
        <div className="alert-filters__search">
          <div className="search-input-wrapper">
            <Search className="search-input__icon" size={18} />
            <input
              type="text"
              placeholder="Search alerts by title, description, or metadata..."
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

        <div className="alert-filters__actions">
          <div className="alert-count">
            <span className="alert-count__filtered">{filteredCount}</span>
            <span className="alert-count__separator">of</span>
            <span className="alert-count__total">{totalCount}</span>
            <span className="alert-count__label">alerts</span>
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
        <div className="alert-filters__advanced">
          {/* Severity Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <AlertTriangle size={16} />
              <span>Severity</span>
            </div>
            <div className="filter-options">
              {severityOptions.map((severity) => (
                <label key={severity} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.severity.includes(severity)}
                    onChange={() => toggleArrayFilter("severity", severity)}
                  />
                  <div
                    className="severity-indicator"
                    style={{ backgroundColor: getSeverityColor(severity) }}
                  ></div>
                  <span>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <CheckCircle size={16} />
              <span>Status</span>
            </div>
            <div className="filter-options">
              {statusOptions.map((status) => (
                <label key={status} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleArrayFilter("status", status)}
                  />
                  <div
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(status) }}
                  ></div>
                  <span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <Tag size={16} />
              <span>Alert Type</span>
            </div>
            <div className="filter-options">
              {typeOptions.map((type) => (
                <label key={type} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => toggleArrayFilter("type", type)}
                  />
                  <span>{type.replace("_", " ").toUpperCase()}</span>
                </label>
              ))}
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

          {/* Assignee Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <User size={16} />
              <span>Assignee</span>
            </div>
            <div className="filter-options">
              {assigneeOptions.map((assignee) => (
                <label key={assignee} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.assignee.includes(assignee)}
                    onChange={() => toggleArrayFilter("assignee", assignee)}
                  />
                  <span>{assignee}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="active-filters">
          <span className="active-filters__label">Active filters:</span>
          <div className="active-filters__list">
            {filters.severity.map((severity) => (
              <span key={`severity-${severity}`} className="active-filter-tag">
                {severity}
                <button onClick={() => toggleArrayFilter("severity", severity)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.status.map((status) => (
              <span key={`status-${status}`} className="active-filter-tag">
                {status}
                <button onClick={() => toggleArrayFilter("status", status)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.type.map((type) => (
              <span key={`type-${type}`} className="active-filter-tag">
                {type}
                <button onClick={() => toggleArrayFilter("type", type)}>
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
          </div>
        </div>
      )}
    </div>
  );
}

// Alert Filters Styles
const styles = `
.alert-filters {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  overflow: hidden;
}

.alert-filters__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.alert-filters__search {
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

.search-input__field::placeholder {
  color: var(--text-muted);
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

.alert-filters__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.alert-count {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.alert-count__filtered {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.alert-count__total {
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
.alert-filters__advanced {
  border-top: 1px solid var(--border-primary);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.filter-options--radio .filter-option {
  margin-bottom: 2px;
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

.filter-option input[type="checkbox"],
.filter-option input[type="radio"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}

.severity-indicator,
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
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
  .alert-filters__header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .alert-filters__actions {
    width: 100%;
    justify-content: space-between;
  }

  .alert-filters__advanced {
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
  const styleElement = document.getElementById("alert-filters-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "alert-filters-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
