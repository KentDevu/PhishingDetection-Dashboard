// Email Types and Interfaces

export interface Email {
  id: number;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  attachments: string[];
  attachment_hashes: string[];
  phishing_score_cti: number;
  received_at: string;
  status: "inbox" | "sent" | "draft" | "archived" | "deleted" | "quarantined";
  labels: string[];
  importance: "low" | "normal" | "high";
  is_read: boolean;
  has_attachments: boolean;
  folder: string;
  thread_id: string;
  in_reply_to: string | null;
  references: string[];
  threat_summary: {
    confidence: "low" | "medium" | "high";
    overall_risk: "clean" | "suspicious" | "malicious";
    total_analyzed: number;
    malicious_found: number;
    suspicious_found: number;
    average_reputation: number;
  };
  timestamp: string;
  cti_flags: string[];
  extracted_urls: string[];
  sender_domain: string;
  sender_ip: string;
  sender_name: string;
  spf_result: "pass" | "fail" | "neutral" | "softfail" | "none";
  dkim_result: "pass" | "fail" | "neutral" | "none";
  dmarc_result: "pass" | "fail" | "none";
  headers: any; // EmailHeaders
  detailed_analysis: any; // DetailedAnalysis
}

export interface EmailFolder {
  id: string;
  name: string;
  type: "system" | "user";
  parent_id?: string;
  email_count: number;
  unread_count: number;
  color?: string;
  icon?: string;
}

export interface EmailFilter {
  id: string;
  name: string;
  conditions: EmailFilterCondition[];
  actions: EmailFilterAction[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailFilterCondition {
  field:
    | "sender"
    | "recipient"
    | "subject"
    | "body"
    | "attachment"
    | "phishing_score";
  operator:
    | "contains"
    | "equals"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than";
  value: string | number;
}

export interface EmailFilterAction {
  type:
    | "move_to_folder"
    | "add_label"
    | "mark_as_read"
    | "delete"
    | "quarantine"
    | "forward";
  value: string;
}

export interface EmailSearchQuery {
  query?: string;
  sender?: string;
  recipient?: string;
  subject?: string;
  folder?: string;
  labels?: string[];
  date_from?: string;
  date_to?: string;
  has_attachments?: boolean;
  is_read?: boolean;
  phishing_score_min?: number;
  phishing_score_max?: number;
  importance?: "low" | "normal" | "high";
  limit?: number;
  offset?: number;
  sort_by?: "date" | "sender" | "subject" | "phishing_score";
  sort_order?: "asc" | "desc";
}

export interface EmailFilterParams {
  sender?: string;
  sender_domain?: string;
  subject?: string;
  threat_level?: ThreatLevel;
  cti_confidence?: "low" | "medium" | "high";
  start_date?: string;
  end_date?: string;
  has_attachments?: boolean;
  has_urls?: boolean;
  score_min?: number;
  score_max?: number;
}

export interface EmailStats {
  total_emails: number;
  unread_count: number;
  today_count: number;
  week_count: number;
  month_count: number;
  threat_count: number;
  quarantine_count: number;
  avg_phishing_score: number;
  folders: {
    [folder_name: string]: {
      count: number;
      unread: number;
    };
  };
}

export interface AttachmentInfo {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  hash: string;
  is_safe: boolean;
  scan_result?: {
    clean: boolean;
    threats_found: string[];
    scan_engine: string;
    scan_time: string;
  };
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  email_count: number;
  latest_email_date: string;
  has_unread: boolean;
  emails: Email[];
  labels: string[];
  folder: string;
}

export interface DraftEmail {
  id?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: File[];
  save_timestamp?: string;
  is_html?: boolean;
  priority?: "low" | "normal" | "high";
  reply_to?: string;
  in_reply_to?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_html: boolean;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  usage_count: number;
}

// Utility types
export type EmailStatus = Email["status"];
export type EmailImportance = Email["importance"];
export type ThreatLevel = Email["threat_summary"]["overall_risk"];

// Validation functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function calculateThreatLevel(phishing_score: number): ThreatLevel {
  if (phishing_score >= 0.6) return "malicious";
  if (phishing_score >= 0.3) return "suspicious";
  return "clean";
}

export function formatEmailSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

export function getEmailDisplayName(email: string, name?: string): string {
  if (name) {
    return `${name} <${email}>`;
  }
  return email;
}

export function extractEmailDomain(email: string): string {
  const match = email.match(/@(.+)$/);
  return match ? match[1] : "";
}

export function isInternalEmail(email: string, domain: string): boolean {
  return extractEmailDomain(email).toLowerCase() === domain.toLowerCase();
}
