// Alert Management Data Models
// Unified alert system for security incidents and notifications

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "investigating" | "resolved" | "dismissed";
export type AlertType =
  | "phishing"
  | "malware"
  | "spam"
  | "policy_violation"
  | "anomaly"
  | "data_leak"
  | "unauthorized_access"
  | "suspicious_activity";

export interface Alert {
  id: number | string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  type: AlertType;
  timestamp: string;

  // Impact assessment
  affected_emails?: number;
  affected_users?: string[];
  affected_systems?: string[];

  // Source and assignment
  source?: string;
  assignee?: string;
  tags?: string[];

  // Additional context
  metadata?: {
    [key: string]: any;
    confidence?: number;
    indicators?: string[];
    evidence_urls?: string[];
    related_alerts?: string[];
  };

  // Lifecycle tracking
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;

  // Escalation
  escalated?: boolean;
  escalated_to?: string;
  escalated_at?: string;
}

export interface AlertAction {
  id: string;
  alert_id: string;
  action_type:
    | "investigate"
    | "resolve"
    | "dismiss"
    | "escalate"
    | "reassign"
    | "comment";
  performed_by: string;
  timestamp: string;
  description: string;

  // Action-specific data
  metadata?: {
    comment?: string;
    assignee?: string;
    resolution_reason?: string;
    escalation_target?: string;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: AlertSeverity;
  type: AlertType;

  // Trigger conditions
  conditions: {
    email_patterns?: {
      sender_patterns?: string[];
      subject_patterns?: string[];
      content_patterns?: string[];
      attachment_patterns?: string[];
    };
    threat_indicators?: {
      reputation_threshold?: number;
      confidence_threshold?: number;
      malware_detected?: boolean;
      phishing_detected?: boolean;
    };
    behavioral_patterns?: {
      unusual_volume?: boolean;
      suspicious_timing?: boolean;
      geographic_anomaly?: boolean;
    };
    policy_violations?: {
      data_classification?: string[];
      external_sharing?: boolean;
      unauthorized_domains?: string[];
    };
  };

  // Alert generation settings
  generate_alert: boolean;
  auto_assign?: string;
  notification_targets?: string[];

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_triggered?: string;
  trigger_count: number;
}

export interface AlertTemplate {
  id: string;
  name: string;
  title_template: string;
  description_template: string;
  severity: AlertSeverity;
  type: AlertType;

  // Template variables
  variables: {
    name: string;
    type: "string" | "number" | "date" | "email" | "url";
    required: boolean;
    default_value?: any;
    description: string;
  }[];

  // Actions to auto-execute
  auto_actions?: {
    quarantine?: boolean;
    notify_admin?: boolean;
    create_ticket?: boolean;
    block_sender?: boolean;
  };

  // Metadata
  created_at: string;
  created_by: string;
  usage_count: number;
}

export interface AlertSummary {
  // Count by status
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  dismissed: number;

  // Count by severity
  critical: number;
  high: number;
  medium: number;
  low: number;

  // Count by type
  by_type: Record<AlertType, number>;

  // Time-based metrics
  avg_resolution_time_hours: number;
  oldest_unresolved_days: number;

  // Trends (compared to previous period)
  trends: {
    total_change: number;
    critical_change: number;
    resolution_time_change: number;
  };
}

export interface AlertFilter {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  type?: AlertType[];
  assignee?: string[];
  source?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  search_query?: string;
  tags?: string[];
}

// Component-specific filter state for UI components
export interface AlertFilterState {
  search: string;
  severity: AlertSeverity[];
  status: AlertStatus[];
  type: AlertType[];
  assignee: string[];
  dateRange: "today" | "3d" | "7d" | "30d" | "custom" | "all";
  tags: string[];
}

export interface AlertBulkAction {
  action: "investigate" | "resolve" | "dismiss" | "reassign" | "delete";
  alert_ids: string[];

  // Action-specific parameters
  assignee?: string;
  resolution_reason?: string;
  comment?: string;
}

export interface AlertNotificationSettings {
  enabled: boolean;
  channels: {
    email: boolean;
    slack: boolean;
    teams: boolean;
    webhook: boolean;
  };

  // Escalation rules
  escalation_rules: {
    severity: AlertSeverity;
    time_threshold_minutes: number;
    escalate_to: string[];
  }[];

  // Notification preferences
  immediate_notification: AlertSeverity[];
  digest_frequency: "hourly" | "daily" | "weekly";
  quiet_hours?: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
}

export interface AlertWorkflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;

  // Trigger conditions
  triggers: {
    alert_types: AlertType[];
    severities: AlertSeverity[];
    sources?: string[];
  };

  // Workflow steps
  steps: {
    id: string;
    name: string;
    type: "automated" | "manual";
    action: string;
    parameters: Record<string, any>;
    delay_minutes?: number;
    conditions?: Record<string, any>;
  }[];

  // Success/failure handling
  on_success?: string; // Next workflow ID
  on_failure?: string; // Fallback workflow ID

  // Metadata
  created_at: string;
  created_by: string;
  execution_count: number;
  success_rate: number;
}

// API Request/Response Types
export interface CreateAlertRequest {
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AlertType;
  source?: string;
  affected_emails?: number;
  affected_users?: string[];
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface UpdateAlertRequest {
  title?: string;
  description?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
  assignee?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface GetAlertsResponse {
  alerts: Alert[];
  total: number;
  page?: number;
  limit?: number;
  summary: AlertSummary;
}

export interface AlertActionResponse {
  success: boolean;
  message: string;
  alert: Alert;
  action: AlertAction;
}

export interface BulkActionResponse {
  success: boolean;
  message: string;
  processed: number;
  failed: number;
  errors?: string[];
}

// State Management Types
export interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  filters: AlertFilter;
  summary: AlertSummary | null;
  selected_alerts: string[];
}

export interface AlertFormData {
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AlertType;
  source: string;
  tags: string[];
  affected_emails?: number;
  affected_users?: string[];
  metadata?: Record<string, any>;
}

// Hook return types
export interface UseAlerts {
  state: AlertState;
  actions: {
    loadAlerts: (filters?: AlertFilter) => Promise<void>;
    createAlert: (alert: CreateAlertRequest) => Promise<Alert>;
    updateAlert: (id: string, updates: UpdateAlertRequest) => Promise<Alert>;
    deleteAlert: (id: string) => Promise<void>;
    performBulkAction: (action: AlertBulkAction) => Promise<BulkActionResponse>;
    selectAlert: (id: string) => void;
    selectAllAlerts: () => void;
    clearSelection: () => void;
    updateFilters: (filters: Partial<AlertFilter>) => void;
    refreshSummary: () => Promise<void>;
  };
}

// Constants and defaults
export const ALERT_SEVERITY_PRIORITY: Record<AlertSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: "#7C2D12", // dark red
  high: "#EF4444", // red
  medium: "#F59E0B", // amber
  low: "#10B981", // green
};

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  open: "#EF4444", // red
  investigating: "#F59E0B", // amber
  resolved: "#10B981", // green
  dismissed: "#6B7280", // gray
};

export const ALERT_TYPE_ICONS: Record<AlertType, string> = {
  phishing: "🎣",
  malware: "🦠",
  spam: "📧",
  policy_violation: "⚖️",
  anomaly: "🔍",
  data_leak: "💧",
  unauthorized_access: "🔓",
  suspicious_activity: "👁️",
};

export const DEFAULT_ALERT_FILTER: AlertFilter = {
  severity: [],
  status: [],
  type: [],
  assignee: [],
  source: [],
  search_query: "",
  tags: [],
};

export const ALERT_AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

// Utility functions
export function getAlertPriority(alert: Alert): number {
  return ALERT_SEVERITY_PRIORITY[alert.severity];
}

export function isAlertOverdue(alert: Alert, slaHours: number = 24): boolean {
  if (alert.status === "resolved" || alert.status === "dismissed") {
    return false;
  }

  const createdAt = new Date(alert.timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  return hoursDiff > slaHours;
}

export function getAlertAge(alert: Alert): string {
  const createdAt = new Date(alert.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function shouldEscalateAlert(
  alert: Alert,
  escalationRules: AlertNotificationSettings["escalation_rules"]
): boolean {
  if (
    alert.escalated ||
    alert.status === "resolved" ||
    alert.status === "dismissed"
  ) {
    return false;
  }

  const rule = escalationRules.find((r) => r.severity === alert.severity);
  if (!rule) return false;

  const createdAt = new Date(alert.timestamp);
  const now = new Date();
  const minutesDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60);

  return minutesDiff > rule.time_threshold_minutes;
}
