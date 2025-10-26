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
import { AlertTriangle } from "lucide-react";
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
    ].filter((item) => item.value > 0);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-800 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading threat intelligence data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <AlertTriangle size={48} className="text-red-400" />
          <h3 className="text-lg font-semibold text-white">No Data Available</h3>
          <p className="text-gray-400">Unable to load threat intelligence data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Distribution Bar Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Threat Distribution</h3>
            <p className="text-sm text-gray-400">Email classification breakdown</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#374151" }}
                />
                <YAxis
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#374151" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#F9FAFB",
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
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Pie Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Threat Composition</h3>
            <p className="text-sm text-gray-400">Proportional threat analysis</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
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
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#F9FAFB",
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
    </div>
  )
}
