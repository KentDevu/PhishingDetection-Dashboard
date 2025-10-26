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

  const getTrendClasses = (type: TrendType) => {
    switch (type) {
      case "positive":
        return "bg-green-500/10 text-green-400";
      case "negative":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "success":
        return "border-l-4 border-l-green-400";
      case "warning":
        return "border-l-4 border-l-yellow-400";
      case "danger":
        return "border-l-4 border-l-red-400";
      case "info":
        return "border-l-4 border-l-cyan-400";
      default:
        return "";
    }
  };

  const getAccentClasses = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-gradient-to-r from-green-400 to-green-500";
      case "warning":
        return "bg-gradient-to-r from-yellow-400 to-yellow-500";
      case "danger":
        return "bg-gradient-to-r from-red-400 to-red-500";
      case "info":
        return "bg-gradient-to-r from-cyan-400 to-purple-500";
      default:
        return "bg-gradient-to-r from-cyan-400 to-green-400";
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 relative overflow-hidden transition-all duration-200 ease-in-out animate-pulse ${getVariantClasses(variant)} md:p-4`}>
        <div className="space-y-3">
          <div className="h-3.5 bg-gray-700 rounded w-3/5"></div>
          <div className="h-8 bg-gray-700 rounded w-2/5 md:h-6"></div>
          <div className="h-3 bg-gray-700 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 relative overflow-hidden transition-all duration-200 ease-in-out hover:border-cyan-400 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-cyan-400/10 ${getVariantClasses(variant)} md:p-4`}>
      {icon && (
        <div className="absolute top-6 right-6 text-gray-400 opacity-60 md:top-4 md:right-4">
          {icon}
        </div>
      )}

      <div className="relative z-10">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider leading-tight mb-2">
          {title}
        </h3>

        <div className="flex items-center gap-2 mb-1 flex-wrap md:flex-col md:items-start md:gap-1">
          <span className="text-3xl font-bold text-white leading-tight animate-[slideUp_0.8s_ease-out] md:text-2xl">
            {value}
          </span>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium leading-none ${getTrendClasses(trend.type || "neutral")}`}>
              {getTrendIcon(trend.direction)}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-gray-400 leading-normal m-0">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-200 ease-in-out hover:opacity-100 ${getAccentClasses(variant)}`}></div>
    </div>
  );
}


