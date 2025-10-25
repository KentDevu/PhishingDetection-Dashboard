import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Activity,
  Settings,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { threatAlertService } from "../../services/threatAlertService";
import type {
  ThreatAlertSummary,
  ThreatMonitoringStats,
} from "../../services/threatAlertService";
import { useNotifications } from "../../contexts/NotificationContext";
import type { ThreatAlert } from "../../types/notifications";

interface ThreatAlertDashboardProps {
  onThreatSelect?: (alert: ThreatAlert) => void;
  onRuleManage?: () => void;
}

const ThreatAlertDashboard: React.FC<ThreatAlertDashboardProps> = ({
  onThreatSelect,
  onRuleManage,
}) => {
  const [summary, setSummary] = useState<ThreatAlertSummary | null>(null);
  const [stats, setStats] = useState<ThreatMonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { isConnected } = useNotifications();

  useEffect(() => {
    loadThreatData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadThreatData, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadThreatData = async () => {
    try {
      setLoading(true);

      // Initialize threat alert service if needed
      await threatAlertService.initialize();

      const threatSummary = threatAlertService.getThreatSummary();
      const monitoringStats = threatAlertService.getMonitoringStats();

      setSummary(threatSummary);
      setStats(monitoringStats);
    } catch (error) {
      console.error("Failed to load threat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadThreatData();
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "text-red-800 bg-red-100 border-red-300";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="threat-dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading threat intelligence...</p>
      </div>
    );
  }

  return (
    <div className="threat-alert-dashboard">
      {/* Action Bar */}
      <div className="dashboard-action-bar">
        <div className="connection-status">
          <div
            className={`status-indicator ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            <div className="status-dot" />
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        <div className="action-buttons">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline">
            <Download size={16} />
            Export
          </Button>
          <Button onClick={onRuleManage}>
            <Settings size={16} />
            Rules
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="alert-summary-grid">
        <Card className="summary-card critical">
          <CardContent className="card-content">
            <div className="metric-header">
              <AlertTriangle className="metric-icon" size={24} />
              <span className="metric-label">Critical Alerts</span>
            </div>
            <div className="metric-value">{summary?.critical_alerts || 0}</div>
            <div className="metric-trend">
              <TrendingUp size={14} />
              <span>Immediate action required</span>
            </div>
          </CardContent>
        </Card>

        <Card className="summary-card high">
          <CardContent className="card-content">
            <div className="metric-header">
              <Shield className="metric-icon" size={24} />
              <span className="metric-label">High Priority</span>
            </div>
            <div className="metric-value">{summary?.high_alerts || 0}</div>
            <div className="metric-trend">
              <Activity size={14} />
              <span>Security review needed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="summary-card total">
          <CardContent className="card-content">
            <div className="metric-header">
              <Zap className="metric-icon" size={24} />
              <span className="metric-label">Total Threats</span>
            </div>
            <div className="metric-value">{summary?.total_alerts || 0}</div>
            <div className="metric-trend">
              <Clock size={14} />
              <span>Last 24 hours</span>
            </div>
          </CardContent>
        </Card>

        <Card className="summary-card monitoring">
          <CardContent className="card-content">
            <div className="metric-header">
              <Activity className="metric-icon" size={24} />
              <span className="metric-label">Active Rules</span>
            </div>
            <div className="metric-value">{stats?.active_rules || 0}</div>
            <div className="metric-trend">
              <Users size={14} />
              <span>Monitoring patterns</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <div className="dashboard-content">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle size={20} />
              <span>Recent Threat Alerts</span>
            </CardTitle>
            <CardDescription>
              Latest security threats and incidents requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.recent_alerts.length === 0 ? (
              <div className="no-alerts">
                <Shield size={48} className="no-alerts-icon" />
                <h3>No Recent Threats</h3>
                <p>Your systems are currently secure. Keep monitoring!</p>
              </div>
            ) : (
              <div className="alert-list">
                {summary?.recent_alerts.slice(0, 10).map((alert, index) => (
                  <div
                    key={index}
                    className="alert-item"
                    onClick={() => onThreatSelect?.(alert)}
                  >
                    <div className="alert-header">
                      <div
                        className={`severity-badge ${getSeverityColor(
                          alert.payload.severity
                        )}`}
                      >
                        {alert.payload.severity.toUpperCase()}
                      </div>
                      <div className="alert-time">
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>

                    <div className="alert-content">
                      <h4 className="alert-title">
                        {alert.payload.threat_type.toUpperCase()} Threat
                        Detected
                      </h4>
                      <p className="alert-description">
                        From: <strong>{alert.payload.sender}</strong>
                      </p>
                      <p className="alert-subject">
                        Subject: {alert.payload.subject}
                      </p>
                    </div>

                    <div className="alert-actions">
                      <Button size="sm" variant="outline">
                        <Eye size={14} />
                        Investigate
                      </Button>
                      {alert.payload.action_required && (
                        <Button size="sm" variant="destructive">
                          <AlertTriangle size={14} />
                          Action Required
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Threat Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Threat Trends</span>
            </CardTitle>
            <CardDescription>
              Distribution of threat types over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="threat-trends">
              {summary &&
                Object.entries(summary.threat_trends).map(([type, count]) => (
                  <div key={type} className="trend-item">
                    <div className="trend-label">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                    <div className="trend-bar">
                      <div
                        className="trend-fill"
                        style={{
                          width: `${
                            summary.total_alerts > 0
                              ? (count / summary.total_alerts) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="trend-count">{count}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Threat Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>Top Threat Sources</span>
            </CardTitle>
            <CardDescription>
              Most frequent sources of security threats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="threat-sources">
              {summary?.top_threats.length === 0 ? (
                <p className="no-data">No threat sources identified</p>
              ) : (
                summary?.top_threats.slice(0, 5).map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-info">
                      <div className="source-sender">{source.sender}</div>
                      <div className="source-meta">
                        {source.threat_count} threats • Last:{" "}
                        {formatTimeAgo(source.latest_threat)}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Block
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Styles for the Threat Alert Dashboard
const styles = `
.threat-alert-dashboard {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
  background: var(--bg-primary);
}

/* Action Bar */
.dashboard-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.status-indicator.connected {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.status-indicator.disconnected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* Alert Summary Grid */
.alert-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.summary-card {
  transition: all var(--duration-fast) var(--ease-in-out);
  border: 1px solid var(--border-primary);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.summary-card.critical {
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.02);
}

.summary-card.high {
  border-color: var(--color-warning);
  background: rgba(245, 158, 11, 0.02);
}

.summary-card.total {
  border-color: var(--color-primary);
  background: rgba(19, 255, 160, 0.02);
}

.summary-card.monitoring {
  border-color: var(--color-info);
  background: rgba(59, 130, 246, 0.02);
}

.card-content {
  padding: var(--spacing-lg);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.metric-icon {
  color: var(--color-primary);
}

.summary-card.critical .metric-icon {
  color: var(--color-danger);
}

.summary-card.high .metric-icon {
  color: var(--color-warning);
}

.summary-card.monitoring .metric-icon {
  color: var(--color-info);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Dashboard Content */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
}

/* Loading State */
.threat-dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-lg);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Alert List */
.no-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.no-alerts-icon {
  color: var(--color-success);
  margin-bottom: var(--spacing-md);
}

.no-alerts h3 {
  margin: 0 0 var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.no-alerts p {
  margin: 0;
  color: var(--text-muted);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.alert-item {
  padding: var(--spacing-md);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.alert-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.severity-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
}

.alert-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.alert-title {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.alert-description,
.alert-subject {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.alert-subject {
  color: var(--text-muted);
  font-style: italic;
  margin-top: var(--spacing-xs);
}

.alert-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

/* Threat Trends */
.threat-trends {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.trend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.trend-label {
  flex: 0 0 100px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: capitalize;
}

.trend-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.trend-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) var(--ease-in-out);
}

.trend-count {
  flex: 0 0 40px;
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* Threat Sources */
.threat-sources {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.no-data {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  padding: var(--spacing-lg);
}

.source-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.source-item:hover {
  background: var(--bg-secondary);
}

.source-sender {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  word-break: break-word;
}

.source-meta {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .threat-alert-dashboard {
    padding: var(--spacing-md);
  }

  .dashboard-action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .connection-status {
    justify-content: center;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .alert-summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .alert-item {
    padding: var(--spacing-sm);
  }

  .alert-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .source-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .alert-summary-grid {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: var(--font-size-2xl);
  }

  .trend-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .trend-label {
    flex: none;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("threat-alert-dashboard-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "threat-alert-dashboard-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}

export default ThreatAlertDashboard;
