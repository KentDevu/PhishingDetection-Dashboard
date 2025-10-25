// Client-side Analytics Service - Computes metrics from email data
// No API calls - all computation from GET /api/emails/all response

import type { Email } from "../models/email";
import type {
  ThreatMetrics,
  ThreatTrend,
  DomainIntelligence,
} from "../models/analytics";

// Simplified filters for client-side computation
export interface ClientAnalyticsFilters {
  date_range?: { start: string; end: string };
  threat_levels?: Array<
    "clean" | "suspicious" | "high" | "malicious" | "critical"
  >;
  domains?: string[];
}

export class ClientAnalyticsService {
  /**
   * Computes threat metrics and KPIs from emails
   * Maps Email.threat_summary.overall_risk to analytics threat levels
   */
  computeThreatMetrics(emails: Email[]): ThreatMetrics {
    // Count by threat levels - map Email risk to analytics levels
    const maliciousCount = emails.filter(
      (e) =>
        e.threat_summary.overall_risk === "malicious" ||
        e.threat_summary.overall_risk === "critical"
    ).length;

    const suspiciousCount = emails.filter(
      (e) =>
        e.threat_summary.overall_risk === "suspicious" ||
        e.threat_summary.overall_risk === "high"
    ).length;

    const cleanCount = emails.filter(
      (e) => e.threat_summary.overall_risk === "clean"
    ).length;

    const total = emails.length;
    const totalThreats = maliciousCount + suspiciousCount;

    return {
      total_emails: total,
      malicious_count: maliciousCount,
      suspicious_count: suspiciousCount,
      clean_count: cleanCount,
      blocked_count: maliciousCount, // Critical/malicious emails should be blocked
      average_risk_score:
        total > 0
          ? emails.reduce((sum, e) => sum + e.phishing_score_cti, 0) / total
          : 0,
      detection_rate: total > 0 ? (totalThreats / total) * 100 : 0,
      false_positive_rate: 0, // Would need ground truth data to calculate
    };
  }

  /**
   * Computes threat trends over time from emails
   * @param emails - Array of email objects
   * @param days - Number of days to analyze (default: 30)
   */
  computeThreatTrends(emails: Email[], days: number = 30): ThreatTrend[] {
    const now = new Date();
    const trends: ThreatTrend[] = [];

    // Group emails by day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayEmails = emails.filter((e) => {
        const emailDate = new Date(e.timestamp);
        return emailDate >= date && emailDate < nextDate;
      });

      const threatsDetected = dayEmails.filter(
        (e) =>
          e.threat_summary.overall_risk === "malicious" ||
          e.threat_summary.overall_risk === "critical" ||
          e.threat_summary.overall_risk === "suspicious" ||
          e.threat_summary.overall_risk === "high"
      ).length;

      const blockedEmails = dayEmails.filter(
        (e) =>
          e.threat_summary.overall_risk === "malicious" ||
          e.threat_summary.overall_risk === "critical"
      ).length;

      const avgRisk =
        dayEmails.length > 0
          ? dayEmails.reduce((sum, e) => sum + e.phishing_score_cti, 0) /
            dayEmails.length
          : 0;

      // Extract top threat types from cti_flags
      const threatTypeCounts = new Map<string, number>();
      dayEmails.forEach((email) => {
        email.cti_flags.forEach((flag) => {
          threatTypeCounts.set(flag, (threatTypeCounts.get(flag) || 0) + 1);
        });
      });

      const topThreatTypes = Array.from(threatTypeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type);

      trends.push({
        date: date.toISOString().split("T")[0],
        threats_detected: threatsDetected,
        emails_processed: dayEmails.length,
        blocked_emails: blockedEmails,
        average_risk: avgRisk,
        top_threat_types: topThreatTypes,
      });
    }

    return trends;
  }

  /**
   * Computes domain intelligence from emails
   * Analyzes sender domains and their threat levels
   */
  computeDomainIntelligence(
    emails: Email[],
    limit: number = 50
  ): DomainIntelligence[] {
    const domainMap = new Map<
      string,
      {
        emails: Email[];
        maliciousCount: number;
        suspiciousCount: number;
      }
    >();

    // Group emails by sender domain
    emails.forEach((email) => {
      const domain = email.sender_domain;
      if (!domain) return;

      if (!domainMap.has(domain)) {
        domainMap.set(domain, {
          emails: [],
          maliciousCount: 0,
          suspiciousCount: 0,
        });
      }

      const domainInfo = domainMap.get(domain)!;
      domainInfo.emails.push(email);

      if (
        email.threat_summary.overall_risk === "malicious" ||
        email.threat_summary.overall_risk === "critical"
      ) {
        domainInfo.maliciousCount++;
      } else if (
        email.threat_summary.overall_risk === "suspicious" ||
        email.threat_summary.overall_risk === "high"
      ) {
        domainInfo.suspiciousCount++;
      }
    });

    // Convert to DomainIntelligence array
    const domainIntelligence: DomainIntelligence[] = Array.from(
      domainMap.entries()
    ).map(([domain, info]) => {
      const emailCount = info.emails.length;
      const threatCount = info.maliciousCount + info.suspiciousCount;

      // Calculate reputation score (0-100)
      const reputationScore =
        emailCount > 0 ? ((emailCount - threatCount) / emailCount) * 100 : 50;

      // Determine threat level
      let threatLevel: "critical" | "high" | "medium" | "low" | "clean" =
        "clean";
      const threatPercentage = (threatCount / emailCount) * 100;

      if (info.maliciousCount > 0 || threatPercentage > 75) {
        threatLevel = "critical";
      } else if (threatPercentage > 50) {
        threatLevel = "high";
      } else if (threatPercentage > 25) {
        threatLevel = "medium";
      } else if (threatPercentage > 0) {
        threatLevel = "low";
      }

      // Find domain analysis from most recent email
      const latestEmail = info.emails.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      const domainAnalysis = latestEmail?.detailed_analysis?.domains?.[domain];

      // Get malicious engines count
      const maliciousEngines =
        domainAnalysis?.malicious_engines.map((e) => e.engine) || [];
      const totalEngines = domainAnalysis
        ? domainAnalysis.stats.malicious +
          domainAnalysis.stats.suspicious +
          domainAnalysis.stats.harmless +
          domainAnalysis.stats.undetected
        : 0;

      // Get first and last seen timestamps
      const timestamps = info.emails.map((e) =>
        new Date(e.timestamp).getTime()
      );
      const firstSeen = new Date(Math.min(...timestamps)).toISOString();
      const lastSeen = new Date(Math.max(...timestamps)).toISOString();

      return {
        domain,
        reputation_score: reputationScore,
        threat_level: threatLevel,
        first_seen: firstSeen,
        last_seen: lastSeen,
        email_count: emailCount,
        malicious_engines: maliciousEngines,
        total_engines: totalEngines,
        categories: domainAnalysis?.categories || [],
        geographic_distribution: [], // Would need IP geolocation data
      };
    });

    // Sort by threat level (critical first) and reputation score (low first)
    return domainIntelligence
      .sort((a, b) => {
        const threatOrder = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
          clean: 4,
        };
        if (a.threat_level !== b.threat_level) {
          return threatOrder[a.threat_level] - threatOrder[b.threat_level];
        }
        return a.reputation_score - b.reputation_score;
      })
      .slice(0, limit);
  }

  /**
   * Apply filters to email list
   */
  applyFilters(emails: Email[], filters?: ClientAnalyticsFilters): Email[] {
    if (!filters) return emails;

    let filtered = [...emails];

    // Date range filter
    if (filters.date_range) {
      const start = new Date(filters.date_range.start);
      const end = new Date(filters.date_range.end);
      end.setHours(23, 59, 59, 999); // Include full end date

      filtered = filtered.filter((e) => {
        const date = new Date(e.timestamp);
        return date >= start && date <= end;
      });
    }

    // Threat level filter
    if (filters.threat_levels && filters.threat_levels.length > 0) {
      filtered = filtered.filter((e) =>
        filters.threat_levels!.includes(e.threat_summary.overall_risk)
      );
    }

    // Domain filter
    if (filters.domains && filters.domains.length > 0) {
      filtered = filtered.filter((e) =>
        filters.domains!.includes(e.sender_domain)
      );
    }

    return filtered;
  }

  /**
   * Get summary statistics from emails
   */
  getSummaryStats(emails: Email[]) {
    return {
      total: emails.length,
      critical: emails.filter(
        (e) => e.threat_summary.overall_risk === "critical"
      ).length,
      malicious: emails.filter(
        (e) => e.threat_summary.overall_risk === "malicious"
      ).length,
      high: emails.filter((e) => e.threat_summary.overall_risk === "high")
        .length,
      suspicious: emails.filter(
        (e) => e.threat_summary.overall_risk === "suspicious"
      ).length,
      clean: emails.filter((e) => e.threat_summary.overall_risk === "clean")
        .length,
      avgPhishingScore:
        emails.length > 0
          ? emails.reduce((sum, e) => sum + e.phishing_score_cti, 0) /
            emails.length
          : 0,
    };
  }
}

// Singleton instance
export const clientAnalyticsService = new ClientAnalyticsService();
