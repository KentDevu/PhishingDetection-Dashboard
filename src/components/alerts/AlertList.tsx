// Alert List Component - Display and manage multiple security alerts

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  Eye,
  Archive,
  Trash2,
  MoreVertical,
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { AlertCard } from "./AlertCard";
import { AlertFilters } from "./AlertFilters";
import type { Alert, AlertFilterState } from "../../models/alerts";

interface AlertListProps {
  alerts: Alert[];
  onBulkAction?: (alertIds: string[], action: string) => void;
}

type SortField = "timestamp" | "severity" | "status" | "type" | "title";
type SortDirection = "asc" | "desc";

const SEVERITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };

export function AlertList({ alerts, onBulkAction }: AlertListProps) {
  const [filters, setFilters] = useState<AlertFilterState>({
    search: "",
    severity: [],
    status: [],
    type: [],
    assignee: [],
    dateRange: "all",
    tags: [],
  });

  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !alert.title.toLowerCase().includes(searchLower) &&
          !alert.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Severity filter
      if (
        filters.severity.length > 0 &&
        !filters.severity.includes(alert.severity)
      ) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(alert.status)) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(alert.type)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const alertDate = new Date(alert.timestamp);
        const daysDiff = Math.floor(
          (now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.dateRange) {
          case "today":
            if (daysDiff > 0) return false;
            break;
          case "3d":
            if (daysDiff > 3) return false;
            break;
          case "7d":
            if (daysDiff > 7) return false;
            break;
          case "30d":
            if (daysDiff > 30) return false;
            break;
        }
      }

      return true;
    });
  }, [alerts, filters]);

  // Sort filtered alerts
  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "timestamp":
          comparison =
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case "severity":
          comparison = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredAlerts, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectAlert = (alertId: string | number) => {
    const alertIdStr = alertId.toString();
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertIdStr)) {
      newSelected.delete(alertIdStr);
    } else {
      newSelected.add(alertIdStr);
    }
    setSelectedAlerts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAlerts.size === sortedAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(
        new Set(sortedAlerts.map((alert) => alert.id.toString()))
      );
    }
  };

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedAlerts.size > 0) {
      onBulkAction(Array.from(selectedAlerts), action);
      setSelectedAlerts(new Set());
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="alert-list">
      <AlertFilters
        onFiltersChange={(newFilters: AlertFilterState) =>
          setFilters(newFilters)
        }
        totalCount={alerts.length}
        filteredCount={filteredAlerts.length}
      />

      <div className="alert-list__controls">
        <div className="alert-list__selection">
          <button className="select-all-btn" onClick={handleSelectAll}>
            {selectedAlerts.size === sortedAlerts.length &&
            sortedAlerts.length > 0 ? (
              <CheckSquare size={18} />
            ) : (
              <Square size={18} />
            )}
            <span>
              {selectedAlerts.size > 0
                ? `${selectedAlerts.size} selected`
                : "Select all"}
            </span>
          </button>

          {selectedAlerts.size > 0 && (
            <div className="bulk-actions">
              <button
                className="bulk-action-btn bulk-action-btn--primary"
                onClick={() => handleBulkAction("investigate")}
              >
                <Eye size={16} />
                Mark as Investigating
              </button>
              <button
                className="bulk-action-btn bulk-action-btn--secondary"
                onClick={() => handleBulkAction("archive")}
              >
                <Archive size={16} />
                Archive
              </button>
              <button
                className="bulk-action-btn bulk-action-btn--danger"
                onClick={() => handleBulkAction("delete")}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="alert-list__view-controls">
          <div className="sort-controls">
            <span className="sort-label">Sort by:</span>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split("-");
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="sort-select"
            >
              <option value="timestamp-desc">Newest first</option>
              <option value="timestamp-asc">Oldest first</option>
              <option value="severity-desc">Highest severity</option>
              <option value="severity-asc">Lowest severity</option>
              <option value="status-asc">Status A-Z</option>
              <option value="type-asc">Type A-Z</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${
                viewMode === "card" ? "view-mode-btn--active" : ""
              }`}
              onClick={() => setViewMode("card")}
            >
              Card View
            </button>
            <button
              className={`view-mode-btn ${
                viewMode === "table" ? "view-mode-btn--active" : ""
              }`}
              onClick={() => setViewMode("table")}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {sortedAlerts.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={48} className="empty-state__icon" />
          <h3 className="empty-state__title">No alerts found</h3>
          <p className="empty-state__description">
            {filters.search ||
            filters.severity.length > 0 ||
            filters.status.length > 0
              ? "Try adjusting your filters to see more results."
              : "No security alerts are currently available."}
          </p>
        </div>
      ) : (
        <div className={`alert-list__content alert-list__content--${viewMode}`}>
          {viewMode === "card" ? (
            <div className="alert-cards-grid">
              {sortedAlerts.map((alert) => (
                <div key={alert.id} className="alert-card-wrapper">
                  <div className="alert-card-select">
                    <button onClick={() => handleSelectAlert(alert.id)}>
                      {selectedAlerts.has(alert.id.toString()) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </div>
                  <AlertCard alert={alert} />
                </div>
              ))}
            </div>
          ) : (
            <div className="alert-table">
              <div className="alert-table__header">
                <div className="alert-table__header-cell alert-table__header-cell--checkbox">
                  <button onClick={handleSelectAll}>
                    {selectedAlerts.size === sortedAlerts.length &&
                    sortedAlerts.length > 0 ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </div>
                <button
                  className="alert-table__header-cell alert-table__header-cell--sortable"
                  onClick={() => handleSort("severity")}
                >
                  Severity
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="alert-table__header-cell alert-table__header-cell--sortable"
                  onClick={() => handleSort("title")}
                >
                  Alert
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="alert-table__header-cell alert-table__header-cell--sortable"
                  onClick={() => handleSort("type")}
                >
                  Type
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="alert-table__header-cell alert-table__header-cell--sortable"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <ArrowUpDown size={14} />
                </button>
                <button
                  className="alert-table__header-cell alert-table__header-cell--sortable"
                  onClick={() => handleSort("timestamp")}
                >
                  Time
                  <ArrowUpDown size={14} />
                </button>
                <div className="alert-table__header-cell">Actions</div>
              </div>
              <div className="alert-table__body">
                {sortedAlerts.map((alert) => (
                  <div key={alert.id} className="alert-table__row">
                    <div className="alert-table__cell alert-table__cell--checkbox">
                      <button onClick={() => handleSelectAlert(alert.id)}>
                        {selectedAlerts.has(alert.id.toString()) ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </div>
                    <div className="alert-table__cell">
                      <span
                        className={`severity-badge severity-badge--${alert.severity}`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <div className="alert-table__cell alert-table__cell--title">
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-description">
                        {alert.description}
                      </div>
                    </div>
                    <div className="alert-table__cell">
                      <span className="alert-type">
                        {alert.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="alert-table__cell">
                      <span
                        className={`status-badge status-badge--${alert.status}`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <div className="alert-table__cell">
                      <div className="alert-timestamp">
                        <Clock size={14} />
                        {formatRelativeTime(alert.timestamp)}
                      </div>
                    </div>
                    <div className="alert-table__cell">
                      <button className="alert-table__action-btn">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Alert List Styles
const styles = `
.alert-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.alert-list__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  gap: var(--spacing-lg);
}

.alert-list__selection {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.select-all-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.select-all-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.bulk-action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.bulk-action-btn--primary {
  background: var(--bg-accent);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.bulk-action-btn--primary:hover {
  background: var(--color-primary);
  color: var(--bg-primary);
}

.bulk-action-btn--secondary {
  background: var(--bg-primary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.bulk-action-btn--secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.bulk-action-btn--danger {
  background: rgba(237, 51, 51, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.bulk-action-btn--danger:hover {
  background: var(--color-danger);
  color: white;
}

.alert-list__view-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.view-mode-toggle {
  display: flex;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-mode-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.view-mode-btn:not(:last-child) {
  border-right: 1px solid var(--border-primary);
}

.view-mode-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.view-mode-btn--active {
  background: var(--bg-accent);
  color: var(--color-primary);
}

/* Alert Cards Grid */
.alert-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.alert-card-wrapper {
  position: relative;
}

.alert-card-select {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 2;
}

.alert-card-select button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.alert-card-select button:hover {
  background: var(--bg-tertiary);
  color: var(--color-primary);
}

/* Alert Table */
.alert-table {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.alert-table__header {
  display: grid;
  grid-template-columns: 40px 100px 1fr 120px 120px 120px 60px;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.alert-table__header-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  white-space: nowrap;
}

.alert-table__header-cell--sortable {
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.alert-table__header-cell--sortable:hover {
  color: var(--color-primary);
}

.alert-table__header-cell--checkbox {
  justify-content: center;
}

.alert-table__body {
  max-height: 600px;
  overflow-y: auto;
}

.alert-table__row {
  display: grid;
  grid-template-columns: 40px 100px 1fr 120px 120px 120px 60px;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.alert-table__row:hover {
  background: var(--bg-tertiary);
}

.alert-table__row:last-child {
  border-bottom: none;
}

.alert-table__cell {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.alert-table__cell--checkbox {
  justify-content: center;
}

.alert-table__cell--checkbox button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.alert-table__cell--checkbox button:hover {
  color: var(--color-primary);
}

.alert-table__cell--title {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.alert-title {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.alert-description {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.severity-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.severity-badge--critical {
  background: rgba(237, 51, 51, 0.2);
  color: var(--color-danger);
}

.severity-badge--high {
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
}

.severity-badge--medium {
  background: rgba(255, 193, 7, 0.2);
  color: var(--color-warning);
}

.severity-badge--low {
  background: rgba(19, 255, 160, 0.2);
  color: var(--color-primary);
}

.status-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.status-badge--open {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-muted);
}

.status-badge--investigating {
  background: rgba(59, 130, 246, 0.2);
  color: var(--color-info);
}

.status-badge--resolved {
  background: rgba(34, 197, 94, 0.2);
  color: var(--color-success);
}

.status-badge--dismissed {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-muted);
}

.alert-type {
  text-transform: capitalize;
  color: var(--text-secondary);
}

.alert-timestamp {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.alert-table__action-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.alert-table__action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.empty-state__icon {
  color: var(--text-muted);
  margin: 0 auto var(--spacing-lg);
}

.empty-state__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
}

.empty-state__description {
  color: var(--text-muted);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .alert-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  .alert-table__header,
  .alert-table__row {
    grid-template-columns: 40px 80px 1fr 100px 100px 100px 50px;
  }
}

@media (max-width: 768px) {
  .alert-list__controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .alert-list__view-controls {
    justify-content: space-between;
  }

  .alert-cards-grid {
    grid-template-columns: 1fr;
  }

  .alert-table__header,
  .alert-table__row {
    grid-template-columns: 30px 1fr 80px 40px;
    font-size: var(--font-size-xs);
  }

  .alert-table__cell:nth-child(3),
  .alert-table__cell:nth-child(6) {
    display: none;
  }

  .alert-table__header-cell:nth-child(3),
  .alert-table__header-cell:nth-child(6) {
    display: none;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("alert-list-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "alert-list-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
