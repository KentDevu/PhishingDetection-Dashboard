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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("reputation_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const threatLevels = [
    { value: "all", label: "All Levels", color: "#6B7280" },
    { value: "critical", label: "Critical", color: "#DC2626" },
    { value: "high", label: "High", color: "#EF4444" },
    { value: "medium", label: "Medium", color: "#F59E0B" },
    { value: "low", label: "Low", color: "#EAB308" },
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

  const getReputationClass = (score: number) => {
    if (score >= 80) return "reputation--high";
    if (score >= 60) return "reputation--medium";
    if (score >= 40) return "reputation--low";
    return "reputation--critical";
  };

  if (loading) {
    return (
      <div className="domain-intel-table">
        <div className="domain-intel-table__loading">
          <div className="loading-spinner"></div>
          <p>Loading domain intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="domain-intel-table">
        <div className="domain-intel-table__error">
          <Globe size={48} />
          <h3>No Domain Data</h3>
          <p>No domain intelligence data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="domain-intel-table">
      {/* Header */}
      <div className="table-header">
        <div className="table-header__info">
          <h2>Domain Intelligence</h2>
          <p>Reputation analysis for {data.length} domains</p>
        </div>

        <div className="table-controls">
          {/* Search */}
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Threat Level Filter */}
          <div className="filter-dropdown">
            <Filter size={16} />
            <select
              value={selectedThreatLevel}
              onChange={(e) => setSelectedThreatLevel(e.target.value)}
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
      <div className="table-stats">
        <div className="stat-item">
          <span className="stat-label">Total Domains:</span>
          <span className="stat-value">{filteredAndSortedData.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">High Risk:</span>
          <span className="stat-value stat-value--danger">
            {
              filteredAndSortedData.filter(
                (d) =>
                  d.threat_level === "critical" || d.threat_level === "high"
              ).length
            }
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Clean:</span>
          <span className="stat-value stat-value--success">
            {
              filteredAndSortedData.filter((d) => d.threat_level === "clean")
                .length
            }
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="intel-table">
          <thead>
            <tr>
              <th
                className={`sortable ${sortField === "domain" ? "sorted" : ""}`}
                onClick={() => handleSort("domain")}
              >
                Domain
                {sortField === "domain" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  ))}
              </th>
              <th>Threat Level</th>
              <th
                className={`sortable ${
                  sortField === "reputation_score" ? "sorted" : ""
                }`}
                onClick={() => handleSort("reputation_score")}
              >
                Reputation
                {sortField === "reputation_score" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  ))}
              </th>
              <th
                className={`sortable ${
                  sortField === "email_count" ? "sorted" : ""
                }`}
                onClick={() => handleSort("email_count")}
              >
                Email Count
                {sortField === "email_count" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  ))}
              </th>
              <th>Detection Engines</th>
              <th
                className={`sortable ${
                  sortField === "last_seen" ? "sorted" : ""
                }`}
                onClick={() => handleSort("last_seen")}
              >
                Last Seen
                {sortField === "last_seen" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  ))}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((domain, index) => (
              <tr key={index} className="table-row">
                <td className="domain-cell">
                  <div className="domain-info">
                    <Globe size={16} />
                    <span className="domain-name">{domain.domain}</span>
                    {domain.categories.length > 0 && (
                      <div className="domain-categories">
                        {domain.categories.slice(0, 2).map((category, idx) => (
                          <span key={idx} className="category-tag">
                            {category}
                          </span>
                        ))}
                        {domain.categories.length > 2 && (
                          <span className="category-more">
                            +{domain.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                <td>
                  <div
                    className="threat-level-badge"
                    style={{
                      backgroundColor: getThreatLevelColor(domain.threat_level),
                    }}
                  >
                    {domain.threat_level.charAt(0).toUpperCase() +
                      domain.threat_level.slice(1)}
                  </div>
                </td>

                <td>
                  <div
                    className={`reputation-score ${getReputationClass(
                      domain.reputation_score
                    )}`}
                  >
                    <div className="score-value">{domain.reputation_score}</div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${domain.reputation_score}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="email-count">
                  {domain.email_count.toLocaleString()}
                </td>

                <td>
                  <div className="engine-info">
                    <span className="malicious-engines">
                      {domain.malicious_engines.length}
                    </span>
                    <span className="total-engines">
                      / {domain.total_engines}
                    </span>
                  </div>
                </td>

                <td className="last-seen">
                  <div className="date-info">
                    <Clock size={14} />
                    {format(parseISO(domain.last_seen), "MMM dd, yyyy")}
                  </div>
                </td>

                <td>
                  <div className="actions">
                    <button className="action-btn" title="View Details">
                      <Shield size={14} />
                    </button>
                    <button className="action-btn" title="External Analysis">
                      <ExternalLink size={14} />
                    </button>
                    {domain.geographic_distribution.length > 0 && (
                      <button className="action-btn" title="Geographic Data">
                        <MapPin size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className="no-results">
          <Search size={32} />
          <p>No domains match your current filters</p>
        </div>
      )}
    </div>
  );
}

// Domain Intelligence Table Styles
const styles = `
.domain-intel-table {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.domain-intel-table__loading,
.domain-intel-table__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-lg);
  text-align: center;
}

.domain-intel-table__error svg {
  color: var(--color-info);
}

.domain-intel-table__error h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
}

.domain-intel-table__error p {
  margin: 0;
  color: var(--text-muted);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Header */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.table-header__info h2 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.table-header__info p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.table-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* Search Box */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  min-width: 200px;
}

.search-box svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-box input {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  width: 100%;
}

.search-box input:focus {
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

/* Filter Dropdown */
.filter-dropdown {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.filter-dropdown svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.filter-dropdown select {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.filter-dropdown select:focus {
  outline: none;
}

/* Table Statistics */
.table-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.stat-value--danger {
  color: var(--color-danger);
}

.stat-value--success {
  color: var(--color-success);
}

/* Table Container */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.intel-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
}

.intel-table th {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-align: left;
  white-space: nowrap;
}

.intel-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.intel-table th.sortable:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.intel-table th.sorted {
  color: var(--color-primary);
}

.intel-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  vertical-align: top;
}

.table-row:hover {
  background: var(--bg-secondary);
}

/* Domain Cell */
.domain-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.domain-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.domain-categories {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.category-tag {
  padding: 2px var(--spacing-xs);
  background: var(--bg-accent);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.category-more {
  padding: 2px var(--spacing-xs);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

/* Threat Level Badge */
.threat-level-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Reputation Score */
.reputation-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.score-value {
  font-weight: var(--font-weight-semibold);
  min-width: 30px;
}

.score-bar {
  width: 60px;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width var(--duration-normal) var(--ease-in-out);
}

.reputation--high .score-value {
  color: var(--color-success);
}

.reputation--high .score-fill {
  background: var(--color-success);
}

.reputation--medium .score-value {
  color: var(--color-warning);
}

.reputation--medium .score-fill {
  background: var(--color-warning);
}

.reputation--low .score-value {
  color: var(--color-danger);
}

.reputation--low .score-fill {
  background: var(--color-danger);
}

.reputation--critical .score-value {
  color: #DC2626;
}

.reputation--critical .score-fill {
  background: #DC2626;
}

/* Engine Info */
.engine-info {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
}

.malicious-engines {
  color: var(--color-danger);
  font-weight: var(--font-weight-semibold);
}

.total-engines {
  color: var(--text-muted);
}

/* Date Info */
.date-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-btn {
  padding: var(--spacing-xs);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-muted);
}

.no-results svg {
  margin-bottom: var(--spacing-md);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .table-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .search-box {
    min-width: 150px;
  }
  
  .table-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }
  
  .intel-table th,
  .intel-table td {
    padding: var(--spacing-sm);
  }
  
  .domain-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    flex-direction: column;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("domain-intel-table-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "domain-intel-table-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
