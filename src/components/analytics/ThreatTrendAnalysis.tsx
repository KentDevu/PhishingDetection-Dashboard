// Threat Trend Analysis Chart Component

import { useMemo, useState, useEffect } from "react";
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
import { Calendar, TrendingUp, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ThreatTrend } from "../../models/analytics";

interface ThreatTrendAnalysisProps {
  data: ThreatTrend[] | null;
  loading?: boolean;
  onPeriodChange?: (period: string) => void;
  selectedPeriod?: string;
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
  selectedPeriod = "30d",
}: ThreatTrendAnalysisProps) {
  const [chartType, setChartType] = useState<"line" | "area">("area");

  console.log("ThreatTrendAnalysis render:", { selectedPeriod, dataLength: data?.length, loading });

  useEffect(() => {
    console.log("ThreatTrendAnalysis selectedPeriod changed:", selectedPeriod);
  }, [selectedPeriod]);

  const chartData = useMemo(() => {
    if (!data) return [];

    console.log("ThreatTrendAnalysis chartData calculating for period:", selectedPeriod, "data length:", data.length);

    // Apply period filtering here so the chart updates immediately when the
    // parent changes the selected period. Data from parent is expected to be
    // full (unfiltered) trend rows.
    let filtered = data;

    if (selectedPeriod) {
      let daysToGoBack = 30;
      switch (selectedPeriod) {
        case "7d":
          daysToGoBack = 7;
          break;
        case "30d":
          daysToGoBack = 30;
          break;
        case "90d":
          daysToGoBack = 90;
          break;
        case "1y":
          daysToGoBack = 365;
          break;
      }

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToGoBack);

      console.log("Filtering with cutoff:", cutoff, "days back:", daysToGoBack);

      filtered = data.filter((trend) => {
        // trend.date expected to be ISO date like YYYY-MM-DD
        const d = parseISO(trend.date);
        const keep = d >= cutoff;
        if (!keep) {
          console.log("Filtering out:", trend.date, d);
        }
        return keep;
      });

      console.log("Filtered data length:", filtered.length);
    }

    return filtered.map((trend) => ({
      ...trend,
      date: format(parseISO(trend.date), "MMM dd"),
      detection_rate: (
        (trend.threats_detected / Math.max(trend.emails_processed, 1)) *
        100
      ).toFixed(1),
      blocked_rate: (
        (trend.blocked_emails / Math.max(trend.emails_processed, 1)) *
        100
      ).toFixed(1),
    }));
  }, [data, selectedPeriod]);

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
  }, [data, selectedPeriod]);

  const handlePeriodChange = (period: string) => {
    console.log("ThreatTrendAnalysis handlePeriodChange:", period);
    onPeriodChange?.(period);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-800 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading trend analysis...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <TrendingUp size={48} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-white">No Trend Data</h3>
          <p className="text-gray-400">Unable to load threat trend analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Threat Trend Analysis</h2>
          <p className="text-sm text-gray-400">Security metrics over time</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Period Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => handlePeriodChange(period.value)}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === "line"
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === "area"
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-900/50 rounded-lg border border-cyan-700">
                <Activity size={20} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {summaryStats.totalThreats.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Threats Detected</div>
                <div className={`text-xs font-medium ${
                  summaryStats.threatChange >= 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {summaryStats.threatChange >= 0 ? '+' : ''}{summaryStats.threatChange.toFixed(1)}% from last period
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/50 rounded-lg border border-green-700">
                <Calendar size={20} className="text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {summaryStats.totalEmails.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Emails Processed</div>
                <div className={`text-xs font-medium ${
                  summaryStats.emailChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {summaryStats.emailChange >= 0 ? '+' : ''}{summaryStats.emailChange.toFixed(1)}% from last period
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Threat Detection Timeline</h3>
          <p className="text-sm text-gray-400">Daily threat detection and email processing metrics</p>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
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
                  stroke="#374151"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#4B5563" }}
                />
                <YAxis
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#4B5563" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#F9FAFB",
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
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    color: "#111827",
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
    </div>
  )
}