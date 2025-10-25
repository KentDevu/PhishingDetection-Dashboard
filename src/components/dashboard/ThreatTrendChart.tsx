// Threat Trend Chart - Line chart showing threat levels over time

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, subDays } from "date-fns";

interface TrendDataPoint {
  date: string;
  clean: number;
  suspicious: number;
  malicious: number;
  total: number;
}

interface ThreatTrendChartProps {
  data?: TrendDataPoint[];
  loading?: boolean;
  timeRange?: "7d" | "30d" | "90d";
}

export function ThreatTrendChart({
  data,
  loading = false,
  timeRange = "7d",
}: ThreatTrendChartProps) {
  // Generate demo data for the last 7 days
  const generateDemoData = (): TrendDataPoint[] => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const clean = Math.floor(Math.random() * 50) + 20;
      const suspicious = Math.floor(Math.random() * 20) + 5;
      const malicious = Math.floor(Math.random() * 10) + 1;

      return {
        date: format(date, "MMM dd"),
        clean,
        suspicious,
        malicious,
        total: clean + suspicious + malicious,
      };
    });
  };

  const chartData = data || generateDemoData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0
      );

      return (
        <div className="trend-tooltip">
          <div className="trend-tooltip__header">
            <span className="trend-tooltip__date">{label}</span>
            <span className="trend-tooltip__total">{total} total emails</span>
          </div>
          <div className="trend-tooltip__content">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="trend-tooltip__item">
                <div
                  className="trend-tooltip__color"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="trend-tooltip__label">{entry.name}:</span>
                <span className="trend-tooltip__value">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="trend-chart trend-chart--loading">
        <div className="trend-chart__skeleton">
          <div className="skeleton-lines">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-line"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trend-chart">
      <div className="trend-chart__header">
        <div className="trend-chart__legend">
          <div className="legend-item">
            <div className="legend-color legend-color--clean"></div>
            <span>Clean</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-color--suspicious"></div>
            <span>Suspicious</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-color--malicious"></div>
            <span>Malicious</span>
          </div>
        </div>
      </div>

      <div className="trend-chart__container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="cleanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0DBB64" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0DBB64" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="suspiciousGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#B8E96B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#B8E96B" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="maliciousGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#ED3333" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ED3333" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-primary)"
            />
            <XAxis
              dataKey="date"
              stroke="var(--text-muted)"
              fontSize={12}
              tick={{ fill: "var(--text-muted)" }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tick={{ fill: "var(--text-muted)" }}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="clean"
              stackId="1"
              stroke="#0DBB64"
              fill="url(#cleanGradient)"
              strokeWidth={2}
              name="Clean"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              stackId="1"
              stroke="#B8E96B"
              fill="url(#suspiciousGradient)"
              strokeWidth={2}
              name="Suspicious"
            />
            <Area
              type="monotone"
              dataKey="malicious"
              stackId="1"
              stroke="#ED3333"
              fill="url(#maliciousGradient)"
              strokeWidth={2}
              name="Malicious"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Threat Trend Chart Styles
const styles = `
.trend-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.trend-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.trend-chart__legend {
  display: flex;
  gap: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);
}

.legend-color--clean {
  background: #0DBB64;
}

.legend-color--suspicious {
  background: #B8E96B;
}

.legend-color--malicious {
  background: #ED3333;
}

.trend-chart__container {
  flex: 1;
}

/* Tooltip Styles */
.trend-tooltip {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-tooltip);
}

.trend-tooltip__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--border-primary);
}

.trend-tooltip__date {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.trend-tooltip__total {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.trend-tooltip__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trend-tooltip__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.trend-tooltip__color {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-sm);
}

.trend-tooltip__label {
  color: var(--text-secondary);
  min-width: 70px;
}

.trend-tooltip__value {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-left: auto;
}

/* Loading States */
.trend-chart--loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-chart__skeleton {
  width: 100%;
  height: 250px;
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.skeleton-lines {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  top: 20px;
  display: flex;
  align-items: end;
  gap: 4px;
}

.skeleton-line {
  flex: 1;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--bg-tertiary) 50%,
    var(--bg-primary) 100%
  );
  border-radius: var(--radius-sm);
  animation: wave 2s ease-in-out infinite;
}

.skeleton-line:nth-child(1) { height: 60%; animation-delay: 0s; }
.skeleton-line:nth-child(2) { height: 80%; animation-delay: 0.2s; }
.skeleton-line:nth-child(3) { height: 40%; animation-delay: 0.4s; }
.skeleton-line:nth-child(4) { height: 70%; animation-delay: 0.6s; }

@keyframes wave {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .trend-chart__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .trend-chart__legend {
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .trend-chart__container {
    /* min-height removed to use parent height */
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("trend-chart-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "trend-chart-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
