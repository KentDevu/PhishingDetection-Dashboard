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
import "./Analytics.css";

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
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="analytics-header__title">
          <BarChart3 className="analytics-header__icon" size={28} />
          <div>
            <h1>Security Analytics</h1>
            <p>Comprehensive threat intelligence and security insights</p>
          </div>
        </div>

        <div className="analytics-header__actions">
          <button
            className="btn btn--secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            className="btn btn--secondary"
            onClick={handleRefreshAll}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? "spinning" : ""} />
            Refresh Data
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="analytics-filters">
          <div className="filters-content">
            <h3>Analytics Filters</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-inputs">
                  <input
                    type="date"
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
                  <span>to</span>
                  <input
                    type="date"
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

              <div className="filter-actions">
                <button
                  className="btn btn--primary"
                  onClick={() => handleApplyFilters(filters)}
                >
                  Apply Filters
                </button>
                <button
                  className="btn btn--secondary"
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
        <div className="analytics-error">
          <TrendingUp size={48} />
          <h2>Analytics Error</h2>
          <p>{dashboardError || "An error occurred loading analytics data"}</p>
          <button onClick={handleRefreshAll}>Retry</button>
        </div>
      )}

      <div className="analytics-content">
        {/* KPI Cards Row */}
        <section className="analytics-section">
          <div className="section-header">
            <h2>Key Metrics</h2>
            <p>Essential threat analysis indicators</p>
          </div>
          <div className="analytics-kpi-grid">
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

        <section className="analytics-section">
          <div className="section-header">
            <h2>Threat Intelligence Overview</h2>
            <p>Real-time threat detection and analysis metrics</p>
          </div>
          <ThreatIntelligenceChart
            data={threatMetrics}
            loading={metricsLoading}
          />
        </section>

        <section className="analytics-section">
          <div className="section-header">
            <h2>Threat Trends</h2>
            <p>Historical analysis and trend patterns</p>
          </div>
          <ThreatTrendAnalysis
            data={threatTrends}
            loading={trendsLoading}
            onPeriodChange={changePeriod}
          />
        </section>

        <section className="analytics-section">
          <div className="section-header">
            <h2>Domain Intelligence</h2>
            <p>Reputation analysis and threat classification</p>
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
