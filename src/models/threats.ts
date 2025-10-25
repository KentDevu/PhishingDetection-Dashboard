// Threat Detection and Management Data Models
// This model bridges the gap between Analytics, Alerts, and real-time threat monitoring

export interface ThreatDetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: "low" | "medium" | "high" | "critical";
  category: "phishing" | "malware" | "spam" | "policy_violation" | "anomaly";

  // Rule criteria
  conditions: {
    sender_patterns?: string[];
    subject_patterns?: string[];
    content_patterns?: string[];
    attachment_extensions?: string[];
    domain_patterns?: string[];
    reputation_threshold?: number;
    confidence_threshold?: number;
  };

  // Actions to take when rule is triggered
  actions: {
    quarantine: boolean;
    notify_admin: boolean;
    block_sender: boolean;
    escalate: boolean;
    auto_delete: boolean;
  };

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_triggered?: string;
  trigger_count: number;
}

export interface ThreatDetectionResult {
  id: string;
  email_id: string;
  rule_id: string;
  rule_name: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  threat_type: string;

  // Detection details
  matched_conditions: string[];
  risk_factors: {
    factor: string;
    score: number;
    description: string;
  }[];

  // Email context
  sender: string;
  subject: string;
  timestamp: string;

  // Actions taken
  actions_executed: string[];
  quarantined: boolean;
  admin_notified: boolean;

  // Status tracking
  status:
    | "detected"
    | "analyzing"
    | "confirmed"
    | "false_positive"
    | "resolved";
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
}

export interface ThreatMonitoringStats {
  // Real-time monitoring statistics
  active_rules: number;
  monitoring_enabled: boolean;
  last_scan: string;
  scan_duration_ms: number;

  // Detection counts (last 24 hours)
  total_detections: number;
  critical_threats: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;

  // Rule performance
  most_triggered_rules: {
    rule_id: string;
    rule_name: string;
    trigger_count: number;
  }[];

  // System health
  system_status: "healthy" | "warning" | "error";
  error_rate: number;
  processing_latency_ms: number;
}

export interface ThreatInvestigation {
  id: string;
  threat_id: string;
  investigator: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "critical";

  // Investigation details
  findings: {
    timestamp: string;
    investigator: string;
    finding: string;
    evidence?: string[];
  }[];

  // Threat analysis
  threat_classification: {
    confirmed: boolean;
    threat_type: string;
    attack_vector: string[];
    indicators_of_compromise: string[];
    attribution?: string;
  };

  // Response actions
  response_actions: {
    action: string;
    taken_by: string;
    timestamp: string;
    result: string;
  }[];

  // Timeline
  created_at: string;
  updated_at: string;
  closed_at?: string;

  // Documentation
  summary: string;
  recommendations: string[];
  lessons_learned?: string[];
}

export interface ThreatFeed {
  id: string;
  name: string;
  source: string;
  type: "ioc" | "reputation" | "signature" | "intelligence";
  enabled: boolean;

  // Feed configuration
  url?: string;
  api_key?: string;
  refresh_interval_hours: number;
  last_updated: string;

  // Data format
  format: "json" | "csv" | "xml" | "stix";
  indicators_count: number;

  // Quality metrics
  accuracy_rate?: number;
  false_positive_rate?: number;

  // Status
  status: "active" | "error" | "disabled";
  last_error?: string;
}

export interface ThreatIndicator {
  id: string;
  type: "domain" | "ip" | "url" | "email" | "hash" | "pattern";
  value: string;
  threat_level: "info" | "low" | "medium" | "high" | "critical";
  confidence: number;

  // Source information
  source: string;
  feed_id?: string;
  first_seen: string;
  last_seen: string;

  // Context
  tags: string[];
  description?: string;
  malware_families?: string[];
  attack_types?: string[];

  // Relationships
  related_indicators?: string[];
  campaigns?: string[];

  // Expiration
  expires_at?: string;
  active: boolean;
}

export interface ThreatCampaign {
  id: string;
  name: string;
  description: string;
  actor_group?: string;

  // Campaign characteristics
  start_date: string;
  end_date?: string;
  active: boolean;

  // Targets
  target_industries: string[];
  target_regions: string[];
  target_technologies: string[];

  // Tactics, Techniques, and Procedures (TTPs)
  attack_patterns: string[];
  malware_families: string[];
  infrastructure: {
    domains: string[];
    ips: string[];
    urls: string[];
  };

  // Impact
  estimated_victims: number;
  economic_impact?: number;

  // Detection
  detection_rules: string[];
  indicators: string[];

  // Intelligence
  confidence_level: "low" | "medium" | "high";
  source_reliability: "a" | "b" | "c" | "d" | "e"; // NATO reliability scale

  // Metadata
  created_at: string;
  updated_at: string;
  analyst: string;
}

export interface ThreatReport {
  id: string;
  title: string;
  summary: string;
  severity: "info" | "low" | "medium" | "high" | "critical";

  // Report content
  executive_summary: string;
  technical_analysis: string;
  recommendations: string[];

  // Threat details
  threat_actors: string[];
  campaigns: string[];
  indicators: ThreatIndicator[];
  affected_assets: string[];

  // Timeline
  incident_timeline: {
    timestamp: string;
    event: string;
    details: string;
  }[];

  // Metadata
  created_at: string;
  author: string;
  reviewed_by?: string;
  published: boolean;
  classification: "public" | "internal" | "confidential" | "restricted";

  // Distribution
  recipients: string[];
  external_references: string[];
}

// API Request/Response Types
export interface CreateThreatRuleRequest {
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "phishing" | "malware" | "spam" | "policy_violation" | "anomaly";
  conditions: ThreatDetectionRule["conditions"];
  actions: ThreatDetectionRule["actions"];
}

export interface UpdateThreatRuleRequest
  extends Partial<CreateThreatRuleRequest> {
  enabled?: boolean;
}

export interface ThreatRulesResponse {
  rules: ThreatDetectionRule[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ThreatDetectionsResponse {
  detections: ThreatDetectionResult[];
  total: number;
  stats: ThreatMonitoringStats;
  page?: number;
  limit?: number;
}

export interface ThreatAnalysisRequest {
  email_id: string;
  force_rescan?: boolean;
  custom_rules?: string[];
}

export interface ThreatAnalysisResponse {
  email_id: string;
  detections: ThreatDetectionResult[];
  overall_risk: "clean" | "low" | "medium" | "high" | "critical";
  confidence: number;
  scan_duration_ms: number;
  timestamp: string;
}

// Utility Types
export type ThreatSeverity = "low" | "medium" | "high" | "critical";
export type ThreatCategory =
  | "phishing"
  | "malware"
  | "spam"
  | "policy_violation"
  | "anomaly";
export type ThreatStatus =
  | "detected"
  | "analyzing"
  | "confirmed"
  | "false_positive"
  | "resolved";

// State Management Types
export interface ThreatMonitoringState {
  monitoring_enabled: boolean;
  rules: ThreatDetectionRule[];
  recent_detections: ThreatDetectionResult[];
  stats: ThreatMonitoringStats;
  loading: boolean;
  error: string | null;
}

export interface ThreatRuleFormData {
  name: string;
  description: string;
  severity: ThreatSeverity;
  category: ThreatCategory;
  conditions: ThreatDetectionRule["conditions"];
  actions: ThreatDetectionRule["actions"];
}

// Hook return types
export interface UseThreatMonitoring {
  state: ThreatMonitoringState;
  actions: {
    startMonitoring: () => Promise<void>;
    stopMonitoring: () => Promise<void>;
    refreshStats: () => Promise<void>;
    createRule: (rule: CreateThreatRuleRequest) => Promise<ThreatDetectionRule>;
    updateRule: (
      id: string,
      updates: UpdateThreatRuleRequest
    ) => Promise<ThreatDetectionRule>;
    deleteRule: (id: string) => Promise<void>;
    analyzeEmail: (emailId: string) => Promise<ThreatAnalysisResponse>;
  };
}

// Default values and constants
export const DEFAULT_THREAT_RULE: Partial<ThreatDetectionRule> = {
  enabled: true,
  severity: "medium",
  category: "phishing",
  conditions: {
    reputation_threshold: 0.5,
    confidence_threshold: 0.7,
  },
  actions: {
    quarantine: false,
    notify_admin: true,
    block_sender: false,
    escalate: false,
    auto_delete: false,
  },
  trigger_count: 0,
};

export const THREAT_SEVERITY_COLORS: Record<ThreatSeverity, string> = {
  low: "#10B981", // green
  medium: "#F59E0B", // amber
  high: "#EF4444", // red
  critical: "#7C2D12", // dark red
};

export const THREAT_CATEGORY_ICONS: Record<ThreatCategory, string> = {
  phishing: "🎣",
  malware: "🦠",
  spam: "📧",
  policy_violation: "⚖️",
  anomaly: "🔍",
};

export const MONITORING_INTERVALS = {
  REAL_TIME: 5000, // 5 seconds
  FREQUENT: 30000, // 30 seconds
  NORMAL: 300000, // 5 minutes
  SCHEDULED: 3600000, // 1 hour
} as const;
