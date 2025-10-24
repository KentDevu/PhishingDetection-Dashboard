// Threat Trend Analysis Chart Component

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ThreatTrend } from "../../models/analytics";

interface ThreatTrendAnalysisProps {
  data: ThreatTrend[] | null;
  loading?: boolean;
  onPeriodChange?: (period: string) => void;
}

const TIME_PERIODS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
];

export function ThreatTrendAnalysis({
  data,
  loading,
  onPeriodChange,
}: ThreatTrendAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [chartType, setChartType] = useState<"line" | "area">("area");

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.map((trend) => ({
      ...trend,
      date: format(parseISO(trend.date), "MMM dd"),
      detection_rate: (
        (trend.threats_detected / trend.emails_processed) *
        100
      ).toFixed(1),
      blocked_rate: (
        (trend.blocked_emails / trend.emails_processed) *
        100
      ).toFixed(1),
    }));
  }, [data]);

  const summaryStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalThreats = data.reduce(
      (sum, trend) => sum + trend.threats_detected,
      0
    );
    const totalEmails = data.reduce(
      (sum, trend) => sum + trend.emails_processed,
      0
    );
    const totalBlocked = data.reduce(
      (sum, trend) => sum + trend.blocked_emails,
      0
    );
    const avgRisk =
      data.reduce((sum, trend) => sum + trend.average_risk, 0) / data.length;

    const latestTrend = data[data.length - 1];
    const previousTrend = data[data.length - 2];

    const threatChange = previousTrend
      ? ((latestTrend.threats_detected - previousTrend.threats_detected) /
          previousTrend.threats_detected) *
        100
      : 0;

    const emailChange = previousTrend
      ? ((latestTrend.emails_processed - previousTrend.emails_processed) /
          previousTrend.emails_processed) *
        100
      : 0;

    return {
      totalThreats,
      totalEmails,
      totalBlocked,
      avgRisk: avgRisk * 100,
      detectionRate: (totalThreats / totalEmails) * 100,
      blockedRate: (totalBlocked / totalEmails) * 100,
      threatChange,
      emailChange,
    };
  }, [data]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  if (loading) {
    return (
      <div className="threat-trend-analysis">
        <div className="threat-trend-analysis__loading">
          <div className="loading-spinner"></div>
          <p>Loading trend analysis...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="threat-trend-analysis">
        <div className="threat-trend-analysis__error">
          <TrendingUp size={48} />
          <h3>No Trend Data</h3>
          <p>Unable to load threat trend analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="threat-trend-analysis">
      {/* Header Controls */}
      <div className="trend-header">
        <div className="trend-header__info">
          <h2>Threat Trend Analysis</h2>
          <p>Security metrics over time</p>
        </div>

        <div className="trend-controls">
          {/* Period Selector */}
          <div className="period-selector">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                className={`period-btn ${
                  selectedPeriod === period.value ? "period-btn--active" : ""
                }`}
                onClick={() => handlePeriodChange(period.value)}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${
                chartType === "line" ? "toggle-btn--active" : ""
              }`}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              className={`toggle-btn ${
                chartType === "area" ? "toggle-btn--active" : ""
              }`}
              onClick={() => setChartType("area")}
            >
              Area
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="trend-summary">
          <div className="summary-stat">
            <div className="summary-stat__icon">
              <Activity size={20} />
            </div>
            <div className="summary-stat__content">
              <div className="summary-stat__value">
                {summaryStats.totalThreats.toLocaleString()}
              </div>
              <div className="summary-stat__label">Threats Detected</div>
              <div
                className={`summary-stat__change ${
                  summaryStats.threatChange >= 0 ? "positive" : "negative"
                }`}
              >
                {summaryStats.threatChange >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {Math.abs(summaryStats.threatChange).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="summary-stat">
            <div className="summary-stat__icon">
              <Calendar size={20} />
            </div>
            <div className="summary-stat__content">
              <div className="summary-stat__value">
                {summaryStats.totalEmails.toLocaleString()}
              </div>
              <div className="summary-stat__label">Emails Processed</div>
              <div
                className={`summary-stat__change ${
                  summaryStats.emailChange >= 0 ? "positive" : "negative"
                }`}
              >
                {summaryStats.emailChange >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {Math.abs(summaryStats.emailChange).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="summary-stat">
            <div className="summary-stat__icon summary-stat__icon--danger">
              <TrendingUp size={20} />
            </div>
            <div className="summary-stat__content">
              <div className="summary-stat__value">
                {summaryStats.detectionRate.toFixed(1)}%
              </div>
              <div className="summary-stat__label">Detection Rate</div>
              <div className="summary-stat__trend">Average performance</div>
            </div>
          </div>

          <div className="summary-stat">
            <div className="summary-stat__icon summary-stat__icon--warning">
              <Activity size={20} />
            </div>
            <div className="summary-stat__content">
              <div className="summary-stat__value">
                {summaryStats.avgRisk.toFixed(0)}%
              </div>
              <div className="summary-stat__label">Avg Risk Score</div>
              <div className="summary-stat__trend">Threat severity</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="trend-chart">
        <div className="chart-header">
          <h3>Threat Detection Timeline</h3>
          <p>Daily threat detection and email processing metrics</p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {chartType === "area" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-primary)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-primary)" }}
              />
              <YAxis
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-primary)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="threats_detected"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorThreats)"
                name="Threats Detected"
              />
              <Area
                type="monotone"
                dataKey="emails_processed"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorEmails)"
                name="Emails Processed"
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-primary)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-primary)" }}
              />
              <YAxis
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-primary)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="threats_detected"
                stroke="#EF4444"
                strokeWidth={3}
                name="Threats Detected"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="emails_processed"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Emails Processed"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="blocked_emails"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Blocked Emails"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Threat Trend Analysis Styles
const styles = `
.threat-trend-analysis {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.threat-trend-analysis__loading,
.threat-trend-analysis__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-lg);
  text-align: center;
}

.threat-trend-analysis__error svg {
  color: var(--color-info);
}

.threat-trend-analysis__error h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
}

.threat-trend-analysis__error p {
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
.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.trend-header__info h2 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.trend-header__info p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.trend-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

/* Period Selector */
.period-selector {
  display: flex;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.period-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  border-right: 1px solid var(--border-primary);
}

.period-btn:last-child {
  border-right: none;
}

.period-btn--active,
.period-btn:hover {
  background: var(--color-primary);
  color: var(--text-inverse);
}

/* Chart Type Toggle */
.chart-type-toggle {
  display: flex;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  border-right: 1px solid var(--border-primary);
}

.toggle-btn:last-child {
  border-right: none;
}

.toggle-btn--active,
.toggle-btn:hover {
  background: var(--color-primary);
  color: var(--text-inverse);
}

/* Summary Statistics */
.trend-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.summary-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.summary-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-stat__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-md);
}

.summary-stat__icon--danger {
  background: var(--color-danger);
}

.summary-stat__icon--warning {
  background: var(--color-warning);
}

.summary-stat__content {
  flex: 1;
}

.summary-stat__value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-xs);
}

.summary-stat__label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.summary-stat__change,
.summary-stat__trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.summary-stat__change.positive {
  color: var(--color-success);
}

.summary-stat__change.negative {
  color: var(--color-danger);
}

.summary-stat__trend {
  color: var(--text-muted);
}

/* Chart Container */
.trend-chart {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.chart-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-primary);
}

.chart-header h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.chart-header p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .trend-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .trend-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .trend-summary {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .summary-stat {
    padding: var(--spacing-md);
  }
  
  .summary-stat__icon {
    width: 40px;
    height: 40px;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("threat-trend-analysis-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "threat-trend-analysis-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
