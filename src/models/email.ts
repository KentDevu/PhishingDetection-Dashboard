// Email-related TypeScript interfaces and types for the phishing detection system
// Updated to match actual API response structure from phishing-detection-api.kentharold.space

export interface EmailHeaders {
  to?: string;
  date?: string;
  from?: string;
  subject?: string;
  "x-gm-gg"?: string;
  "arc-seal"?: string;
  received?: string;
  "message-id"?: string;
  "x-received"?: string;
  "return-path"?: string;
  "content-type"?: string;
  "delivered-to"?: string;
  "mime-version"?: string;
  "received-spf"?: string;
  "x-gm-features"?: string;
  "dkim-signature"?: string;
  "x-gm-message-state"?: string;
  "x-google-smtp-source"?: string;
  "arc-message-signature"?: string;
  "authentication-results"?: string;
  "x-google-dkim-signature"?: string;
  "arc-authentication-results"?: string;
  [key: string]: string | undefined; // For any additional headers
}

export interface CTIAnalysisEngine {
  engine: string;
  method: string;
  result: string;
}

export interface CTIAnalysisStats {
  timeout: number;
  harmless: number;
  malicious: number;
  suspicious: number;
  undetected: number;
}

export interface PopularityRank {
  rank: number;
  timestamp: number;
}

export interface DomainAnalysis {
  tags: string[];
  type: "domain";
  stats: CTIAnalysisStats;
  categories: Record<string, string>;
  confidence: "low" | "medium" | "high";
  identifier: string;
  threat_level: "clean" | "low" | "medium" | "high" | "critical";
  popularity_ranks: Record<string, PopularityRank>;
  reputation_score: number;
  malicious_engines: CTIAnalysisEngine[];
  last_analysis_date: number;
  suspicious_engines: CTIAnalysisEngine[];
}

export interface IPAnalysis {
  tags: string[];
  type: "ip";
  stats: CTIAnalysisStats;
  categories: string[];
  confidence: "low" | "medium" | "high";
  identifier: string;
  threat_level: "clean" | "low" | "medium" | "high" | "critical";
  popularity_ranks: Record<string, PopularityRank>;
  reputation_score: number;
  malicious_engines: CTIAnalysisEngine[];
  last_analysis_date: number;
  suspicious_engines: CTIAnalysisEngine[];
}

export interface UrlAnalysis {
  tags: string[];
  type: "url";
  stats: CTIAnalysisStats;
  categories: Record<string, string>;
  confidence: "low" | "medium" | "high";
  identifier: string;
  threat_level: "clean" | "low" | "medium" | "high" | "critical";
  popularity_ranks: Record<string, PopularityRank>;
  reputation_score: number;
  malicious_engines: CTIAnalysisEngine[];
  last_analysis_date: number;
  suspicious_engines: CTIAnalysisEngine[];
}

export interface DetailedAnalysis {
  ips: Record<string, IPAnalysis>;
  urls: Record<string, UrlAnalysis>;
  domains: Record<string, DomainAnalysis>;
  summary: {
    total_checks: number;
    confidence_level: "low" | "medium" | "high";
    reputation_score: number;
    malicious_detections: number;
    suspicious_detections: number;
  };
}

export interface ThreatSummary {
  overall_risk: ThreatLevel;
  confidence: ConfidenceLevel;
  total_analyzed: number;
  malicious_found: number;
  suspicious_found: number;
  average_reputation: number;
}

export interface Email {
  id: number;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  attachments: string[];
  attachment_hashes: string[];
  timestamp: string; // ISO 8601 date string
  headers: EmailHeaders;
  extracted_urls: string[];
  sender_domain: string;
  sender_ip: string;
  sender_name: string;
  spf_result: "pass" | "fail" | "neutral" | "softfail" | "none";
  dkim_result: "pass" | "fail" | "neutral" | "none";
  dmarc_result: "pass" | "fail" | "none";
  phishing_score_cti: number; // 0.0 to 1.0
  cti_flags: string[];
  cti_confidence: ConfidenceLevel;
  detailed_analysis: DetailedAnalysis;
  detailed_cti_analysis: DetailedAnalysis; // Duplicate field from API
  threat_summary: ThreatSummary;
}

// API Response types
export interface GetEmailsResponse {
  data: Email[];
  total: number;
  page?: number;
  limit?: number;
}

export interface DeleteEmailResponse {
  message: string;
}

export interface BulkDeleteEmailsRequest {
  ids: number[];
}

export interface BulkDeleteEmailsResponse {
  message: string;
  deletedIds: number[];
}

// Error types
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Hook state types
export interface LoadingState {
  idle: boolean;
  loading: boolean;
  success: boolean;
  error: boolean;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

// Utility types
export type EmailId = number;
export type EmailIds = EmailId[];

export type ThreatLevel =
  | "clean"
  | "suspicious"
  | "high"
  | "malicious"
  | "critical";
export type ConfidenceLevel = "low" | "medium" | "high";
export type AuthResult = "pass" | "fail" | "neutral" | "softfail" | "none";
