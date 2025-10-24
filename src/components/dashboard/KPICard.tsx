// KPI Card Component - Reusable metric display card

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type TrendDirection = "up" | "down" | "neutral";
export type TrendType = "positive" | "negative" | "neutral";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: TrendDirection;
    value: string;
    type?: TrendType;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  variant = "default",
  loading = false,
  icon,
}: KPICardProps) {
  const getTrendIcon = (direction: TrendDirection) => {
    switch (direction) {
      case "up":
        return <TrendingUp size={14} />;
      case "down":
        return <TrendingDown size={14} />;
      default:
        return <Minus size={14} />;
    }
  };

  const getTrendColor = (type: TrendType) => {
    switch (type) {
      case "positive":
        return "kpi-card__trend--positive";
      case "negative":
        return "kpi-card__trend--negative";
      default:
        return "kpi-card__trend--neutral";
    }
  };

  if (loading) {
    return (
      <div className={`kpi-card kpi-card--${variant} kpi-card--loading`}>
        <div className="kpi-card__skeleton">
          <div className="skeleton skeleton--title"></div>
          <div className="skeleton skeleton--value"></div>
          <div className="skeleton skeleton--subtitle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`kpi-card kpi-card--${variant}`}>
      {icon && <div className="kpi-card__icon">{icon}</div>}

      <div className="kpi-card__content">
        <h3 className="kpi-card__title">{title}</h3>

        <div className="kpi-card__value-container">
          <span className="kpi-card__value">{value}</span>
          {trend && (
            <div
              className={`kpi-card__trend ${getTrendColor(
                trend.type || "neutral"
              )}`}
            >
              {getTrendIcon(trend.direction)}
              <span className="kpi-card__trend-value">{trend.value}</span>
            </div>
          )}
        </div>

        {subtitle && <p className="kpi-card__subtitle">{subtitle}</p>}
      </div>

      <div className={`kpi-card__accent kpi-card__accent--${variant}`}></div>
    </div>
  );
}

// KPI Card Styles
const styles = `
.kpi-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-in-out);
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.kpi-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.kpi-card--loading {
  pointer-events: none;
}

.kpi-card--success {
  border-left: 4px solid var(--color-success);
}

.kpi-card--warning {
  border-left: 4px solid var(--color-warning);
}

.kpi-card--danger {
  border-left: 4px solid var(--color-danger);
}

.kpi-card--info {
  border-left: 4px solid var(--color-info);
}

.kpi-card__icon {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  color: var(--text-muted);
  opacity: 0.6;
}

.kpi-card__content {
  position: relative;
  z-index: 1;
}

.kpi-card__title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: var(--line-height-tight);
}

.kpi-card__value-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  flex-wrap: wrap;
}

.kpi-card__value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  animation: countUp 0.8s var(--ease-out);
}

.kpi-card__trend {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
}

.kpi-card__trend--positive {
  background: rgba(13, 187, 100, 0.1);
  color: var(--color-success);
}

.kpi-card__trend--negative {
  background: rgba(237, 51, 51, 0.1);
  color: var(--color-danger);
}

.kpi-card__trend--neutral {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.kpi-card__trend-value {
  font-size: inherit;
}

.kpi-card__subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  line-height: var(--line-height-normal);
}

.kpi-card__accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-in-out);
}

.kpi-card:hover .kpi-card__accent {
  opacity: 1;
}

.kpi-card__accent--success {
  background: var(--gradient-primary);
}

.kpi-card__accent--warning {
  background: var(--gradient-warning);
}

.kpi-card__accent--danger {
  background: var(--gradient-danger);
}

.kpi-card__accent--info {
  background: linear-gradient(135deg, var(--color-info) 0%, #6D28D9 100%);
}

.kpi-card__accent--default {
  background: var(--gradient-primary);
}

/* Loading States */
.kpi-card__skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton {
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  opacity: 0.7;
}

.skeleton--title {
  height: 14px;
  width: 60%;
  margin-bottom: var(--spacing-sm);
}

.skeleton--value {
  height: 32px;
  width: 40%;
  margin-bottom: var(--spacing-xs);
}

.skeleton--subtitle {
  height: 12px;
  width: 80%;
}

/* Animations */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .kpi-card {
    padding: var(--spacing-md);
  }

  .kpi-card__value {
    font-size: var(--font-size-2xl);
  }

  .kpi-card__value-container {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("kpi-card-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "kpi-card-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
