// Settings API Service - Handles application configuration and user preferences

import { apiService } from "./apiService";
import type {
  ApplicationSettings,
  UserPreferences,
  NotificationSettings,
  SecuritySettings,
  SystemConfiguration,
  IntegrationSettings,
  SettingsResponse,
  SettingsUpdateRequest,
  SettingsValidationResponse,
  SettingsExport,
  SettingsImport,
  SettingsAuditEntry,
} from "../models/settings";
import type { ApiError } from "../models/email";

export class SettingsService {
  private readonly endpoint = "/settings";

  /**
   * Fetches all application settings
   * @returns Promise resolving to complete settings object
   */
  async getAllSettings(): Promise<ApplicationSettings> {
    try {
      const response = await apiService.get<
        SettingsResponse<ApplicationSettings>
      >(`${this.endpoint}/all`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches user preferences
   * @returns Promise resolving to user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiService.get<SettingsResponse<UserPreferences>>(
        `${this.endpoint}/user-preferences`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user preferences:", error);
      throw error as ApiError;
    }
  }

  /**
   * Updates user preferences
   * @param preferences - Updated user preferences
   * @returns Promise resolving to update response
   */
  async updateUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const request: SettingsUpdateRequest<UserPreferences> = {
        settings: preferences,
      };

      const response = await apiService.get<SettingsResponse<UserPreferences>>(
        `${this.endpoint}/user-preferences`,
        {
          method: "PUT",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update user preferences:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches notification settings
   * @returns Promise resolving to notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiService.get<
        SettingsResponse<NotificationSettings>
      >(`${this.endpoint}/notifications`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Updates notification settings
   * @param settings - Updated notification settings
   * @returns Promise resolving to update response
   */
  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    try {
      const request: SettingsUpdateRequest<NotificationSettings> = {
        settings: settings,
      };

      const response = await apiService.get<
        SettingsResponse<NotificationSettings>
      >(`${this.endpoint}/notifications`, {
        method: "PUT",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches security settings (admin only)
   * @returns Promise resolving to security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await apiService.get<SettingsResponse<SecuritySettings>>(
        `${this.endpoint}/security`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch security settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Updates security settings (admin only)
   * @param settings - Updated security settings
   * @returns Promise resolving to update response
   */
  async updateSecuritySettings(
    settings: Partial<SecuritySettings>
  ): Promise<SecuritySettings> {
    try {
      const request: SettingsUpdateRequest<SecuritySettings> = {
        settings: settings,
      };

      const response = await apiService.get<SettingsResponse<SecuritySettings>>(
        `${this.endpoint}/security`,
        {
          method: "PUT",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update security settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches system configuration (admin only)
   * @returns Promise resolving to system configuration
   */
  async getSystemConfiguration(): Promise<SystemConfiguration> {
    try {
      const response = await apiService.get<
        SettingsResponse<SystemConfiguration>
      >(`${this.endpoint}/system`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch system configuration:", error);
      throw error as ApiError;
    }
  }

  /**
   * Updates system configuration (admin only)
   * @param config - Updated system configuration
   * @returns Promise resolving to update response
   */
  async updateSystemConfiguration(
    config: Partial<SystemConfiguration>
  ): Promise<SystemConfiguration> {
    try {
      const request: SettingsUpdateRequest<SystemConfiguration> = {
        settings: config,
      };

      const response = await apiService.get<
        SettingsResponse<SystemConfiguration>
      >(`${this.endpoint}/system`, {
        method: "PUT",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update system configuration:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches integration settings (admin only)
   * @returns Promise resolving to integration settings
   */
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    try {
      const response = await apiService.get<
        SettingsResponse<IntegrationSettings>
      >(`${this.endpoint}/integrations`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch integration settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Updates integration settings (admin only)
   * @param settings - Updated integration settings
   * @returns Promise resolving to update response
   */
  async updateIntegrationSettings(
    settings: Partial<IntegrationSettings>
  ): Promise<IntegrationSettings> {
    try {
      const request: SettingsUpdateRequest<IntegrationSettings> = {
        settings: settings,
      };

      const response = await apiService.get<
        SettingsResponse<IntegrationSettings>
      >(`${this.endpoint}/integrations`, {
        method: "PUT",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update integration settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Validates settings before applying
   * @param category - Settings category
   * @param settings - Settings to validate
   * @returns Promise resolving to validation response
   */
  async validateSettings(
    category: string,
    settings: any
  ): Promise<SettingsValidationResponse> {
    try {
      const request = {
        category,
        settings,
        validate_only: true,
      };

      const response = await apiService.get<SettingsValidationResponse>(
        `${this.endpoint}/validate`,
        {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to validate settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Exports settings configuration
   * @param categories - Categories to export (empty for all)
   * @param includeSensitive - Whether to include sensitive data
   * @returns Promise resolving to export data
   */
  async exportSettings(
    categories: string[] = [],
    includeSensitive: boolean = false
  ): Promise<SettingsExport> {
    try {
      const queryParams = new URLSearchParams();
      if (categories.length > 0) {
        queryParams.append("categories", categories.join(","));
      }
      if (includeSensitive) {
        queryParams.append("include_sensitive", "true");
      }

      const response = await apiService.get<SettingsExport>(
        `${this.endpoint}/export?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Failed to export settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Imports settings configuration
   * @param importData - Settings import configuration
   * @returns Promise resolving to import result
   */
  async importSettings(
    importData: SettingsImport
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.get<{
        success: boolean;
        message: string;
      }>(`${this.endpoint}/import`, {
        method: "POST",
        body: JSON.stringify(importData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to import settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Resets settings to default values
   * @param categories - Categories to reset (empty for all)
   * @returns Promise resolving to reset result
   */
  async resetToDefaults(
    categories: string[] = []
  ): Promise<{ success: boolean; message: string }> {
    try {
      const request = { categories };
      const response = await apiService.get<{
        success: boolean;
        message: string;
      }>(`${this.endpoint}/reset`, {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to reset settings:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches settings audit trail (admin only)
   * @param limit - Maximum number of entries
   * @param offset - Offset for pagination
   * @returns Promise resolving to audit entries
   */
  async getAuditTrail(
    limit: number = 50,
    offset: number = 0
  ): Promise<SettingsAuditEntry[]> {
    try {
      const response = await apiService.get<SettingsAuditEntry[]>(
        `${this.endpoint}/audit?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch settings audit trail:", error);
      throw error as ApiError;
    }
  }

  /**
   * Tests integration connection
   * @param type - Integration type
   * @param config - Integration configuration
   * @returns Promise resolving to test result
   */
  async testIntegration(
    type: string,
    config: any
  ): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const request = { type, configuration: config };
      const response = await apiService.get<{
        success: boolean;
        message: string;
        details?: any;
      }>(`${this.endpoint}/integrations/test`, {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to test integration:", error);
      throw error as ApiError;
    }
  }

  /**
   * Gets system status and health checks
   * @returns Promise resolving to system status
   */
  async getSystemStatus(): Promise<{
    status: "healthy" | "warning" | "critical";
    checks: { name: string; status: "pass" | "fail"; message: string }[];
    last_check: string;
  }> {
    try {
      const response = await apiService.get<{
        status: "healthy" | "warning" | "critical";
        checks: { name: string; status: "pass" | "fail"; message: string }[];
        last_check: string;
      }>(`${this.endpoint}/system/status`);
      return response;
    } catch (error) {
      console.error("Failed to get system status:", error);
      throw error as ApiError;
    }
  }

  /**
   * Validates if user has admin permissions
   * @returns Promise resolving to admin status
   */
  async checkAdminPermissions(): Promise<{
    is_admin: boolean;
    permissions: string[];
  }> {
    try {
      const response = await apiService.get<{
        is_admin: boolean;
        permissions: string[];
      }>(`${this.endpoint}/permissions`);
      return response;
    } catch (error) {
      console.error("Failed to check admin permissions:", error);
      throw error as ApiError;
    }
  }
}

// Singleton instance for the application
export const settingsService = new SettingsService();
