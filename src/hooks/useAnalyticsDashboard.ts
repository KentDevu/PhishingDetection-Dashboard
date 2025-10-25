// Custom hook for analytics dashboard data - CLIENT-SIDE COMPUTATION

import { useState, useEffect, useCallback } from "react";
import {
  clientAnalyticsService,
  type ClientAnalyticsFilters,
} from "../services/clientAnalyticsService";
import { useEmails } from "./useEmails";
import type {
  ThreatMetrics,
  ThreatTrend,
  DomainIntelligence,
} from "../models/analytics";

interface AnalyticsDashboardData {
  metrics: ThreatMetrics;
  trends: ThreatTrend[];
  domains: DomainIntelligence[];
}

interface UseAnalyticsDashboardReturn {
  data: AnalyticsDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  applyFilters: (filters: ClientAnalyticsFilters) => void;
}

export function useAnalyticsDashboard(
  initialFilters?: ClientAnalyticsFilters
): UseAnalyticsDashboardReturn {
  const {
    data: emails,
    loading: emailsLoading,
    error: emailsError,
    refetch: refetchEmails,
  } = useEmails();
  const [filters, setFilters] = useState<ClientAnalyticsFilters | undefined>(
    initialFilters
  );
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);

  // Compute analytics data from emails
  useEffect(() => {
    if (!emails || emails.length === 0) {
      setData(null);
      return;
    }

    const filteredEmails = filters
      ? clientAnalyticsService.applyFilters(emails, filters)
      : emails;

    const metrics = clientAnalyticsService.computeThreatMetrics(filteredEmails);
    const trends = clientAnalyticsService.computeThreatTrends(
      filteredEmails,
      30
    );
    const domains = clientAnalyticsService.computeDomainIntelligence(
      filteredEmails,
      50
    );

    setData({
      metrics,
      trends,
      domains,
    });
  }, [emails, filters]);

  const applyFilters = useCallback((newFilters: ClientAnalyticsFilters) => {
    setFilters(newFilters);
  }, []);

  const refetch = useCallback(() => {
    refetchEmails();
  }, [refetchEmails]);

  return {
    data,
    loading: emailsLoading,
    error: emailsError ? String(emailsError) : null,
    refetch,
    applyFilters,
  };
}
