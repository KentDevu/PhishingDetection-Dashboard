// Custom hook for deleting a single email

import { useState, useCallback } from "react";
import { emailService } from "../services/emailService";
import { handleApiError } from "../utils/errorUtils";
import type { DeleteEmailResponse, AsyncState } from "../models/email";

interface UseDeleteEmailReturn extends AsyncState<DeleteEmailResponse> {
  deleteEmail: (id: number) => Promise<void>;
  reset: () => void;
}

export function useDeleteEmail(): UseDeleteEmailReturn {
  const [state, setState] = useState<AsyncState<DeleteEmailResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteEmail = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await emailService.deleteEmail(id);
      setState({
        data: response,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = handleApiError(error, "deleteEmail");
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
    deleteEmail,
    reset,
  };
}
