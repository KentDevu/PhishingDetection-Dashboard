// Custom hook for threat metrics

import { useState, useEffect, useCallback } from "react";
import { analyticsService } from "../services/analyticsService";
import { handleApiError } from "../utils/errorUtils";
import type { ThreatMetrics } from "../models/analytics";
import type { AsyncState } from "../models/email";

interface UseThreatMetricsReturn extends AsyncState<ThreatMetrics> {
  refetch: () => Promise<void>;
  updateDateRange: (dateRange: { start: string; end: string }) => Promise<void>;
}

export function useThreatMetrics(initialDateRange?: {
  start: string;
  end: string;
}): UseThreatMetricsReturn {
  const [state, setState] = useState<AsyncState<ThreatMetrics>>({
    data: null,
    loading: false,
    error: null,
  });

  const [dateRange, setDateRange] = useState<
    { start: string; end: string } | undefined
  >(initialDateRange);

  const fetchMetrics = useCallback(
    async (range?: { start: string; end: string }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const metrics = await analyticsService.getThreatMetrics(range);
        setState({
          data: metrics,
          loading: false,
          error: null,
        });
      } catch (error) {
        const apiError = handleApiError(error, "fetchThreatMetrics");
        setState({
          data: null,
          loading: false,
          error: apiError,
        });
      }
    },
    []
  );

  const refetch = useCallback(async () => {
    await fetchMetrics(dateRange);
  }, [fetchMetrics, dateRange]);

  const updateDateRange = useCallback(
    async (newDateRange: { start: string; end: string }) => {
      setDateRange(newDateRange);
      await fetchMetrics(newDateRange);
    },
    [fetchMetrics]
  );

  useEffect(() => {
    fetchMetrics(dateRange);
  }, [fetchMetrics, dateRange]);

  return {
    ...state,
    refetch,
    updateDateRange,
  };
}
