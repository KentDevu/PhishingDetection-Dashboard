// Custom hook for analytics dashboard data

import { useState, useEffect, useCallback } from "react";
import { analyticsService } from "../services/analyticsService";
import { handleApiError } from "../utils/errorUtils";
import type {
  AnalyticsDashboardData,
  AnalyticsFilters,
} from "../models/analytics";
import type { AsyncState } from "../models/email";

interface UseAnalyticsDashboardReturn
  extends AsyncState<AnalyticsDashboardData> {
  refetch: () => Promise<void>;
  applyFilters: (filters: AnalyticsFilters) => Promise<void>;
}

export function useAnalyticsDashboard(
  initialFilters?: AnalyticsFilters
): UseAnalyticsDashboardReturn {
  const [state, setState] = useState<AsyncState<AnalyticsDashboardData>>({
    data: null,
    loading: false,
    error: null,
  });

  const [currentFilters, setCurrentFilters] = useState<
    AnalyticsFilters | undefined
  >(initialFilters);

  const fetchDashboardData = useCallback(async (filters?: AnalyticsFilters) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await analyticsService.getDashboardData(filters);
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = handleApiError(error, "fetchAnalyticsDashboard");
      setState({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchDashboardData(currentFilters);
  }, [fetchDashboardData, currentFilters]);

  const applyFilters = useCallback(
    async (filters: AnalyticsFilters) => {
      setCurrentFilters(filters);
      await fetchDashboardData(filters);
    },
    [fetchDashboardData]
  );

  useEffect(() => {
    fetchDashboardData(currentFilters);
  }, [fetchDashboardData, currentFilters]);

  return {
    ...state,
    refetch,
    applyFilters,
  };
}
