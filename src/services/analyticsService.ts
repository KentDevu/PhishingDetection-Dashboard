// Analytics API Service - Handles threat intelligence and reporting data

import { apiService } from "./apiService";
import type {
  AnalyticsResponse,
  AnalyticsDashboardData,
  ThreatMetrics,
  ThreatTrend,
  DomainIntelligence,
  ThreatActorProfile,
  SecurityIncident,
  ThreatIntelligence,
  GeographicThreat,
  AttackPattern,
  ComplianceMetrics,
  PerformanceMetrics,
  ReportConfig,
  ReportGenerationResponse,
  ThreatIntelligenceQuery,
  AnalyticsFilters,
} from "../models/analytics";
import type { ApiError } from "../models/email";

export class AnalyticsService {
  private readonly endpoint = "/analytics";

  /**
   * Fetches comprehensive analytics dashboard data
   * @param filters - Optional filters to apply to the data
   * @returns Promise resolving to analytics dashboard data
   */
  async getDashboardData(
    filters?: AnalyticsFilters
  ): Promise<AnalyticsDashboardData> {
    try {
      const queryParams = filters ? this.buildFiltersQuery(filters) : "";
      const response = await apiService.get<AnalyticsResponse>(
        `${this.endpoint}/dashboard${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch analytics dashboard data:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches threat metrics and KPIs
   * @param dateRange - Optional date range for metrics
   * @returns Promise resolving to threat metrics
   */
  async getThreatMetrics(dateRange?: {
    start: string;
    end: string;
  }): Promise<ThreatMetrics> {
    try {
      const queryParams = dateRange
        ? `?start_date=${dateRange.start}&end_date=${dateRange.end}`
        : "";
      const response = await apiService.get<ThreatMetrics>(
        `${this.endpoint}/metrics${queryParams}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch threat metrics:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches threat trend data over time
   * @param period - Time period for trends ('7d', '30d', '90d', '1y')
   * @returns Promise resolving to trend data
   */
  async getThreatTrends(period: string = "30d"): Promise<ThreatTrend[]> {
    try {
      const response = await apiService.get<ThreatTrend[]>(
        `${this.endpoint}/trends?period=${period}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch threat trends:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches domain intelligence data
   * @param limit - Maximum number of domains to return
   * @param sortBy - Sort criteria ('reputation', 'threat_level', 'email_count')
   * @returns Promise resolving to domain intelligence data
   */
  async getDomainIntelligence(
    limit: number = 50,
    sortBy: string = "threat_level"
  ): Promise<DomainIntelligence[]> {
    try {
      const response = await apiService.get<DomainIntelligence[]>(
        `${this.endpoint}/domains?limit=${limit}&sort=${sortBy}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch domain intelligence:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches threat actor profiles
   * @param activeOnly - Whether to return only active threat actors
   * @returns Promise resolving to threat actor profiles
   */
  async getThreatActors(
    activeOnly: boolean = true
  ): Promise<ThreatActorProfile[]> {
    try {
      const response = await apiService.get<ThreatActorProfile[]>(
        `${this.endpoint}/threat-actors?active=${activeOnly}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch threat actors:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches security incidents
   * @param status - Filter by incident status
   * @param limit - Maximum number of incidents to return
   * @returns Promise resolving to security incidents
   */
  async getSecurityIncidents(
    status?: string,
    limit: number = 20
  ): Promise<SecurityIncident[]> {
    try {
      const queryParams = status
        ? `?status=${status}&limit=${limit}`
        : `?limit=${limit}`;
      const response = await apiService.get<SecurityIncident[]>(
        `${this.endpoint}/incidents${queryParams}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch security incidents:", error);
      throw error as ApiError;
    }
  }

  /**
   * Searches threat intelligence data
   * @param query - Search parameters
   * @returns Promise resolving to threat intelligence results
   */
  async searchThreatIntelligence(
    query: ThreatIntelligenceQuery
  ): Promise<ThreatIntelligence[]> {
    try {
      const queryParams = this.buildThreatIntelQuery(query);
      const response = await apiService.get<ThreatIntelligence[]>(
        `${this.endpoint}/threat-intelligence${queryParams}`
      );
      return response;
    } catch (error) {
      console.error("Failed to search threat intelligence:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches geographic threat distribution
   * @returns Promise resolving to geographic threat data
   */
  async getGeographicThreats(): Promise<GeographicThreat[]> {
    try {
      const response = await apiService.get<GeographicThreat[]>(
        `${this.endpoint}/geographic-threats`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch geographic threats:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches attack pattern analysis
   * @param timeframe - Analysis timeframe ('7d', '30d', '90d')
   * @returns Promise resolving to attack patterns
   */
  async getAttackPatterns(timeframe: string = "30d"): Promise<AttackPattern[]> {
    try {
      const response = await apiService.get<AttackPattern[]>(
        `${this.endpoint}/attack-patterns?timeframe=${timeframe}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch attack patterns:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches compliance metrics
   * @param frameworks - Specific compliance frameworks to include
   * @returns Promise resolving to compliance metrics
   */
  async getComplianceMetrics(
    frameworks?: string[]
  ): Promise<ComplianceMetrics[]> {
    try {
      const queryParams = frameworks
        ? `?frameworks=${frameworks.join(",")}`
        : "";
      const response = await apiService.get<ComplianceMetrics[]>(
        `${this.endpoint}/compliance${queryParams}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch compliance metrics:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches system performance metrics
   * @returns Promise resolving to performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await apiService.get<PerformanceMetrics>(
        `${this.endpoint}/performance`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch performance metrics:", error);
      throw error as ApiError;
    }
  }

  /**
   * Generates a security report
   * @param config - Report configuration
   * @returns Promise resolving to report generation response
   */
  async generateReport(
    config: Partial<ReportConfig>
  ): Promise<ReportGenerationResponse> {
    try {
      const response = await apiService.get<ReportGenerationResponse>(
        `${this.endpoint}/reports/generate`,
        {
          method: "POST",
          body: JSON.stringify(config),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error as ApiError;
    }
  }

  /**
   * Fetches available report templates
   * @returns Promise resolving to report configurations
   */
  async getReportTemplates(): Promise<ReportConfig[]> {
    try {
      const response = await apiService.get<ReportConfig[]>(
        `${this.endpoint}/reports/templates`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch report templates:", error);
      throw error as ApiError;
    }
  }

  /**
   * Builds query string from analytics filters
   * @param filters - Analytics filters
   * @returns Query string
   */
  private buildFiltersQuery(filters: AnalyticsFilters): string {
    const params = new URLSearchParams();

    if (filters.date_range) {
      params.append("start_date", filters.date_range.start);
      params.append("end_date", filters.date_range.end);
    }

    if (filters.threat_levels.length > 0) {
      params.append("threat_levels", filters.threat_levels.join(","));
    }

    if (filters.domains.length > 0) {
      params.append("domains", filters.domains.join(","));
    }

    if (filters.countries.length > 0) {
      params.append("countries", filters.countries.join(","));
    }

    if (filters.attack_types.length > 0) {
      params.append("attack_types", filters.attack_types.join(","));
    }

    if (filters.confidence_threshold > 0) {
      params.append(
        "confidence_threshold",
        filters.confidence_threshold.toString()
      );
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Builds query string from threat intelligence query
   * @param query - Threat intelligence query parameters
   * @returns Query string
   */
  private buildThreatIntelQuery(query: ThreatIntelligenceQuery): string {
    const params = new URLSearchParams();

    if (query.indicator) params.append("indicator", query.indicator);
    if (query.type) params.append("type", query.type);
    if (query.threat_level) params.append("threat_level", query.threat_level);
    if (query.source) params.append("source", query.source);

    if (query.date_range) {
      params.append("start_date", query.date_range.start);
      params.append("end_date", query.date_range.end);
    }

    if (query.limit) params.append("limit", query.limit.toString());
    if (query.offset) params.append("offset", query.offset.toString());

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Validates date range format
   * @param dateRange - Date range to validate
   * @returns True if valid, false otherwise
   */
  isValidDateRange(dateRange: { start: string; end: string }): boolean {
    try {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
    } catch {
      return false;
    }
  }

  /**
   * Validates analytics filters
   * @param filters - Filters to validate
   * @returns True if valid, false otherwise
   */
  isValidFilters(filters: AnalyticsFilters): boolean {
    if (filters.date_range && !this.isValidDateRange(filters.date_range)) {
      return false;
    }

    if (filters.confidence_threshold < 0 || filters.confidence_threshold > 1) {
      return false;
    }

    return true;
  }
}

// Singleton instance for the application
export const analyticsService = new AnalyticsService();
