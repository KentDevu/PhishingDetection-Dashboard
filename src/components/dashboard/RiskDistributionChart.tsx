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
  const chartData = data || [];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="text-sm font-medium text-gray-900">{data.name}</span>
          </div>
          <div className="text-xs text-gray-500">
            <div className="font-medium text-gray-600">{data.value} emails</div>
            <div className="mt-1">
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
      <div className="flex flex-col gap-2 mt-4 px-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
              <div
                className="w-3 h-3 rounded shrink-0"
                style={{ backgroundColor: entry.color }}
              ></div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-gray-600">{entry.payload.name}</span>
                <span className="text-sm font-bold text-gray-900 ml-auto">
                  {entry.payload.value}
                </span>
                <span className="text-xs text-gray-500">
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
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="w-48 h-48 rounded-full bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
          <div className="flex flex-col gap-2 w-full max-w-48">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-5 bg-gray-100 rounded animate-pulse ${
                  i === 0 ? 'w-4/5' : i === 1 ? 'w-7/10' : i === 2 ? 'w-3/5' : i === 3 ? 'w-3/4' : 'w-13/20'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="relative w-full h-full">
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-xl p-4 shadow-md min-w-36 max-w-44 max-h-64 overflow-y-auto">
          <div className="text-xl font-bold text-gray-900 leading-tight mb-1">{total}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Total Emails</div>
          <div className="flex flex-col gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex justify-between items-center flex-1 min-w-0">
                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                  <span className="text-xs font-bold text-gray-900 ml-2 shrink-0">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
