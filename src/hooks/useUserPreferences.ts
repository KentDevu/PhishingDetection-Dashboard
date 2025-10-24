// Custom hook for user preferences management

import { useState, useEffect, useCallback } from "react";
import { settingsService } from "../services/settingsService";
import { handleApiError } from "../utils/errorUtils";
import type { UserPreferences, SettingsState } from "../models/settings";

interface UseUserPreferencesReturn extends SettingsState<UserPreferences> {
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const [state, setState] = useState<SettingsState<UserPreferences>>({
    data: null,
    loading: false,
    error: null,
    isDirty: false,
    lastSaved: null,
  });

  const fetchPreferences = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const preferences = await settingsService.getUserPreferences();
      setState({
        data: preferences,
        loading: false,
        error: null,
        isDirty: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error) {
      const apiError = handleApiError(error, "fetchUserPreferences");
      setState({
        data: null,
        loading: false,
        error: apiError.error,
        isDirty: false,
        lastSaved: null,
      });
    }
  }, []);

  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const updated = await settingsService.updateUserPreferences(
          preferences
        );
        setState({
          data: updated,
          loading: false,
          error: null,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        });
      } catch (error) {
        const apiError = handleApiError(error, "updateUserPreferences");
        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError.error,
        }));
        throw error;
      }
    },
    []
  );

  const resetToDefaults = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await settingsService.resetToDefaults(["user_preferences"]);
      await fetchPreferences(); // Refetch after reset
    } catch (error) {
      const apiError = handleApiError(error, "resetUserPreferences");
      setState((prev) => ({
        ...prev,
        loading: false,
        error: apiError.error,
      }));
      throw error;
    }
  }, [fetchPreferences]);

  const refetch = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    ...state,
    updatePreferences,
    resetToDefaults,
    refetch,
  };
}
