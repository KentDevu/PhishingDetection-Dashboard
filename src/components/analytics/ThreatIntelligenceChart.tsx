// Threat Intelligence Overview Chart Component

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, TrendingUp, Eye } from "lucide-react";
import type { ThreatMetrics } from "../../models/analytics";

interface ThreatIntelligenceChartProps {
  data: ThreatMetrics | null;
  loading?: boolean;
}

export function ThreatIntelligenceChart({
  data,
  loading,
}: ThreatIntelligenceChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: "Malicious",
        count: data.malicious_count,
        percentage: Math.round(
          (data.malicious_count / data.total_emails) * 100
        ),
        color: "#F59E0B",
      },
      {
        name: "Suspicious",
        count: data.suspicious_count,
        percentage: Math.round(
          (data.suspicious_count / data.total_emails) * 100
        ),
        color: "#EAB308",
      },
      {
        name: "Clean",
        count: data.clean_count,
        percentage: Math.round((data.clean_count / data.total_emails) * 100),
        color: "#22C55E",
      },
    ];
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];

    return [
      { name: "Malicious", value: data.malicious_count, color: "#EF4444" },
      { name: "Suspicious", value: data.suspicious_count, color: "#F59E0B" },
      { name: "Clean", value: data.clean_count, color: "#22C55E" },
    ].filter(item => item.value > 0);
  }, [data]);

  const kpis = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: "False Positive Rate",
        value: `${(data.false_positive_rate * 100).toFixed(2)}%`,
        icon: <TrendingUp size={20} />,
        trend: "-0.5%",
        trendUp: false,
        color: "info",
      },
      {
        label: "Emails Analyzed",
        value: data.total_emails.toLocaleString(),
        icon: <Eye size={20} />,
        trend: "+15.7%",
        trendUp: true,
        color: "primary",
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="threat-intel-chart">
        <div className="threat-intel-chart__loading">
          <div className="loading-spinner"></div>
          <p>Loading threat intelligence data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="threat-intel-chart">
        <div className="threat-intel-chart__error">
          <AlertTriangle size={48} />
          <h3>No Data Available</h3>
          <p>Unable to load threat intelligence data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="threat-intel-chart">

      {/* Charts Section */}
      <div className="threat-intel-charts">
        {/* Threat Distribution Bar Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Threat Distribution</h3>
            <p>Email classification breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-primary)"
              />
              <XAxis
                dataKey="name"
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
                formatter={(value, name) => [
                  `${value} emails (${
                    chartData.find((d) => d.name === name)?.percentage
                  }%)`,
                  "Count",
                ]}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Distribution Pie Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Threat Composition</h3>
            <p>Proportional threat analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) =>
                  `${entry.name} (${(
                    (Number(entry.value) / data.total_emails) *
                    100
                  ).toFixed(1)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                }}
                formatter={(value) => [
                  `${value} emails (${(
                    (Number(value) / data.total_emails) *
                    100
                  ).toFixed(1)}%)`,
                  "Count",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Threat Intelligence Chart Styles
const styles = `
.threat-intel-chart {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.threat-intel-chart__loading,
.threat-intel-chart__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-lg);
  text-align: center;
}

.threat-intel-chart__error svg {
  color: var(--color-danger);
}

.threat-intel-chart__error h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
}

.threat-intel-chart__error p {
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

/* KPI Cards */
.threat-intel-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kpi-card__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-inverse);
}

.kpi-card--success .kpi-card__icon {
  background: var(--color-success);
}

.kpi-card--warning .kpi-card__icon {
  background: var(--color-warning);
}

.kpi-card--info .kpi-card__icon {
  background: var(--color-info);
}

.kpi-card--primary .kpi-card__icon {
  background: var(--color-primary);
}

.kpi-card__content {
  flex: 1;
}

.kpi-card__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-xs);
}

.kpi-card__label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
}

.kpi-card__trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kpi-card__trend--up {
  color: var(--color-success);
}

.kpi-card__trend--down {
  color: var(--color-danger);
}

.trend-indicator {
  font-size: var(--font-size-md);
}

/* Charts Section */
.threat-intel-charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
}

.chart-container {
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
@media (max-width: 1024px) {
  .threat-intel-charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .threat-intel-kpis {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
  
  .kpi-card {
    padding: var(--spacing-md);
  }
  
  .kpi-card__icon {
    width: 40px;
    height: 40px;
  }
  
  .kpi-card__value {
    font-size: var(--font-size-xl);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("threat-intel-chart-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "threat-intel-chart-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
