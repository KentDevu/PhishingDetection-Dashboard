// Email-specific API service methods

import { apiService } from "./apiService";
import type {
  Email,
  DeleteEmailResponse,
  BulkDeleteEmailsRequest,
  BulkDeleteEmailsResponse,
  ApiError,
  ThreatLevel,
  ConfidenceLevel,
} from "../models/email";

// Email filtering parameters based on API documentation
export interface EmailFilterParams {
  sender?: string; // Filter by sender email (partial match)
  subject?: string; // Filter by subject (partial match)
  sender_domain?: string; // Filter by sender domain (exact match)
  threat_level?: ThreatLevel | string; // Filter by threat level or numeric score
  cti_confidence?: ConfidenceLevel; // Filter by CTI confidence level
  start_date?: string; // Filter from date (ISO 8601)
  end_date?: string; // Filter to date (ISO 8601)
  has_attachments?: boolean; // Filter by attachment presence
}

export class EmailService {
  private readonly endpoint = "/emails";

  /**
   * Fetches all emails from the database with optional filtering
   * @param filters - Optional filtering parameters
   * @returns Promise resolving to array of emails
   */
  async getAllEmails(filters?: EmailFilterParams): Promise<Email[]> {
    try {
      let endpoint = `${this.endpoint}/all`;

      // Build query parameters if filters are provided
      if (filters) {
        const queryParams = this.buildFilterParams(filters);
        const queryString = apiService.buildQueryParams(queryParams);
        endpoint += queryString;
      }

      const response = await apiService.get<Email[]>(endpoint);
      return response;
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      throw error as ApiError;
    }
  }

  /**
   * Builds filter parameters for API query
   * @param filters - Filter parameters
   * @returns Object with query parameters
   */
  private buildFilterParams(
    filters: EmailFilterParams
  ): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Add string filters
    if (filters.sender) params.sender = filters.sender;
    if (filters.subject) params.subject = filters.subject;
    if (filters.sender_domain) params.sender_domain = filters.sender_domain;

    // Add threat level filter
    if (filters.threat_level) params.threat_level = filters.threat_level;

    // Add confidence filter
    if (filters.cti_confidence) params.cti_confidence = filters.cti_confidence;

    // Add date filters (convert to ISO string if Date objects)
    if (filters.start_date) {
      params.start_date =
        typeof filters.start_date === "string"
          ? filters.start_date
          : filters.start_date;
    }
    if (filters.end_date) {
      params.end_date =
        typeof filters.end_date === "string"
          ? filters.end_date
          : filters.end_date;
    }

    // Add attachment filter
    if (typeof filters.has_attachments === "boolean") {
      params.has_attachments = filters.has_attachments.toString();
    }

    return params;
  }

  /**
   * Searches emails with text-based filters
   * @param searchTerm - Search term for sender/subject
   * @param options - Additional search options
   * @returns Promise resolving to filtered emails
   */
  async searchEmails(
    searchTerm: string,
    options?: {
      threatLevel?: ThreatLevel;
      confidence?: ConfidenceLevel;
      dateRange?: { start: string; end: string };
    }
  ): Promise<Email[]> {
    const filters: EmailFilterParams = {};

    // Add search term to both sender and subject (API will handle OR logic)
    if (searchTerm.includes("@")) {
      // Looks like an email, search sender
      filters.sender = searchTerm;
    } else {
      // Search in subject
      filters.subject = searchTerm;
    }

    // Add additional options
    if (options?.threatLevel) filters.threat_level = options.threatLevel;
    if (options?.confidence) filters.cti_confidence = options.confidence;
    if (options?.dateRange) {
      filters.start_date = options.dateRange.start;
      filters.end_date = options.dateRange.end;
    }

    return this.getAllEmails(filters);
  }

  /**
   * Gets emails by threat level
   * @param threatLevel - Threat level to filter by
   * @param includeHigher - Whether to include higher threat levels
   * @returns Promise resolving to filtered emails
   */
  async getEmailsByThreatLevel(
    threatLevel: ThreatLevel,
    includeHigher: boolean = false
  ): Promise<Email[]> {
    if (includeHigher) {
      // For including higher levels, we'll fetch all and filter client-side
      // since the API doesn't support range queries directly
      const allEmails = await this.getAllEmails();
      const threatOrder: Record<ThreatLevel, number> = {
        clean: 0,
        suspicious: 1,
        high: 2,
        malicious: 3,
        critical: 4,
      };
      const minLevel = threatOrder[threatLevel];

      return allEmails.filter(
        (email) => threatOrder[email.threat_summary.overall_risk] >= minLevel
      );
    }

    return this.getAllEmails({ threat_level: threatLevel });
  }

  /**
   * Gets emails within a date range
   * @param startDate - Start date (ISO string or Date)
   * @param endDate - End date (ISO string or Date)
   * @returns Promise resolving to filtered emails
   */
  async getEmailsByDateRange(
    startDate: string | Date,
    endDate: string | Date
  ): Promise<Email[]> {
    return this.getAllEmails({
      start_date:
        startDate instanceof Date ? startDate.toISOString() : startDate,
      end_date: endDate instanceof Date ? endDate.toISOString() : endDate,
    });
  }

  /**
   * Gets emails with or without attachments
   * @param hasAttachments - Whether to get emails with attachments
   * @returns Promise resolving to filtered emails
   */
  async getEmailsByAttachments(hasAttachments: boolean): Promise<Email[]> {
    return this.getAllEmails({ has_attachments: hasAttachments });
  }

  /**
   * Analyzes an email for phishing threats using the POST /emails endpoint
   * @param emailData - Email content and metadata to analyze
   * @returns Promise resolving to analysis results
   */
  async analyzeEmail(emailData: {
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    attachments?: string[];
    headers?: Record<string, string>;
  }): Promise<Email> {
    try {
      const response = await apiService.post<Email>(
        this.endpoint, // POST /emails endpoint
        emailData
      );
      return response;
    } catch (error) {
      console.error("Failed to analyze email:", error);
      throw error as ApiError;
    }
  }

  /**
   * Uploads and analyzes an email file for phishing threats
   * @param file - Email file (.eml, .msg, or .txt format)
   * @param metadata - Optional email metadata
   * @returns Promise resolving to analysis results
   */
  async uploadAndAnalyzeEmail(
    file: File,
    metadata?: {
      sender?: string;
      recipient?: string;
      subject?: string;
    }
  ): Promise<Email> {
    try {
      // Read file content
      const fileContent = await this.readFileAsText(file);

      // Extract basic info from file if metadata not provided
      const emailData = {
        sender: metadata?.sender || this.extractSenderFromContent(fileContent),
        recipient:
          metadata?.recipient || this.extractRecipientFromContent(fileContent),
        subject:
          metadata?.subject || this.extractSubjectFromContent(fileContent),
        body: fileContent,
        attachments: [], // File attachments would need separate handling
        headers: this.extractHeadersFromContent(fileContent),
      };

      return this.analyzeEmail(emailData);
    } catch (error) {
      console.error("Failed to upload and analyze email:", error);
      throw error as ApiError;
    }
  }

  /**
   * Reads file content as text
   * @param file - File to read
   * @returns Promise resolving to file content
   */
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Extracts sender email from email content
   * @param content - Email content
   * @returns Sender email or placeholder
   */
  private extractSenderFromContent(content: string): string {
    const fromMatch = content.match(/^From:\s*(.+)$/m);
    return fromMatch ? fromMatch[1].trim() : "unknown@example.com";
  }

  /**
   * Extracts recipient email from email content
   * @param content - Email content
   * @returns Recipient email or placeholder
   */
  private extractRecipientFromContent(content: string): string {
    const toMatch = content.match(/^To:\s*(.+)$/m);
    return toMatch ? toMatch[1].trim() : "recipient@example.com";
  }

  /**
   * Extracts subject from email content
   * @param content - Email content
   * @returns Subject or placeholder
   */
  private extractSubjectFromContent(content: string): string {
    const subjectMatch = content.match(/^Subject:\s*(.+)$/m);
    return subjectMatch ? subjectMatch[1].trim() : "No Subject";
  }

  /**
   * Extracts headers from email content
   * @param content - Email content
   * @returns Headers object
   */
  private extractHeadersFromContent(content: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const headerMatches = content.match(/^[\w-]+:\s*.+$/gm);

    if (headerMatches) {
      headerMatches.forEach((header) => {
        const [key, ...valueParts] = header.split(":");
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join(":").trim();
        }
      });
    }

    return headers;
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
