// Settings and Configuration Data Models

export interface NotificationSettings {
  email_notifications: boolean;
  email_address: string;
  push_notifications: boolean;
  desktop_notifications: boolean;
  notification_types: {
    critical_threats: boolean;
    new_alerts: boolean;
    system_updates: boolean;
    reports_ready: boolean;
    maintenance_windows: boolean;
  };
  notification_frequency: "immediate" | "hourly" | "daily" | "weekly";
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
}

export interface SecuritySettings {
  password_requirements: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special_chars: boolean;
    expiry_days: number;
  };
  session_settings: {
    timeout_minutes: number;
    concurrent_sessions: number;
    remember_me_enabled: boolean;
    force_logout_inactive: boolean;
  };
  two_factor_auth: {
    enabled: boolean;
    method: "totp" | "sms" | "email";
    backup_codes_generated: boolean;
  };
  ip_restrictions: {
    enabled: boolean;
    allowed_ips: string[];
    whitelist_mode: boolean;
  };
  audit_logging: {
    enabled: boolean;
    retention_days: number;
    log_failed_attempts: boolean;
    log_successful_logins: boolean;
  };
}

export interface SystemConfiguration {
  email_processing: {
    scan_frequency_minutes: number;
    max_concurrent_scans: number;
    quarantine_suspicious: boolean;
    auto_delete_malicious: boolean;
    retention_days: number;
  };
  threat_detection: {
    sensitivity_level: "low" | "medium" | "high" | "paranoid";
    ai_model_version: string;
    custom_rules_enabled: boolean;
    whitelist_domains: string[];
    blacklist_domains: string[];
    reputation_threshold: number;
  };
  api_settings: {
    rate_limiting: {
      requests_per_minute: number;
      burst_limit: number;
    };
    timeout_seconds: number;
    retry_attempts: number;
    cache_ttl_minutes: number;
  };
  database_settings: {
    backup_frequency: "hourly" | "daily" | "weekly";
    backup_retention_days: number;
    auto_cleanup_enabled: boolean;
    performance_monitoring: boolean;
  };
}

export interface IntegrationSettings {
  email_providers: {
    name: string;
    type: "imap" | "exchange" | "gmail" | "outlook365";
    enabled: boolean;
    configuration: {
      server: string;
      port: number;
      security: "tls" | "ssl" | "none";
      username: string;
      password_encrypted: string;
      folders_to_scan: string[];
    };
  }[];
  threat_intelligence: {
    virustotal: {
      enabled: boolean;
      api_key_encrypted: string;
      rate_limit: number;
    };
    urlvoid: {
      enabled: boolean;
      api_key_encrypted: string;
    };
    abuseipdb: {
      enabled: boolean;
      api_key_encrypted: string;
    };
    custom_feeds: {
      name: string;
      url: string;
      format: "json" | "csv" | "xml";
      update_frequency_hours: number;
      enabled: boolean;
    }[];
  };
  siem_integration: {
    enabled: boolean;
    type: "splunk" | "elasticsearch" | "sentinel" | "qradar";
    endpoint: string;
    auth_token_encrypted: string;
    log_level: "debug" | "info" | "warning" | "error";
  };
}

export interface AdminSettings {
  user_management: {
    self_registration_enabled: boolean;
    email_verification_required: boolean;
    admin_approval_required: boolean;
    default_role: string;
    password_reset_enabled: boolean;
  };
  system_maintenance: {
    maintenance_mode: boolean;
    maintenance_message: string;
    scheduled_maintenance: {
      enabled: boolean;
      schedule: string; // cron format
      duration_minutes: number;
    };
  };
  license_info: {
    type: "trial" | "basic" | "professional" | "enterprise";
    expires_at: string;
    users_limit: number;
    features_enabled: string[];
  };
  backup_restore: {
    auto_backup_enabled: boolean;
    backup_location: string;
    encryption_enabled: boolean;
    last_backup_date: string;
  };
}

export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  requires_admin: boolean;
  subsections: string[];
}

export interface SettingsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  lastSaved: string | null;
}

export interface SettingsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface SettingsUpdateRequest<T> {
  settings: Partial<T>;
  validate_only?: boolean;
  force_update?: boolean;
}

export interface SettingsValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SettingsValidationResponse {
  valid: boolean;
  errors: SettingsValidationError[];
  warnings: SettingsValidationError[];
}

// Combined settings interface for the main settings object
export interface ApplicationSettings {
  notifications: NotificationSettings;
  security: SecuritySettings;
  system: SystemConfiguration;
  integrations: IntegrationSettings;
  admin: AdminSettings;
}

// Settings export/import interfaces
export interface SettingsExport {
  version: string;
  exported_at: string;
  exported_by: string;
  settings: Partial<ApplicationSettings>;
  metadata: {
    application_version: string;
    export_reason: string;
    includes_sensitive_data: boolean;
  };
}

export interface SettingsImport {
  file_data: string;
  overwrite_existing: boolean;
  validate_before_import: boolean;
  backup_current: boolean;
}

// Audit trail for settings changes
export interface SettingsAuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: "create" | "update" | "delete" | "export" | "import";
  category: string;
  field_name: string;
  old_value: any;
  new_value: any;
  ip_address: string;
  user_agent: string;
  reason?: string;
}

// Form field types for dynamic form generation
export type FieldType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "textarea"
  | "datetime"
  | "time"
  | "date"
  | "url"
  | "json"
  | "array";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  options?: { value: any; label: string }[];
  depends_on?: string;
  admin_only?: boolean;
  sensitive?: boolean;
}

export interface SettingsSectionConfig {
  id: string;
  title: string;
  description: string;
  fields: FormFieldConfig[];
  requires_restart?: boolean;
  requires_admin?: boolean;
}
