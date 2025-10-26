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
}

export function ThreatTrendChart({
  data,
  loading = false,
}: ThreatTrendChartProps) {
  const chartData = data || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0
      );

      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            <span className="text-xs text-gray-500">{total} total emails</span>
          </div>
          <div className="flex flex-col gap-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-600 min-w-16">{entry.name}:</span>
                <span className="font-medium text-gray-900 ml-auto">{entry.value}</span>
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
      <div className="flex items-center justify-center w-full h-64">
        <div className="w-full h-64 bg-gray-50 rounded-lg overflow-hidden relative">
          <div className="absolute bottom-5 left-5 right-5 top-5 flex items-end gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 bg-linear-to-t from-gray-200 via-gray-100 to-transparent rounded animate-pulse ${
                  i === 0 ? 'h-3/5' : i === 1 ? 'h-4/5' : i === 2 ? 'h-2/5' : 'h-7/10'
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Clean</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Suspicious</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Malicious</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
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
