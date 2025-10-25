// Custom hook for threat metrics - CLIENT-SIDE COMPUTATION

import { useState, useEffect, useCallback } from "react";
import {
  clientAnalyticsService,
  type ClientAnalyticsFilters,
} from "../services/clientAnalyticsService";
import { useEmails } from "./useEmails";
import type { ThreatMetrics } from "../models/analytics";

interface UseThreatMetricsReturn {
  data: ThreatMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateDateRange: (dateRange: { start: string; end: string }) => void;
}

export function useThreatMetrics(initialDateRange?: {
  start: string;
  end: string;
}): UseThreatMetricsReturn {
  const { data: emails, loading, error, refetch: refetchEmails } = useEmails();
  const [dateRange, setDateRange] = useState<
    { start: string; end: string } | undefined
  >(initialDateRange);
  const [data, setData] = useState<ThreatMetrics | null>(null);

  // Compute metrics from emails
  useEffect(() => {
    if (!emails || emails.length === 0) {
      setData(null);
      return;
    }

    const filters: ClientAnalyticsFilters | undefined = dateRange
      ? { date_range: dateRange }
      : undefined;

    const filteredEmails = filters
      ? clientAnalyticsService.applyFilters(emails, filters)
      : emails;

    const metrics = clientAnalyticsService.computeThreatMetrics(filteredEmails);
    setData(metrics);
  }, [emails, dateRange]);

  const refetch = useCallback(() => {
    refetchEmails();
  }, [refetchEmails]);

  const updateDateRange = useCallback(
    (newDateRange: { start: string; end: string }) => {
      setDateRange(newDateRange);
    },
    []
  );

  return {
    data,
    loading,
    error: error ? String(error) : null,
    refetch,
    updateDateRange,
  };
}
