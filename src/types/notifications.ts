// Notification Types and Interfaces

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "threat";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // Auto-dismiss time in milliseconds
  persistent?: boolean; // If true, requires manual dismissal
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  read?: boolean;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  primary?: boolean;
  destructive?: boolean;
}

export interface NotificationPreferences {
  browser_notifications: boolean;
  email_notifications: boolean;
  sound_enabled: boolean;
  threat_alerts: boolean;
  system_updates: boolean;
  email_reports: boolean;
  weekly_summary: boolean;
  do_not_disturb: boolean;
  do_not_disturb_schedule?: {
    enabled: boolean;
    start_time: string; // "HH:MM"
    end_time: string; // "HH:MM"
  };
  notification_types: {
    [key in NotificationType]: {
      enabled: boolean;
      browser: boolean;
      email: boolean;
      sound: boolean;
    };
  };
}

// Real-time Event Types
export interface WebSocketMessage {
  type:
    | "notification"
    | "alert"
    | "system_update"
    | "email_scan_complete"
    | "threat_detected";
  payload: any;
  timestamp: string;
}

export interface ThreatAlert extends WebSocketMessage {
  type: "threat_detected";
  payload: {
    email_id: string;
    threat_type: string;
    severity: "low" | "medium" | "high" | "critical";
    sender: string;
    subject: string;
    detected_at: string;
    action_required: boolean;
  };
}

export interface SystemUpdate extends WebSocketMessage {
  type: "system_update";
  payload: {
    component: string;
    status: "updating" | "completed" | "failed";
    message: string;
    progress?: number;
  };
}

export interface EmailScanComplete extends WebSocketMessage {
  type: "email_scan_complete";
  payload: {
    scan_id: string;
    emails_processed: number;
    threats_found: number;
    scan_duration: number;
    summary: {
      clean: number;
      suspicious: number;
      malicious: number;
      quarantined: number;
    };
  };
}

// Notification Context Types
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isConnected: boolean;

  // Actions
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;

  // Real-time connection
  connect: () => void;
  disconnect: () => void;

  // Notification permissions
  requestBrowserPermission: () => Promise<boolean>;
  hasBrowserPermission: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  browser_notifications: true,
  email_notifications: true,
  sound_enabled: true,
  threat_alerts: true,
  system_updates: true,
  email_reports: true,
  weekly_summary: true,
  do_not_disturb: false,
  do_not_disturb_schedule: {
    enabled: false,
    start_time: "22:00",
    end_time: "08:00",
  },
  notification_types: {
    success: {
      enabled: true,
      browser: true,
      email: false,
      sound: false,
    },
    error: {
      enabled: true,
      browser: true,
      email: true,
      sound: true,
    },
    warning: {
      enabled: true,
      browser: true,
      email: false,
      sound: true,
    },
    info: {
      enabled: true,
      browser: false,
      email: false,
      sound: false,
    },
    threat: {
      enabled: true,
      browser: true,
      email: true,
      sound: true,
    },
  },
};

// Utility functions
export function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

export function isInDoNotDisturbPeriod(
  preferences: NotificationPreferences
): boolean {
  if (
    !preferences.do_not_disturb ||
    !preferences.do_not_disturb_schedule?.enabled
  ) {
    return false;
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const { start_time, end_time } = preferences.do_not_disturb_schedule;

  if (start_time <= end_time) {
    // Same day period (e.g., 09:00 to 17:00)
    return currentTime >= start_time && currentTime <= end_time;
  } else {
    // Overnight period (e.g., 22:00 to 08:00)
    return currentTime >= start_time || currentTime <= end_time;
  }
}

export function shouldShowNotification(
  notification: Partial<Notification>,
  preferences: NotificationPreferences
): boolean {
  if (!notification.type) return false;

  const typePrefs = preferences.notification_types[notification.type];
  if (!typePrefs?.enabled) return false;

  if (preferences.do_not_disturb && isInDoNotDisturbPeriod(preferences)) {
    // Only allow critical threat notifications during do not disturb
    return (
      notification.type === "threat" &&
      notification.metadata?.severity === "critical"
    );
  }

  return true;
}

export function getNotificationSound(type: NotificationType): string | null {
  const soundMap: Record<NotificationType, string> = {
    success: "/sounds/success.mp3",
    error: "/sounds/error.mp3",
    warning: "/sounds/warning.mp3",
    info: "/sounds/info.mp3",
    threat: "/sounds/threat-alert.mp3",
  };

  return soundMap[type] || null;
}
