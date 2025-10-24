// Custom hook for threat trend data

import { useState, useEffect, useCallback } from "react";
import { analyticsService } from "../services/analyticsService";
import { handleApiError } from "../utils/errorUtils";
import type { ThreatTrend } from "../models/analytics";
import type { AsyncState } from "../models/email";

interface UseThreatTrendsReturn extends AsyncState<ThreatTrend[]> {
  refetch: () => Promise<void>;
  changePeriod: (period: string) => Promise<void>;
}

export function useThreatTrends(
  initialPeriod: string = "30d"
): UseThreatTrendsReturn {
  const [state, setState] = useState<AsyncState<ThreatTrend[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const [period, setPeriod] = useState<string>(initialPeriod);

  const fetchTrends = useCallback(async (selectedPeriod: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const trends = await analyticsService.getThreatTrends(selectedPeriod);
      setState({
        data: trends,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = handleApiError(error, "fetchThreatTrends");
      setState({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchTrends(period);
  }, [fetchTrends, period]);

  const changePeriod = useCallback(
    async (newPeriod: string) => {
      setPeriod(newPeriod);
      await fetchTrends(newPeriod);
    },
    [fetchTrends]
  );

  useEffect(() => {
    fetchTrends(period);
  }, [fetchTrends, period]);

  return {
    ...state,
    refetch,
    changePeriod,
  };
}
