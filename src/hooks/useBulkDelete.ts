// Custom hook for bulk deleting emails

import { useState, useCallback } from "react";
import { emailService } from "../services/emailService";
import { handleApiError } from "../utils/errorUtils";
import type { BulkDeleteEmailsResponse, AsyncState } from "../models/email";

interface UseBulkDeleteReturn extends AsyncState<BulkDeleteEmailsResponse> {
  bulkDeleteEmails: (ids: number[]) => Promise<void>;
  reset: () => void;
}

export function useBulkDelete(): UseBulkDeleteReturn {
  const [state, setState] = useState<AsyncState<BulkDeleteEmailsResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const bulkDeleteEmails = useCallback(async (ids: number[]) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await emailService.bulkDeleteEmails(ids);
      setState({
        data: response,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = handleApiError(error, "bulkDeleteEmails");
      setState({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    bulkDeleteEmails,
    reset,
  };
}
