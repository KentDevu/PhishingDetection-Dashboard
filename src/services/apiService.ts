// Base API service with common functionality for HTTP requests

import { environmentService } from "./environmentService";
import type { ApiError } from "../models/email";

export class ApiService {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(
    baseUrl: string = environmentService.apiBaseUrl,
    timeout: number = environmentService.apiTimeout
  ) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  private async createAbortController(
    timeout: number = this.defaultTimeout
  ): Promise<AbortController> {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw {
        error:
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        code: response.status.toString(),
        details: errorData,
      } as ApiError;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = await this.createAbortController();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw {
          error: "Request timeout",
          code: "TIMEOUT",
          details: { endpoint },
        } as ApiError;
      }

      if ((error as ApiError).error) {
        throw error as ApiError;
      }

      throw {
        error: "Network error",
        code: "NETWORK",
        details: { originalError: error as Error },
      } as ApiError;
    }
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = await this.createAbortController();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw {
          error: "Request timeout",
          code: "TIMEOUT",
          details: { endpoint },
        } as ApiError;
      }

      if ((error as ApiError).error) {
        throw error as ApiError;
      }

      throw {
        error: "Network error",
        code: "NETWORK",
        details: { originalError: error as Error },
      } as ApiError;
    }
  }

  async delete<T = void>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = await this.createAbortController();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw {
          error: "Request timeout",
          code: "TIMEOUT",
          details: { endpoint },
        } as ApiError;
      }

      if ((error as ApiError).error) {
        throw error as ApiError;
      }

      throw {
        error: "Network error",
        code: "NETWORK",
        details: { originalError: error as Error },
      } as ApiError;
    }
  }

  async deleteWithBody<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = await this.createAbortController();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw {
          error: "Request timeout",
          code: "TIMEOUT",
          details: { endpoint },
        } as ApiError;
      }

      if ((error as ApiError).error) {
        throw error as ApiError;
      }

      throw {
        error: "Network error",
        code: "NETWORK",
        details: { originalError: error as Error },
      } as ApiError;
    }
  }

  // Utility method to build query parameters
  buildQueryParams(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  // Get the base URL for debugging and testing
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Test API connection
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime: number;
    baseUrl: string;
  }> {
    const startTime = Date.now();
    try {
      // Try to fetch a simple endpoint to test connectivity
      const response = await fetch(this.baseUrl);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: `Successfully connected to API server (${response.status})`,
          responseTime,
          baseUrl: this.baseUrl,
        };
      } else {
        return {
          success: false,
          message: `API returned ${response.status}: ${response.statusText}`,
          responseTime,
          baseUrl: this.baseUrl,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown connection error",
        responseTime,
        baseUrl: this.baseUrl,
      };
    }
  }

  // Test emails endpoint specifically
  async testEmailsEndpoint(): Promise<{
    success: boolean;
    message: string;
    emailCount: number;
  }> {
    try {
      const result = await this.get<
        { length?: number; count?: number } | unknown[]
      >("/emails/all");

      // Handle array response
      if (Array.isArray(result)) {
        return {
          success: true,
          message: "Successfully fetched emails from /emails/all",
          emailCount: result.length,
        };
      }

      // Handle object response with count
      if (
        result &&
        typeof result === "object" &&
        ("length" in result || "count" in result)
      ) {
        const count =
          (result as { length?: number; count?: number }).length ||
          (result as { length?: number; count?: number }).count ||
          0;
        return {
          success: true,
          message: "Successfully connected to /emails/all endpoint",
          emailCount: count,
        };
      }

      return {
        success: true,
        message:
          "Connected to /emails/all but received unexpected response format",
        emailCount: 0,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.error || "Failed to connect to /emails/all endpoint",
        emailCount: 0,
      };
    }
  }
}

// Singleton instance for the application
export const apiService = new ApiService();
