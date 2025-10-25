// Dashboard Page - Main overview page for email threat analysis

import { useEffect, useMemo } from "react";
import { Mail, AlertTriangle } from "lucide-react";
import {
  KPICard,
  RiskDistributionChart,
  ThreatTrendChart,
  RecentEmailsTable,
} from "../../components/dashboard";
import { useEmails } from "../../hooks/useEmails";
import { useNotifications } from "../../contexts/NotificationContext";
import "./Dashboard.css";

export function Dashboard() {
  const { data: emails, loading, error, refetch } = useEmails();
  const { addNotification } = useNotifications();

  console.log("Dashboard: emails received", emails);

  const mapRiskLevel = (risk: string) => {
    switch (risk) {
      case "low":
      case "clean":
        return "clean";
      case "medium":
      case "suspicious":
        return "suspicious";
      case "high":
      case "critical":
      case "malicious":
        return "malicious";
      default:
        return "clean"; // default to clean
    }
  };

  // Calculate KPI values from emails
  const totalEmails = emails?.length || 0;
  const highRiskEmails =
    emails?.filter(
      (email) =>
        mapRiskLevel(email.threat_summary?.overall_risk || "low") ===
        "malicious"
    ).length || 0;

  const avgPhishingScore =
    emails && emails.length > 0
      ? Math.round(
          (emails.reduce((sum, email) => sum + email.phishing_score_cti, 0) /
            emails.length) *
            100
        )
      : 0;

  const activeThreats =
    emails?.filter((email) => email.threat_summary.malicious_found > 0)
      .length || 0;

  console.log(
    "Dashboard: totalEmails",
    totalEmails,
    "highRiskEmails",
    highRiskEmails,
    "avgPhishingScore",
    avgPhishingScore,
    "activeThreats",
    activeThreats
  );

  // Compute risk distribution data for chart
  const riskDistributionData = useMemo(() => {
    if (!emails?.length) return [];

    const distribution = emails.reduce((acc, email) => {
      const risk = email.threat_summary
        ? mapRiskLevel(email.threat_summary.overall_risk)
        : "clean";
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      {
        name: "Clean",
        value: distribution.clean || 0,
        level: "clean" as const,
        color: "#0DBB64",
      },
      {
        name: "Suspicious",
        value: distribution.suspicious || 0,
        level: "suspicious" as const,
        color: "#13FFA0",
      },
      {
        name: "Malicious",
        value: distribution.malicious || 0,
        level: "malicious" as const,
        color: "#ED3333",
      },
    ].filter((item) => item.value > 0);
  }, [emails]);

  // Compute threat trends for the last 7 days
  const threatTrendData = useMemo(() => {
    if (!emails?.length) return [];

    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayEmails = emails.filter((email) => {
        const emailDate = new Date(email.timestamp);
        return emailDate >= date && emailDate < nextDay;
      });

      const clean = dayEmails.filter(
        (e) => mapRiskLevel(e.threat_summary.overall_risk) === "clean"
      ).length;
      const suspicious = dayEmails.filter(
        (e) => mapRiskLevel(e.threat_summary.overall_risk) === "suspicious"
      ).length;
      const malicious = dayEmails.filter(
        (e) => mapRiskLevel(e.threat_summary.overall_risk) === "malicious"
      ).length;

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        clean,
        suspicious,
        malicious,
        total: clean + suspicious + malicious,
      };
    });
  }, [emails]);

  // Auto-trigger threat notifications for high-risk emails
  useEffect(() => {
    if (emails && emails.length > 0) {
      const criticalEmails = emails.filter(
        (email) =>
          mapRiskLevel(email.threat_summary.overall_risk) === "malicious"
      );

      // Only show notifications for the first critical email to avoid spam
      if (criticalEmails.length > 0 && criticalEmails.length <= 2) {
        criticalEmails.slice(0, 1).forEach((email) => {
          addNotification({
            type: "error",
            message: `High-risk email from ${
              email.sender
            } detected with ${Math.round(
              email.phishing_score_cti * 100
            )}% phishing score.`,
          });
        });
      }
    }
  }, [emails, addNotification]);

  // Handle API errors with user feedback
  useEffect(() => {
    if (error) {
      addNotification({
        type: "error",
        message:
          error.error ||
          "Unable to connect to the threat analysis API. Email data may not be current.",
      });
    }
  }, [error, addNotification, refetch]);

  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        {/* Show loading state across all sections */}
        {loading && (
          <div className="dashboard__loading">
            <div className="loading-spinner"></div>
            <p>Loading threat analysis data...</p>
          </div>
        )}

        {/* Show error state if API fails */}
        {error && !loading && (
          <div className="dashboard__error">
            <AlertTriangle size={24} />
            <h3>Unable to Load Threat Data</h3>
            <p>{error.error}</p>
            <button className="btn btn--primary" onClick={() => refetch()}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Main dashboard content */}
        {!loading && !error && (
          <>
            {/* KPI Cards Row */}
            <div className="dashboard__section">
              <div className="flex justify-between items-center mb-6">
                <h2 className="dashboard__section-title">Threat Overview</h2>
              </div>
              <div className="dashboard__kpi-grid">
                <KPICard
                  title="Total Emails"
                  value={totalEmails.toLocaleString()}
                  subtitle="Analyzed this month"
                  icon={<Mail size={20} />}
                  variant="default"
                  loading={loading}
                />

                <KPICard
                  title="High Risk"
                  value={highRiskEmails}
                  subtitle="Critical threats detected"
                  icon={<AlertTriangle size={20} />}
                  variant="danger"
                  loading={loading}
                />
              </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard__section">
              <div className="dashboard__charts-grid">
                {/* Threat Trend Chart */}
                <div className="chart-card">
                  <h3 className="chart-card__title">Threat Trends</h3>
                  <div className="chart-card__content">
                    <ThreatTrendChart
                      data={threatTrendData}
                      loading={loading}
                      timeRange="7d"
                    />
                  </div>
                </div>

                {/* Risk Distribution Chart */}
                <div className="chart-card">
                  <h3 className="chart-card__title">Risk Distribution</h3>
                  <div className="chart-card__content">
                    <RiskDistributionChart
                      data={riskDistributionData}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="dashboard__section">
              <h2 className="dashboard__section-title">
                Recent Email Activity
              </h2>
              <div className="table-card">
                <div className="table-card__header">
                  <h3>Latest Threats</h3>
                  <button className="btn btn--outline btn--sm">View All</button>
                </div>
                <div className="table-card__content">
                  <RecentEmailsTable
                    emails={emails || []}
                    loading={loading}
                    limit={10}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
