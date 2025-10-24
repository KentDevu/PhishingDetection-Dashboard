// Custom hook for system settings management (admin only)

import { useState, useEffect, useCallback } from "react";
import { settingsService } from "../services/settingsService";
import { handleApiError } from "../utils/errorUtils";
import type {
  ApplicationSettings,
  SystemConfiguration,
  SecuritySettings,
  SettingsState,
} from "../models/settings";

interface UseSystemSettingsReturn {
  allSettings: SettingsState<ApplicationSettings>;
  systemConfig: SettingsState<SystemConfiguration>;
  securitySettings: SettingsState<SecuritySettings>;
  isAdmin: boolean;
  permissions: string[];
  updateSystemConfig: (config: Partial<SystemConfiguration>) => Promise<void>;
  updateSecuritySettings: (
    settings: Partial<SecuritySettings>
  ) => Promise<void>;
  testIntegration: (
    type: string,
    config: any
  ) => Promise<{ success: boolean; message: string }>;
  getSystemStatus: () => Promise<void>;
  systemStatus: {
    status: "healthy" | "warning" | "critical" | null;
    checks: { name: string; status: "pass" | "fail"; message: string }[];
    lastCheck: string | null;
  };
  refetchAll: () => Promise<void>;
}

export function useSystemSettings(): UseSystemSettingsReturn {
  const [allSettings, setAllSettings] = useState<
    SettingsState<ApplicationSettings>
  >({
    data: null,
    loading: false,
    error: null,
    isDirty: false,
    lastSaved: null,
  });

  const [systemConfig, setSystemConfig] = useState<
    SettingsState<SystemConfiguration>
  >({
    data: null,
    loading: false,
    error: null,
    isDirty: false,
    lastSaved: null,
  });

  const [securitySettings, setSecuritySettings] = useState<
    SettingsState<SecuritySettings>
  >({
    data: null,
    loading: false,
    error: null,
    isDirty: false,
    lastSaved: null,
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  const [systemStatus, setSystemStatus] = useState<{
    status: "healthy" | "warning" | "critical" | null;
    checks: { name: string; status: "pass" | "fail"; message: string }[];
    lastCheck: string | null;
  }>({
    status: null,
    checks: [],
    lastCheck: null,
  });

  // Check admin permissions
  const checkPermissions = useCallback(async () => {
    try {
      const { is_admin, permissions: userPermissions } =
        await settingsService.checkAdminPermissions();
      setIsAdmin(is_admin);
      setPermissions(userPermissions);
    } catch (error) {
      console.error("Failed to check permissions:", error);
      setIsAdmin(false);
      setPermissions([]);
    }
  }, []);

  // Fetch all settings
  const fetchAllSettings = useCallback(async () => {
    if (!isAdmin) return;

    setAllSettings((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const settings = await settingsService.getAllSettings();
      setAllSettings({
        data: settings,
        loading: false,
        error: null,
        isDirty: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error) {
      const apiError = handleApiError(error, "fetchAllSettings");
      setAllSettings({
        data: null,
        loading: false,
        error: apiError.error,
        isDirty: false,
        lastSaved: null,
      });
    }
  }, [isAdmin]);

  // Fetch system configuration
  const fetchSystemConfig = useCallback(async () => {
    if (!isAdmin) return;

    setSystemConfig((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const config = await settingsService.getSystemConfiguration();
      setSystemConfig({
        data: config,
        loading: false,
        error: null,
        isDirty: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error) {
      const apiError = handleApiError(error, "fetchSystemConfig");
      setSystemConfig({
        data: null,
        loading: false,
        error: apiError.error,
        isDirty: false,
        lastSaved: null,
      });
    }
  }, [isAdmin]);

  // Fetch security settings
  const fetchSecuritySettings = useCallback(async () => {
    if (!isAdmin) return;

    setSecuritySettings((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const settings = await settingsService.getSecuritySettings();
      setSecuritySettings({
        data: settings,
        loading: false,
        error: null,
        isDirty: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error) {
      const apiError = handleApiError(error, "fetchSecuritySettings");
      setSecuritySettings({
        data: null,
        loading: false,
        error: apiError.error,
        isDirty: false,
        lastSaved: null,
      });
    }
  }, [isAdmin]);

  // Update system configuration
  const updateSystemConfig = useCallback(
    async (config: Partial<SystemConfiguration>) => {
      setSystemConfig((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const updated = await settingsService.updateSystemConfiguration(config);
        setSystemConfig({
          data: updated,
          loading: false,
          error: null,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        });
      } catch (error) {
        const apiError = handleApiError(error, "updateSystemConfig");
        setSystemConfig((prev) => ({
          ...prev,
          loading: false,
          error: apiError.error,
        }));
        throw error;
      }
    },
    []
  );

  // Update security settings
  const updateSecuritySettings = useCallback(
    async (settings: Partial<SecuritySettings>) => {
      setSecuritySettings((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const updated = await settingsService.updateSecuritySettings(settings);
        setSecuritySettings({
          data: updated,
          loading: false,
          error: null,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        });
      } catch (error) {
        const apiError = handleApiError(error, "updateSecuritySettings");
        setSecuritySettings((prev) => ({
          ...prev,
          loading: false,
          error: apiError.error,
        }));
        throw error;
      }
    },
    []
  );

  // Test integration
  const testIntegration = useCallback(async (type: string, config: any) => {
    return await settingsService.testIntegration(type, config);
  }, []);

  // Get system status
  const getSystemStatus = useCallback(async () => {
    try {
      const status = await settingsService.getSystemStatus();
      setSystemStatus({
        status: status.status,
        checks: status.checks,
        lastCheck: status.last_check,
      });
    } catch (error) {
      console.error("Failed to get system status:", error);
      setSystemStatus({
        status: "critical",
        checks: [
          {
            name: "API Connection",
            status: "fail",
            message: "Unable to fetch system status",
          },
        ],
        lastCheck: new Date().toISOString(),
      });
    }
  }, []);

  // Refetch all data
  const refetchAll = useCallback(async () => {
    await checkPermissions();
    if (isAdmin) {
      await Promise.all([
        fetchAllSettings(),
        fetchSystemConfig(),
        fetchSecuritySettings(),
        getSystemStatus(),
      ]);
    }
  }, [
    isAdmin,
    fetchAllSettings,
    fetchSystemConfig,
    fetchSecuritySettings,
    getSystemStatus,
    checkPermissions,
  ]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllSettings();
      fetchSystemConfig();
      fetchSecuritySettings();
      getSystemStatus();
    }
  }, [
    isAdmin,
    fetchAllSettings,
    fetchSystemConfig,
    fetchSecuritySettings,
    getSystemStatus,
  ]);

  return {
    allSettings,
    systemConfig,
    securitySettings,
    isAdmin,
    permissions,
    updateSystemConfig,
    updateSecuritySettings,
    testIntegration,
    getSystemStatus,
    systemStatus,
    refetchAll,
  };
}
