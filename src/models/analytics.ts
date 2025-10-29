// Analytics and Reporting Data Models

export interface ThreatMetrics {
  total_emails: number;
  high_risk_emails: number;
  malicious_count: number;
  suspicious_count: number;
  clean_count: number;
  blocked_count: number;
  average_risk_score: number;
  detection_rate: number;
  false_positive_rate: number;
}

export interface ThreatTrend {
  date: string;
  threats_detected: number;
  emails_processed: number;
  blocked_emails: number;
  average_risk: number;
  top_threat_types: string[];
}

export interface DomainIntelligence {
  domain: string;
  reputation_score: number;
  threat_level: "clean" | "suspicious" | "malicious";
  first_seen: string;
  last_seen: string;
  email_count: number;
  malicious_engines: string[];
  total_engines: number;
  categories: string[];
  geographic_distribution: {
    country: string;
    count: number;
  }[];
}

export interface IPIntelligence {
  ip: string;
  reputation_score: number;
  threat_level: "clean" | "suspicious" | "malicious";
  first_seen: string;
  last_seen: string;
  email_count: number;
  malicious_engines: string[];
  total_engines: number;
  categories: string[];
  geographic_distribution: {
    country: string;
    count: number;
  }[];
  asn?: string;
  isp?: string;
}

export interface EmailIntelligence {
  email: string;
  sender_name?: string;
  domain: string;
  reputation_score: number;
  threat_level: "clean" | "suspicious" | "malicious";
  threat_reasons?: string[];
  first_seen: string;
  last_seen: string;
  email_count: number;
  malicious_engines: string[] | number;
  total_engines: number;
  categories: string[];
  is_blocked: boolean;
}

export interface ThreatActorProfile {
  actor_id: string;
  name: string;
  confidence_level: number;
  first_activity: string;
  last_activity: string;
  attack_patterns: string[];
  target_industries: string[];
  email_signatures: string[];
  associated_domains: string[];
  associated_ips: string[];
  ttps: {
    // Tactics, Techniques, and Procedures
    tactic: string;
    technique: string;
    description: string;
  }[];
}

export interface SecurityIncident {
  incident_id: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "contained" | "resolved";
  title: string;
  description: string;
  affected_users: string[];
  threat_vectors: string[];
  indicators_of_compromise: {
    type: string;
    value: string;
    confidence: number;
  }[];
  timeline: {
    timestamp: string;
    event: string;
    details: string;
  }[];
  created_at: string;
  updated_at: string;
  assigned_to: string;
}

export interface ThreatIntelligence {
  indicator: string;
  type: "domain" | "ip" | "url" | "email" | "hash";
  threat_level: "critical" | "high" | "medium" | "low" | "info";
  confidence: number;
  source: string;
  first_seen: string;
  last_seen: string;
  tags: string[];
  context: string;
  related_campaigns: string[];
}

export interface GeographicThreat {
  country_code: string;
  country_name: string;
  threat_count: number;
  risk_level: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  top_threat_types: string[];
}

export interface AttackPattern {
  pattern_id: string;
  name: string;
  description: string;
  frequency: number;
  success_rate: number;
  targeted_industries: string[];
  common_techniques: string[];
  indicators: string[];
  mitigation_strategies: string[];
}

export interface ComplianceMetrics {
  framework: string; // e.g., "NIST", "ISO27001", "GDPR"
  compliance_score: number;
  requirements_met: number;
  total_requirements: number;
  gap_analysis: {
    requirement: string;
    status: "compliant" | "partial" | "non-compliant";
    description: string;
    remediation_steps: string[];
  }[];
  last_assessment: string;
}

export interface PerformanceMetrics {
  detection_latency: number; // milliseconds
  processing_throughput: number; // emails per minute
  system_uptime: number; // percentage
  api_response_time: number; // milliseconds
  error_rate: number; // percentage
  resource_utilization: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_usage: number;
  };
}

export interface ReportConfig {
  report_id: string;
  name: string;
  type: "executive" | "technical" | "compliance" | "incident";
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  format: "pdf" | "html" | "csv" | "json";
  recipients: string[];
  sections: string[];
  filters: {
    date_range: {
      start: string;
      end: string;
    };
    threat_levels: string[];
    domains: string[];
    users: string[];
  };
  created_at: string;
  last_generated: string;
}

export interface AnalyticsFilters {
  date_range: {
    start: string;
    end: string;
  };
  threat_levels: string[];
  domains: string[];
  countries: string[];
  attack_types: string[];
  confidence_threshold: number;
}

export interface AnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AnalyticsDashboardData {
  metrics: ThreatMetrics;
  trends: ThreatTrend[];
  top_domains: DomainIntelligence[];
  threat_actors: ThreatActorProfile[];
  incidents: SecurityIncident[];
  intelligence: ThreatIntelligence[];
  geographic_threats: GeographicThreat[];
  attack_patterns: AttackPattern[];
  compliance: ComplianceMetrics[];
  performance: PerformanceMetrics;
  generated_at: string;
}

// API Response types
export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsDashboardData;
  timestamp: string;
}

export interface ReportGenerationResponse {
  success: boolean;
  report_url: string;
  report_id: string;
  file_size: number;
  generated_at: string;
}

export interface ThreatIntelligenceQuery {
  indicator?: string;
  type?: string;
  threat_level?: string;
  source?: string;
  date_range?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

// Chart data interfaces for visualization
export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  [key: string]: string | number;
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
  category?: string;
}

export interface NetworkGraphNode {
  id: string;
  label: string;
  type: "domain" | "ip" | "email" | "actor";
  threat_level: string;
  size: number;
  color: string;
}

export interface NetworkGraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
  color: string;
}

export interface NetworkGraphData {
  nodes: NetworkGraphNode[];
  edges: NetworkGraphEdge[];
}
