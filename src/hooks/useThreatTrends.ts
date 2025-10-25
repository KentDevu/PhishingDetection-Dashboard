// Custom hook for threat trend data - CLIENT-SIDE COMPUTATION

import { useState, useEffect, useCallback } from "react";
import { clientAnalyticsService } from "../services/clientAnalyticsService";
import { useEmails } from "./useEmails";
import type { ThreatTrend } from "../models/analytics";

interface UseThreatTrendsReturn {
  data: ThreatTrend[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  changePeriod: (period: string) => void;
}

export function useThreatTrends(
  initialPeriod: string = "30d"
): UseThreatTrendsReturn {
  const { data: emails, loading, error, refetch: refetchEmails } = useEmails();
  const [period, setPeriod] = useState<string>(initialPeriod);
  const [data, setData] = useState<ThreatTrend[] | null>(null);

  // Compute trends from emails
  useEffect(() => {
    if (!emails || emails.length === 0) {
      setData(null);
      return;
    }

    const days = parseInt(period.replace("d", "")) || 30;
    const trends = clientAnalyticsService.computeThreatTrends(emails, days);
    setData(trends);
  }, [emails, period]);

  const refetch = useCallback(() => {
    refetchEmails();
  }, [refetchEmails]);

  const changePeriod = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
  }, []);

  return {
    data,
    loading,
    error: error ? String(error) : null,
    refetch,
    changePeriod,
  };
}
