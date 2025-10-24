// Error handling utilities for the application

import type { ApiError } from "../models/email";

/**
 * Gets a user-friendly error message from an API error
 */
export function getErrorMessage(error: ApiError | null): string {
  if (!error) return "";

  // Handle specific error codes
  switch (error.code) {
    case "TIMEOUT":
      return "Request timed out. Please check your connection and try again.";
    case "NETWORK":
      return "Network error. Please check your internet connection.";
    case "VALIDATION":
      return error.error || "Invalid input provided.";
    case "400":
      return "Invalid request. Please check your input.";
    case "404":
      return "The requested resource was not found.";
    case "500":
      return "Server error. Please try again later.";
    default:
      return error.error || "An unexpected error occurred.";
  }
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  const retryableCodes = ["TIMEOUT", "NETWORK", "500", "502", "503", "504"];
  return retryableCodes.includes(error.code || "");
}

/**
 * Logs error details for debugging
 */
export function logError(error: ApiError, context?: string): void {
  const logData = {
    message: error.error,
    code: error.code,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error("API Error:", logData);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    error: message,
    code,
    details,
  };
}

/**
 * Handles API errors with logging and user feedback
 */
export function handleApiError(error: unknown, context?: string): ApiError {
  let apiError: ApiError;

  if (isApiError(error)) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = createError(error.message, "UNKNOWN", { originalError: error });
  } else {
    apiError = createError("An unknown error occurred", "UNKNOWN", { error });
  }

  logError(apiError, context);
  return apiError;
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as ApiError).error === "string"
  );
}
