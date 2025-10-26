// Analytics Page - Comprehensive threat intelligence and reporting dashboard
// CLIENT-SIDE COMPUTATION from email data

import { useState } from "react";
import { BarChart3, TrendingUp, RefreshCw, Filter, Mail, AlertTriangle } from "lucide-react";
import { ThreatIntelligenceChart } from "../../components/analytics/ThreatIntelligenceChart";
import { ThreatTrendAnalysis } from "../../components/analytics/ThreatTrendAnalysis";
import { DomainIntelligenceTable } from "../../components/analytics/DomainIntelligenceTable";
import { KPICard } from "../../components/dashboard";
import { useAnalyticsDashboard } from "../../hooks/useAnalyticsDashboard";
import { useThreatMetrics } from "../../hooks/useThreatMetrics";
import { useThreatTrends } from "../../hooks/useThreatTrends";
import type { ClientAnalyticsFilters } from "../../services/clientAnalyticsService";

export function Analytics() {
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
    applyFilters: applyDashboardFilters,
  } = useAnalyticsDashboard();

  const {
    data: threatMetrics,
    loading: metricsLoading,
    refetch: refetchMetrics,
  } = useThreatMetrics();

  const {
    data: threatTrends,
    loading: trendsLoading,
    changePeriod,
  } = useThreatTrends();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ClientAnalyticsFilters>({
    threat_levels: [],
    domains: [],
  });

  const handleRefreshAll = () => {
    refetchDashboard();
    refetchMetrics();
  };

  const handleApplyFilters = (newFilters: ClientAnalyticsFilters) => {
    setFilters(newFilters);
    applyDashboardFilters(newFilters);
  };

  const isLoading = dashboardLoading || metricsLoading || trendsLoading;
  const hasError = dashboardError;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <BarChart3 className="text-green-400 shrink-0" size={28} />
          <div>
            <h1 className="m-0 mb-1 text-3xl font-bold text-white">Security Analytics</h1>
            <p className="m-0 text-gray-400 text-sm">Comprehensive threat intelligence and security insights</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-md text-sm hover:bg-gray-600 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-md text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRefreshAll}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analytics Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={filters.date_range?.start || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        date_range: {
                          start: e.target.value,
                          end:
                            filters.date_range?.end ||
                            new Date().toISOString().split("T")[0],
                        },
                      })
                    }
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={filters.date_range?.end || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        date_range: {
                          start:
                            filters.date_range?.start ||
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split("T")[0],
                          end: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button
                  className="px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
                  onClick={() => handleApplyFilters(filters)}
                >
                  Apply Filters
                </button>
                <button
                  className="px-6 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-md text-sm hover:bg-gray-600 transition-colors"
                  onClick={() =>
                    setFilters({
                      date_range: {
                        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0],
                        end: new Date().toISOString().split("T")[0],
                      },
                      threat_levels: [],
                      domains: [],
                    })
                  }
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasError && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-800 border border-gray-700 rounded-lg text-center mb-8">
          <TrendingUp size={48} className="text-red-500 mb-6" />
          <h2 className="text-xl font-semibold text-white mb-2">Analytics Error</h2>
          <p className="text-gray-400 mb-6">{dashboardError || "An error occurred loading analytics data"}</p>
          <button 
            className="px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
            onClick={handleRefreshAll}
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {/* KPI Cards Row */}
        <section className="flex flex-col gap-6">
          <div className="pb-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-1">Key Metrics</h2>
            <p className="text-gray-400 text-sm">Essential threat analysis indicators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <KPICard
              title="Total Emails"
              value={threatMetrics?.total_emails?.toLocaleString() || "0"}
              subtitle="Analyzed this period"
              icon={<Mail size={20} />}
              variant="default"
              loading={metricsLoading}
            />

            <KPICard
              title="High Risk"
              value={threatMetrics?.high_risk_emails || 0}
              subtitle="Critical threats detected"
              icon={<AlertTriangle size={20} />}
              variant="danger"
              loading={metricsLoading}
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="pb-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-1">Threat Intelligence Overview</h2>
            <p>Real-time threat detection and analysis metrics</p>
          </div>
          <ThreatIntelligenceChart
            data={threatMetrics}
            loading={metricsLoading}
          />
        </section>

        <section className="flex flex-col gap-6">
          <div className="pb-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-1">Threat Trends</h2>
            <p className="text-gray-400 text-sm">Historical analysis and trend patterns</p>
          </div>
          <ThreatTrendAnalysis
            data={threatTrends}
            loading={trendsLoading}
            onPeriodChange={changePeriod}
          />
        </section>

        <section className="flex flex-col gap-6">
          <div className="pb-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-1">Domain Intelligence</h2>
            <p className="text-gray-400 text-sm">Reputation analysis and threat classification</p>
          </div>
          <DomainIntelligenceTable
            data={dashboardData?.domains || null}
            loading={dashboardLoading}
          />
        </section>
      </div>
    </div>
  );
}
