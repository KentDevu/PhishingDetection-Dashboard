// Email-related TypeScript interfaces and types for the phishing detection system
// Matches exact API response structure from GET /api/emails/all

export interface EmailHeaders {
  "return-path"?: string;
  received?: string;
  to?: string;
  from?: string;
  date?: string;
  subject?: string;
  "message-id"?: string;
  "content-type"?: string;
  "mime-version"?: string;
  "authentication-results"?: string;
  "received-spf"?: string;
  "dkim-signature"?: string;
  "x-received"?: string;
  "delivered-to"?: string;
  "arc-seal"?: string;
  "arc-message-signature"?: string;
  "arc-authentication-results"?: string;
  "x-gm-message-state"?: string;
  "x-google-smtp-source"?: string;
  "x-google-dkim-signature"?: string;
  "x-gm-features"?: string;
  "x-gm-gg"?: string;
  [key: string]: string | undefined; // For any additional headers
}

// CTI Analysis Engine from VirusTotal
export interface CTIAnalysisEngine {
  engine: string;
  result: string;
  method?: string;
}

export interface CTIAnalysisStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout?: number;
}

// Domain Analysis from detailed_analysis
export interface DomainAnalysis {
  identifier: string;
  type: "domain";
  stats: CTIAnalysisStats;
  reputation_score: number;
  threat_level: "clean" | "low" | "medium" | "high" | "critical";
  confidence: "low" | "medium" | "high";
  malicious_engines: CTIAnalysisEngine[];
  suspicious_engines: CTIAnalysisEngine[];
  categories: string[];
  tags: string[];
  last_analysis_date: string;
  popularity_ranks: Record<string, { rank: number; timestamp: number }>;
}

// IP Analysis from detailed_analysis
export interface IPAnalysis {
  identifier: string;
  type: "ip";
  stats: CTIAnalysisStats;
  reputation_score: number;
  threat_level: "clean" | "low" | "medium" | "high" | "critical";
  confidence: "low" | "medium" | "high";
  malicious_engines: CTIAnalysisEngine[];
  suspicious_engines: CTIAnalysisEngine[];
  categories: string[];
  tags: string[];
  last_analysis_date: string;
  popularity_ranks: Record<string, { rank: number; timestamp: number }>;
}

// URL Analysis from detailed_analysis
export interface UrlAnalysis {
  identifier: string;
  type: "url";
  stats: CTIAnalysisStats;
  reputation_score: number;
  threat_level: "clean" | "low" | "medium" | "high" | "critical";
  confidence: "low" | "medium" | "high";
  malicious_engines: CTIAnalysisEngine[];
  suspicious_engines: CTIAnalysisEngine[];
  categories: string[];
  tags: string[];
  last_analysis_date: string;
  popularity_ranks: Record<string, { rank: number; timestamp: number }>;
}

// Detailed Analysis structure
export interface DetailedAnalysis {
  domains: Record<string, DomainAnalysis>;
  ips: Record<string, IPAnalysis>;
  urls: Record<string, UrlAnalysis>;
  summary: {
    total_checks: number;
    malicious_detections: number;
    suspicious_detections: number;
    reputation_score: number;
    confidence_level: "low" | "medium" | "high";
  };
}

// Threat Summary structure
export interface ThreatSummary {
  overall_risk: "clean" | "suspicious" | "high" | "malicious" | "critical";
  confidence: "low" | "medium" | "high";
  total_analyzed: number;
  malicious_found: number;
  suspicious_found: number;
  average_reputation: number;
}

// Main Email interface - matches GET /api/emails/all response
export interface Email {
  id: number;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  attachments: string[];
  timestamp: string; // ISO 8601 date string
  phishing_score_cti: number; // 0.0 to 1.0
  cti_flags: string[];
  extracted_urls: string[];
  sender_domain: string;
  sender_ip: string;
  sender_name: string;
  spf_result: "pass" | "fail" | "neutral" | "softfail" | "none";
  dkim_result: "pass" | "fail" | "neutral" | "none";
  dmarc_result: "pass" | "fail" | "none";
  headers: EmailHeaders;
  attachment_hashes: string[];
  detailed_analysis: DetailedAnalysis;
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
