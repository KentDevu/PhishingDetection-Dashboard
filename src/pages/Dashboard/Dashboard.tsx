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
    <div className="p-0">
      <div className="flex flex-col gap-8">
        {/* Show loading state across all sections */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-gray-800 border border-gray-700 rounded-lg m-8">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-base text-center">Loading threat analysis data...</p>
          </div>
        )}

        {/* Show error state if API fails */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 text-center bg-gray-800 border border-red-500 rounded-lg p-8 m-8">
            <AlertTriangle size={24} className="text-red-500" />
            <h3 className="m-0 text-lg font-semibold text-white">Unable to Load Threat Data</h3>
            <p className="m-0 text-gray-400 text-sm max-w-[400px]">{error.error}</p>
            <button 
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-150 ease-in-out hover:bg-green-300 hover:-translate-y-0.5"
              onClick={() => refetch()}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Main dashboard content */}
        {!loading && !error && (
          <>
            {/* KPI Cards Row */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Threat Overview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Threat Trend Chart */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Threat Trends</h3>
                  <div className="h-80">
                    <ThreatTrendChart
                      data={threatTrendData}
                      loading={loading}
                    />
                  </div>
                </div>

                {/* Risk Distribution Chart */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
                  <div className="h-80">
                    <RiskDistributionChart
                      data={riskDistributionData}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Email Activity
              </h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Latest Threats</h3>
                  <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md text-sm hover:bg-gray-700 transition-colors">View All</button>
                </div>
                <div className="p-6">
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
