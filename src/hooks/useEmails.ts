// Custom hook for fetching emails with loading and error states

import { useState, useEffect, useCallback } from "react";
import { emailService, type EmailFilterParams } from "../services/emailService";
import { handleApiError } from "../utils/errorUtils";
import type { Email } from "../models/email";
import type { AsyncState } from "../models/email";

interface UseEmailsReturn extends AsyncState<Email[]> {
  refetch: () => Promise<void>;
  searchEmails: (
    searchTerm: string,
    options?: {
      threatLevel?: string;
      confidence?: string;
      dateRange?: { start: string; end: string };
    }
  ) => Promise<void>;
  filterEmails: (filters: EmailFilterParams) => Promise<void>;
  clearFilters: () => Promise<void>;
  currentFilters: EmailFilterParams | null;
}

export function useEmails(initialFilters?: EmailFilterParams): UseEmailsReturn {
  const [state, setState] = useState<AsyncState<Email[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const [currentFilters, setCurrentFilters] =
    useState<EmailFilterParams | null>(initialFilters || null);

  const fetchEmails = useCallback(async (filters?: EmailFilterParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const emails = await emailService.getAllEmails(filters);
      console.log("useEmails: emails fetched", emails);
      setState({
        data: emails,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = handleApiError(error, "fetchEmails");
      setState({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchEmails(currentFilters || undefined);
  }, [fetchEmails, currentFilters]);

  const searchEmails = useCallback(
    async (
      searchTerm: string,
      options?: {
        threatLevel?: string;
        confidence?: string;
        dateRange?: { start: string; end: string };
      }
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const emails = await emailService.searchEmails(searchTerm, {
          threatLevel: options?.threatLevel as any,
          confidence: options?.confidence as any,
          dateRange: options?.dateRange,
        });

        const searchFilters: EmailFilterParams = {
          ...(searchTerm.includes("@")
            ? { sender: searchTerm }
            : { subject: searchTerm }),
          ...(options?.threatLevel && { threat_level: options.threatLevel }),
          ...(options?.confidence && {
            cti_confidence: options.confidence as any,
          }),
          ...(options?.dateRange && {
            start_date: options.dateRange.start,
            end_date: options.dateRange.end,
          }),
        };

        setCurrentFilters(searchFilters);
        setState({
          data: emails,
          loading: false,
          error: null,
        });
      } catch (error) {
        const apiError = handleApiError(error, "searchEmails");
        setState({
          data: null,
          loading: false,
          error: apiError,
        });
      }
    },
    []
  );

  const filterEmails = useCallback(
    async (filters: EmailFilterParams) => {
      setCurrentFilters(filters);
      await fetchEmails(filters);
    },
    [fetchEmails]
  );

  const clearFilters = useCallback(async () => {
    setCurrentFilters(null);
    await fetchEmails();
  }, [fetchEmails]);

  // Initial fetch
  useEffect(() => {
    fetchEmails(currentFilters || undefined);
  }, [fetchEmails]);

  return {
    ...state,
    refetch,
    searchEmails,
    filterEmails,
    clearFilters,
    currentFilters,
  };
}
