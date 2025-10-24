// Base API service with common functionality for HTTP requests

import type { ApiError } from "../models/email";

export class ApiService {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(
    baseUrl: string = "http://localhost:3000/api",
    timeout: number = 10000
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
}

// Singleton instance for the application
export const apiService = new ApiService();
