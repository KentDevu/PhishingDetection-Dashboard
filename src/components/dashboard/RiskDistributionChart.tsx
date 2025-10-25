// Risk Distribution Chart - Donut chart showing threat level distribution

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { ThreatLevel } from "../../models/email";

interface RiskData {
  name: string;
  value: number;
  level: ThreatLevel;
  color: string;
  [key: string]: any;
}

interface RiskDistributionChartProps {
  data: RiskData[];
  loading?: boolean;
}

export function RiskDistributionChart({
  data,
  loading = false,
}: RiskDistributionChartProps) {
  // Default data for demo/loading state
  const defaultData: RiskData[] = [
    { name: "Clean", value: 145, level: "clean", color: "#0DBB64" },
    { name: "Low Risk", value: 89, level: "suspicious", color: "#13FFA0" },
    { name: "Medium Risk", value: 34, level: "high", color: "#B8E96B" },
    { name: "High Risk", value: 12, level: "malicious", color: "#ED3333" },
    { name: "Critical", value: 3, level: "critical", color: "#DC2626" },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="chart-tooltip">
          <div className="chart-tooltip__header">
            <div
              className="chart-tooltip__color"
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="chart-tooltip__name">{data.name}</span>
          </div>
          <div className="chart-tooltip__content">
            <div className="chart-tooltip__value">{data.value} emails</div>
            <div className="chart-tooltip__percentage">
              {percentage}% of total
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="chart-legend">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="chart-legend__item">
              <div
                className="chart-legend__color"
                style={{ backgroundColor: entry.color }}
              ></div>
              <div className="chart-legend__content">
                <span className="chart-legend__name">{entry.payload.name}</span>
                <span className="chart-legend__value">
                  {entry.payload.value}
                </span>
                <span className="chart-legend__percentage">
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="risk-chart risk-chart--loading">
        <div className="risk-chart__skeleton">
          <div className="skeleton-donut"></div>
          <div className="skeleton-legend">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-legend-item"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-chart">
      <div className="risk-chart__container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Statistics Card */}
        <div className="risk-chart__center">
          <div className="risk-chart__stats-card">
            <div className="risk-chart__total-value">{total}</div>
            <div className="risk-chart__total-label">Total Emails</div>
            <div className="risk-chart__stats-breakdown">
              {chartData.map((item, index) => (
                <div key={index} className="risk-chart__stat-item">
                  <div
                    className="risk-chart__stat-dot"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="risk-chart__stat-info">
                    <span className="risk-chart__stat-name">{item.name}</span>
                    <span className="risk-chart__stat-value">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Risk Distribution Chart Styles
const styles = `
.risk-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.risk-chart__container {
  position: relative;
  width: 100%;
  height: 100%;
}

.risk-chart__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 10;
}

.risk-chart__stats-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  min-width: 140px;
  max-width: 180px;
}

.risk-chart__total-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-xs);
}

.risk-chart__total-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.risk-chart__stats-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.risk-chart__stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.risk-chart__stat-item:hover {
  background: var(--bg-tertiary);
}

.risk-chart__stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.risk-chart__stat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.risk-chart__stat-name {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.risk-chart__stat-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-left: var(--spacing-xs);
  flex-shrink: 0;
}

/* Tooltip Styles */
.chart-tooltip {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-tooltip);
}

.chart-tooltip__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.chart-tooltip__color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);
}

.chart-tooltip__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.chart-tooltip__content {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.chart-tooltip__value {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.chart-tooltip__percentage {
  margin-top: 2px;
}

/* Legend Styles */
.chart-legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.chart-legend__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.chart-legend__item:hover {
  background: var(--bg-tertiary);
}

.chart-legend__color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.chart-legend__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
}

.chart-legend__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.chart-legend__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-left: auto;
}

.chart-legend__percentage {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Loading States */
.risk-chart--loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.risk-chart__skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  width: 100%;
}

.skeleton-donut {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    var(--bg-primary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-primary) 75%
  );
  animation: shimmer 1.5s infinite;
}

.skeleton-legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
  max-width: 200px;
}

.skeleton-legend-item {
  height: 20px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-legend-item:nth-child(1) { width: 80%; }
.skeleton-legend-item:nth-child(2) { width: 70%; }
.skeleton-legend-item:nth-child(3) { width: 60%; }
.skeleton-legend-item:nth-child(4) { width: 75%; }
.skeleton-legend-item:nth-child(5) { width: 65%; }

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .risk-chart__container {
    /* min-height removed to use parent height */
  }

  .risk-chart__stats-card {
    min-width: 120px;
    max-width: 160px;
    padding: var(--spacing-sm);
  }

  .risk-chart__total-value {
    font-size: var(--font-size-lg);
  }

  .risk-chart__stat-item {
    padding: 2px var(--spacing-xs);
  }

  .risk-chart__stat-name {
    font-size: 10px;
  }

  .risk-chart__stat-value {
    font-size: 10px;
  }

  .chart-legend {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .chart-legend__item {
    flex-direction: column;
    text-align: center;
    min-width: 80px;
  }

  .chart-legend__content {
    flex-direction: column;
    gap: 2px;
  }

  .chart-legend__value {
    margin-left: 0;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("risk-chart-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "risk-chart-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
