// Email-related TypeScript interfaces and types for the phishing detection system

export interface EmailHeaders {
  received: string;
  "authentication-results": string;
}

export interface ExtractedUrl {
  url: string;
  domain: string;
  isMalicious: boolean;
}

export interface DomainAnalysis {
  threat_level: "clean" | "suspicious" | "high" | "malicious";
  reputation_score: number;
  malicious_engines: string[];
  total_engines: number;
  last_analysis: string;
}

export interface IPAnalysis {
  threat_level: "clean" | "suspicious" | "high" | "malicious";
  reputation_score: number;
  malicious_engines: string[];
  total_engines: number;
  last_analysis: string;
}

export interface UrlAnalysis {
  threat_level: "clean" | "suspicious" | "high" | "malicious";
  reputation_score: number;
  malicious_engines: string[];
  total_engines: number;
  last_analysis: string;
}

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
