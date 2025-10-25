// Environment Configuration Service - Centralized config management

export interface EnvironmentConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  isDevelopment: boolean;
  isProduction: boolean;
  features: {
    realTimeUpdates: boolean;
    advancedAnalytics: boolean;
    bulkOperations: boolean;
  };
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): EnvironmentConfig {
    // Default configuration with fallback URLs
    const defaults: EnvironmentConfig = {
      apiBaseUrl: "https://phishing-detection-api.kentharold.space/api",
      apiTimeout: 10000, // 10 seconds
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      features: {
        realTimeUpdates: true,
        advancedAnalytics: true,
        bulkOperations: true,
      },
    };

    // Check for environment variable overrides
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;

    // Use environment variable if provided, otherwise use default
    const apiBaseUrl = envApiUrl || defaults.apiBaseUrl;

    // Override with environment variables if available
    return {
      ...defaults,
      apiBaseUrl,
      apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),
      features: {
        ...defaults.features,
        realTimeUpdates: import.meta.env.VITE_FEATURE_REAL_TIME !== "false",
        advancedAnalytics: import.meta.env.VITE_FEATURE_ANALYTICS !== "false",
        bulkOperations: import.meta.env.VITE_FEATURE_BULK_OPS !== "false",
      },
    };
  }

  // Getters for configuration values
  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get apiTimeout(): number {
    return this.config.apiTimeout;
  }

  get isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  get isProduction(): boolean {
    return this.config.isProduction;
  }

  get features(): EnvironmentConfig["features"] {
    return this.config.features;
  }

  // Get full configuration
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  // Update configuration at runtime (for testing)
  updateConfig(partial: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  // Check if a feature is enabled
  isFeatureEnabled(feature: keyof EnvironmentConfig["features"]): boolean {
    return this.config.features[feature];
  }

  // Get API endpoint with path
  getApiEndpoint(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.config.apiBaseUrl}${cleanPath}`;
  }

  // Debug helper - log current configuration
  logConfiguration(): void {
    if (this.isDevelopment) {
      console.group("🔧 Environment Configuration");
      console.log("API Base URL:", this.apiBaseUrl);
      console.log("API Timeout:", this.apiTimeout);
      console.log(
        "Environment:",
        this.isDevelopment ? "Development" : "Production"
      );
      console.log("Features:", this.features);
      console.groupEnd();
    }
  }
}

// Singleton instance
export const environmentService = new EnvironmentService();

// Log configuration in development
if (environmentService.isDevelopment) {
  environmentService.logConfiguration();
}
