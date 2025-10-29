// Analytics Page - Comprehensive threat intelligence and reporting dashboard

import { useState, useEffect, useMemo } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { DomainIntelligenceTable } from "../../components/analytics/DomainIntelligenceTable";
import { ThreatIntelligenceChart } from "../../components/analytics/ThreatIntelligenceChart";
import { ThreatTrendAnalysis } from "../../components/analytics/ThreatTrendAnalysis";
import { IPIntelligenceTable } from "../../components/analytics/IPIntelligenceTable";
import { EmailIntelligenceTable } from "../../components/analytics/EmailIntelligenceTable";
import { useApi } from "../../contexts/ApiContext";
import type { Email } from "../../models/email";
import type { ThreatMetrics, ThreatTrend, DomainIntelligence, IPIntelligence } from "../../models/analytics";

// Define the actual API response structure (same as Emails page)
interface EmailsApiResponse {
  emails: Email[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function Analytics() {
  const { dataFetch } = useApi();
  const [emailsData, setEmailsData] = useState<EmailsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  console.log("Analytics selectedPeriod:", selectedPeriod);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Fetch all emails for analytics calculations (same endpoint as Emails page)
        const response = await dataFetch<EmailsApiResponse>('/emails/all?limit=1000', 'GET');
        console.log("Analytics page fetched emails:", response);
        setEmailsData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dataFetch]);

  // Extract emails from response
  const emails = emailsData?.emails || [];

  // Map risk level function (same as Emails page)
  const mapRiskLevel = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "critical":
      case "malicious":
      case "high":
        return "malicious";
      case "suspicious":
      case "medium":
        return "suspicious";
      case "clean":
      case "low":
      default:
        return "clean";
    }
  };

  // Calculate ThreatMetrics from email data
  const threatMetrics: ThreatMetrics = useMemo(() => {
    if (!emailsData) {
      return {
        total_emails: 0,
        high_risk_emails: 0,
        malicious_count: 0,
        suspicious_count: 0,
        clean_count: 0,
        blocked_count: 0,
        average_risk_score: 0,
        detection_rate: 0,
        false_positive_rate: 0,
      };
    }

    const totalEmails = emailsData.pagination?.total || emails.length;
    const maliciousCount = emails.filter(email =>
      mapRiskLevel(email.threat_summary?.overall_risk || "clean") === "malicious"
    ).length;
    const suspiciousCount = emails.filter(email =>
      mapRiskLevel(email.threat_summary?.overall_risk || "clean") === "suspicious"
    ).length;
    const cleanCount = emails.filter(email =>
      mapRiskLevel(email.threat_summary?.overall_risk || "clean") === "clean"
    ).length;

    const averageRiskScore = emails.length > 0
      ? emails.reduce((sum, email) => sum + email.phishing_score_cti, 0) / emails.length
      : 0;

    return {
      total_emails: totalEmails,
      high_risk_emails: maliciousCount,
      malicious_count: maliciousCount,
      suspicious_count: suspiciousCount,
      clean_count: cleanCount,
      blocked_count: 0, // Not available in current data
      average_risk_score: averageRiskScore,
      detection_rate: totalEmails > 0 ? (maliciousCount / totalEmails) * 100 : 0,
      false_positive_rate: 0, // Not available in current data
    };
  }, [emailsData, emails]);

  // Calculate ThreatTrend data (group by date and filter by period)
  const threatTrends: ThreatTrend[] = useMemo(() => {
    console.log("Calculating threatTrends for selectedPeriod:", selectedPeriod);
    if (!emails.length) return [];

    // Group emails by date
    const dateGroups: { [date: string]: Email[] } = {};
    emails.forEach(email => {
      const date = new Date(email.timestamp).toISOString().split('T')[0];
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(email);
    });

    // Convert to trend data
    let trends = Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayEmails]) => {
        const threatsDetected = dayEmails.filter(email =>
          mapRiskLevel(email.threat_summary?.overall_risk || "clean") === "malicious"
        ).length;

        const averageRisk = dayEmails.length > 0
          ? dayEmails.reduce((sum, email) => sum + email.phishing_score_cti, 0) / dayEmails.length
          : 0;

        return {
          date,
          threats_detected: threatsDetected,
          emails_processed: dayEmails.length,
          blocked_emails: 0, // Not available in current data
          average_risk: averageRisk,
          top_threat_types: [], // Not available in current data
        };
      });

    console.log("Trends date range:", trends.length > 0 ? {
      first: trends[0].date,
      last: trends[trends.length - 1].date,
      allDates: trends.map(t => t.date)
    } : "no trends");

    // Remove period filtering from here - let ThreatTrendAnalysis handle it
    // so the chart updates immediately when period changes

    return trends;
  }, [emails]);

  // Calculate DomainIntelligence data
  const domainIntelligence: DomainIntelligence[] = useMemo(() => {
    if (!emails.length) return [];

    // Group emails by sender domain
    const domainGroups: { [domain: string]: Email[] } = {};
    emails.forEach(email => {
      const domain = email.sender_domain || "unknown";
      if (!domainGroups[domain]) domainGroups[domain] = [];
      domainGroups[domain].push(email);
    });

    // Convert to domain intelligence data
    return Object.entries(domainGroups).map(([domain, domainEmails]) => {
      // Get domain analysis data from the most recent email that has it
      const domainAnalysis = domainEmails
        .filter(email => email.detailed_analysis?.domains?.[domain])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        ?.detailed_analysis?.domains?.[domain];

      // Use domain analysis data if available, otherwise calculate from email threat levels
      const maliciousEnginesCount = domainAnalysis?.stats?.malicious || 0;
      const totalEngines = domainAnalysis?.stats ?
        (domainAnalysis.stats.malicious + domainAnalysis.stats.suspicious + domainAnalysis.stats.harmless + domainAnalysis.stats.undetected) :
        60; // fallback

      // Check if any emails from this domain are malicious (fallback logic)
      const hasMaliciousEmails = domainEmails.some(email =>
        mapRiskLevel(email.threat_summary?.overall_risk || "clean") === "malicious"
      );

      // Calculate reputation score - use domain analysis if available
      const reputationScore = domainAnalysis?.reputation_score ??
        Math.max(0, Math.round(100 - (maliciousEnginesCount / Math.max(totalEngines, 1)) * 100));

      // Get threat level from domain analysis or fallback to email-based logic
      let threatLevel: "clean" | "suspicious" | "malicious" = "clean";
      if (domainAnalysis?.threat_level) {
        // Map domain threat level to our categories
        const domainRisk = domainAnalysis.threat_level;
        if (domainRisk === "high" || domainRisk === "critical") {
          threatLevel = "malicious";
        } else if (domainRisk === "medium") {
          threatLevel = "suspicious";
        }
      } else if (hasMaliciousEmails) {
        threatLevel = "malicious";
      } else if (reputationScore < 70) {
        threatLevel = "suspicious";
      }

      // Get date range for this domain
      const timestamps = domainEmails.map(email => new Date(email.timestamp).getTime());
      const firstSeen = new Date(Math.min(...timestamps)).toISOString();
      const lastSeen = new Date(Math.max(...timestamps)).toISOString();

      return {
        domain,
        reputation_score: reputationScore,
        threat_level: threatLevel,
        first_seen: firstSeen,
        last_seen: lastSeen,
        email_count: domainEmails.length,
        malicious_engines: Array.from({ length: maliciousEnginesCount }, (_, i) => `engine_${i + 1}`),
        total_engines: totalEngines,
        categories: domainAnalysis?.categories || [],
        geographic_distribution: [], // Not available in current data
      };
    });
  }, [emails]);

  // Calculate IPIntelligence data
  const ipIntelligence: IPIntelligence[] = useMemo(() => {
    if (!emails.length) return [];

    // Collect all unique IPs from all emails
    const allIPs = new Set<string>();

    emails.forEach(email => {
      // Add sender IP
      if (email.sender_ip) {
        allIPs.add(email.sender_ip);
      }

      // Add IPs from detailed analysis
      if (email.detailed_analysis?.ips) {
        Object.keys(email.detailed_analysis.ips).forEach(ip => allIPs.add(ip));
      }
    });

    // For each unique IP, collect all associated emails
    const ipToEmailsMap: { [ip: string]: Email[] } = {};

    Array.from(allIPs).forEach(ip => {
      ipToEmailsMap[ip] = emails.filter(email => {
        // Email is associated with this IP if:
        // 1. It's the sender IP, or
        // 2. The IP appears in the detailed analysis
        return email.sender_ip === ip ||
               (email.detailed_analysis?.ips && email.detailed_analysis.ips[ip]);
      });
    });

    // Convert to IP intelligence data
    return Object.entries(ipToEmailsMap).map(([ip, ipEmails]) => {
      // Get IP analysis data from the most recent email that has it
      const ipAnalysis = ipEmails
        .filter(email => email.detailed_analysis?.ips?.[ip])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        ?.detailed_analysis?.ips?.[ip];

      // Use IP analysis data if available, otherwise calculate from email threat levels
      const maliciousEnginesCount = ipAnalysis?.stats?.malicious || 0;
      const totalEngines = ipAnalysis?.stats ?
        (ipAnalysis.stats.malicious + ipAnalysis.stats.suspicious + ipAnalysis.stats.harmless + ipAnalysis.stats.undetected) :
        60; // fallback

      // Check if any emails associated with this IP are malicious
      const hasMaliciousEmails = ipEmails.some(email =>
        mapRiskLevel(email.threat_summary?.overall_risk || "clean") === "malicious"
      );

      // Calculate reputation score - use IP analysis if available
      const reputationScore = ipAnalysis?.reputation_score ??
        Math.max(0, Math.round(100 - (maliciousEnginesCount / Math.max(totalEngines, 1)) * 100));

      // Get threat level from IP analysis or fallback to email-based logic
      let threatLevel: "clean" | "suspicious" | "malicious" = "clean";
      if (ipAnalysis?.threat_level) {
        // Map IP threat level to our categories
        const ipRisk = ipAnalysis.threat_level;
        if (ipRisk === "high" || ipRisk === "critical") {
          threatLevel = "malicious";
        } else if (ipRisk === "medium") {
          threatLevel = "suspicious";
        }
      } else if (hasMaliciousEmails) {
        threatLevel = "malicious";
      } else if (reputationScore < 70) {
        threatLevel = "suspicious";
      }

      // Get date range for this IP across all associated emails
      const timestamps = ipEmails.map(email => new Date(email.timestamp).getTime());
      const firstSeen = new Date(Math.min(...timestamps)).toISOString();
      const lastSeen = new Date(Math.max(...timestamps)).toISOString();

      return {
        ip,
        reputation_score: reputationScore,
        threat_level: threatLevel,
        first_seen: firstSeen,
        last_seen: lastSeen,
        email_count: ipEmails.length,
        malicious_engines: Array.from({ length: maliciousEnginesCount }, (_, i) => `engine_${i + 1}`),
        total_engines: totalEngines,
        categories: ipAnalysis?.categories || [],
        geographic_distribution: [], // Not available in current data
        asn: ipAnalysis?.popularity_ranks ? Object.keys(ipAnalysis.popularity_ranks)[0] : undefined,
        isp: undefined, // Not available in current data
      };
    });
  }, [emails]);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await dataFetch<EmailsApiResponse>('/emails/all?limit=1000', 'GET');
      setEmailsData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-base">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 text-center">
          <BarChart3 size={48} className="text-red-500" />
          <h2 className="text-xl font-semibold text-white">Failed to Load Analytics</h2>
          <p className="text-gray-400">{error}</p>
          <button
            className="px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
            onClick={refetch}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden box-border">
      <div className="w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-gray-700 mb-6 lg:mb-8">
        <div className="flex items-center gap-4">
          <BarChart3 className="text-green-400 shrink-0" size={28} />
          <div>
            <h1 className="m-0 mb-1 text-2xl lg:text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="m-0 text-gray-400 text-sm">
              Comprehensive threat intelligence and security analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            className="px-4 lg:px-6 py-2 bg-green-400 text-black border-none rounded-md text-sm font-medium cursor-pointer hover:bg-green-300 transition-colors"
            onClick={refetch}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 lg:p-6">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{threatMetrics.total_emails}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Total Emails</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">●</span>
            <span className="text-xs text-gray-500">Analyzed</span>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 sm:p-4 lg:p-6">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{threatMetrics.malicious_count}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Malicious</div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">●</span>
            <span className="text-xs text-gray-500">High Risk</span>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-3 sm:p-4 lg:p-6">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{threatMetrics.suspicious_count}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Suspicious</div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">●</span>
            <span className="text-xs text-gray-500">Medium Risk</span>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-500 rounded-lg p-3 sm:p-4 lg:p-6">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{threatMetrics.clean_count}</div>
          <div className="text-sm font-medium text-gray-400 mb-2">Clean</div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">●</span>
            <span className="text-xs text-gray-500">Safe</span>
          </div>
        </div>
      </div>

      {/* Analytics Components */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Threat Intelligence Chart */}
        <div className="w-full">
          <ThreatIntelligenceChart
            data={threatMetrics}
            loading={loading}
          />
        </div>

        {/* Threat Trend Analysis */}
        <div className="w-full">
          <ThreatTrendAnalysis
            data={threatTrends}
            loading={loading}
            onPeriodChange={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />
        </div>
        {/* Email Intelligence Table */}
        <div className="w-full">
          <EmailIntelligenceTable
            loading={loading}
          />
        </div>

        {/* Domain Intelligence Table */}
        <div className="w-full">
          <DomainIntelligenceTable
            data={domainIntelligence}
            loading={loading}
          />
        </div>

        {/* IP Intelligence Table */}
        <div className="w-full">
          <IPIntelligenceTable
            data={ipIntelligence}
            loading={loading}
          />
        </div>

      </div>
    </div>
  </div>
);
}
