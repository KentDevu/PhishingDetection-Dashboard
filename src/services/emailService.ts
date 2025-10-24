// Email-specific API service methods

import { apiService } from "./apiService";
import type {
  Email,
  DeleteEmailResponse,
  BulkDeleteEmailsRequest,
  BulkDeleteEmailsResponse,
  ApiError,
} from "../models/email";

export class EmailService {
  private readonly endpoint = "/emails";

  /**
   * Fetches all emails from the database
   * @returns Promise resolving to array of emails
   */
  async getAllEmails(): Promise<Email[]> {
    try {
      const response = await apiService.get<Email[]>(`${this.endpoint}/all`);
      return response;
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      throw error as ApiError;
    }
  }

  /**
   * Deletes a single email by ID
   * @param id - The email ID to delete
   * @returns Promise resolving to delete response
   */
  async deleteEmail(id: number): Promise<DeleteEmailResponse> {
    if (!Number.isInteger(id) || id <= 0) {
      throw {
        error: "Invalid email ID",
        code: "VALIDATION",
        details: { id },
      } as ApiError;
    }

    try {
      const response = await apiService.delete<DeleteEmailResponse>(
        `${this.endpoint}/${id}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to delete email ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Deletes multiple emails in bulk
   * @param ids - Array of email IDs to delete
   * @returns Promise resolving to bulk delete response
   */
  async bulkDeleteEmails(ids: number[]): Promise<BulkDeleteEmailsResponse> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw {
        error: "IDs must be a non-empty array",
        code: "VALIDATION",
        details: { ids },
      } as ApiError;
    }

    // Validate all IDs are positive integers
    const invalidIds = ids.filter((id) => !Number.isInteger(id) || id <= 0);
    if (invalidIds.length > 0) {
      throw {
        error: "All IDs must be positive integers",
        code: "VALIDATION",
        details: { invalidIds },
      } as ApiError;
    }

    try {
      const request: BulkDeleteEmailsRequest = { ids };
      const response =
        await apiService.deleteWithBody<BulkDeleteEmailsResponse>(
          `${this.endpoint}/bulk`,
          request
        );
      return response;
    } catch (error) {
      console.error("Failed to bulk delete emails:", error);
      throw error as ApiError;
    }
  }

  /**
   * Validates email ID format
   * @param id - Email ID to validate
   * @returns true if valid, false otherwise
   */
  isValidEmailId(id: unknown): id is number {
    return typeof id === "number" && Number.isInteger(id) && id > 0;
  }

  /**
   * Validates array of email IDs
   * @param ids - Array of email IDs to validate
   * @returns true if all valid, false otherwise
   */
  areValidEmailIds(ids: unknown): ids is number[] {
    return (
      Array.isArray(ids) &&
      ids.length > 0 &&
      ids.every((id) => this.isValidEmailId(id))
    );
  }
}

// Singleton instance for the application
export const emailService = new EmailService();
