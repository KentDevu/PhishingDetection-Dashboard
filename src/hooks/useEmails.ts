// Custom hook for fetching emails with loading and error states

import { useState, useEffect, useCallback } from "react";
import { emailService } from "../services/emailService";
import { handleApiError } from "../utils/errorUtils";
import type { Email, AsyncState } from "../models/email";

interface UseEmailsReturn extends AsyncState<Email[]> {
  refetch: () => Promise<void>;
}

export function useEmails(): UseEmailsReturn {
  const [state, setState] = useState<AsyncState<Email[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchEmails = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const emails = await emailService.getAllEmails();
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
    await fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return {
    ...state,
    refetch,
  };
}
