import { useState, useEffect, useCallback } from "react";
import { threatAlertService } from "../services/threatAlertService";
import { useNotifications } from "../contexts/NotificationContext";
import type { ThreatAlert } from "../types/notifications";
import type {
  ThreatAlertSummary,
  ThreatMonitoringStats,
  ThreatAlertRule,
} from "../services/threatAlertService";

export interface ThreatAlertState {
  summary: ThreatAlertSummary | null;
  stats: ThreatMonitoringStats | null;
  rules: ThreatAlertRule[];
  isMonitoring: boolean;
  loading: boolean;
  error: string | null;
}

export interface ThreatAlertActions {
  loadThreatData: () => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  addThreatRule: (rule: Omit<ThreatAlertRule, "id">) => string;
  updateThreatRule: (id: string, updates: Partial<ThreatAlertRule>) => boolean;
  deleteThreatRule: (id: string) => boolean;
  clearAlertHistory: () => void;
  refreshData: () => void;
}

export function useThreatAlerts(): ThreatAlertState & ThreatAlertActions {
  const [state, setState] = useState<ThreatAlertState>({
    summary: null,
    stats: null,
    rules: [],
    isMonitoring: false,
    loading: true,
    error: null,
  });

  const { addNotification } = useNotifications();

  // Initialize threat monitoring
  useEffect(() => {
    initializeThreatService();

    // Set up event listeners for threat alerts
    const handleThreatAlert = (event: CustomEvent) => {
      const alert = event.detail;
      addNotification(alert);
    };

    const handleExternalThreatAlert = (event: CustomEvent) => {
      const alert: ThreatAlert = event.detail;
      addNotification({
        type: "threat",
        title: `External Threat Alert`,
        message: `${alert.payload.threat_type.toUpperCase()} detected from ${
          alert.payload.sender
        }`,
        persistent: alert.payload.severity === "critical",
        metadata: {
          severity: alert.payload.severity,
          email_id: alert.payload.email_id,
          threat_type: alert.payload.threat_type,
        },
      });
    };

    window.addEventListener("threat-alert", handleThreatAlert as EventListener);
    window.addEventListener(
      "external-threat-alert",
      handleExternalThreatAlert as EventListener
    );

    return () => {
      window.removeEventListener(
        "threat-alert",
        handleThreatAlert as EventListener
      );
      window.removeEventListener(
        "external-threat-alert",
        handleExternalThreatAlert as EventListener
      );
    };
  }, [addNotification]);

  const initializeThreatService = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      await threatAlertService.initialize();
      await loadThreatData();

      setState((prev) => ({
        ...prev,
        isMonitoring: true,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize threat service",
        loading: false,
      }));
    }
  };

  const loadThreatData = useCallback(async () => {
    try {
      const summary = threatAlertService.getThreatSummary();
      const stats = threatAlertService.getMonitoringStats();
      const rules = threatAlertService.getThreatRules();

      setState((prev) => ({
        ...prev,
        summary,
        stats,
        rules,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to load threat data",
      }));
    }
  }, []);

  const startMonitoring = useCallback(() => {
    threatAlertService.startMonitoring();
    setState((prev) => ({ ...prev, isMonitoring: true }));
  }, []);

  const stopMonitoring = useCallback(() => {
    threatAlertService.stopMonitoring();
    setState((prev) => ({ ...prev, isMonitoring: false }));
  }, []);

  const addThreatRule = useCallback(
    (rule: Omit<ThreatAlertRule, "id">) => {
      const ruleId = threatAlertService.addThreatRule(rule);
      loadThreatData(); // Refresh data
      return ruleId;
    },
    [loadThreatData]
  );

  const updateThreatRule = useCallback(
    (id: string, updates: Partial<ThreatAlertRule>) => {
      const success = threatAlertService.updateThreatRule(id, updates);
      if (success) {
        loadThreatData(); // Refresh data
      }
      return success;
    },
    [loadThreatData]
  );

  const deleteThreatRule = useCallback(
    (id: string) => {
      const success = threatAlertService.deleteThreatRule(id);
      if (success) {
        loadThreatData(); // Refresh data
      }
      return success;
    },
    [loadThreatData]
  );

  const clearAlertHistory = useCallback(() => {
    threatAlertService.clearAlertHistory();
    loadThreatData(); // Refresh data
  }, [loadThreatData]);

  const refreshData = useCallback(() => {
    loadThreatData();
  }, [loadThreatData]);

  return {
    ...state,
    loadThreatData,
    startMonitoring,
    stopMonitoring,
    addThreatRule,
    updateThreatRule,
    deleteThreatRule,
    clearAlertHistory,
    refreshData,
  };
}

// Hook for threat alert notifications
export function useThreatNotifications() {
  const { addNotification } = useNotifications();

  const notifyThreat = useCallback(
    (
      threatType: string,
      severity: "low" | "medium" | "high" | "critical",
      sender: string,
      subject: string,
      emailId: string
    ) => {
      addNotification({
        type: "threat",
        title: `${severity.toUpperCase()} Threat Detected`,
        message: `${threatType.toUpperCase()} from ${sender}`,
        persistent: severity === "critical" || severity === "high",
        metadata: {
          severity,
          email_id: emailId,
          threat_type: threatType,
          sender,
          subject,
        },
        actions: [
          {
            id: "investigate",
            label: "Investigate",
            action: () => {
              window.location.href = `/emails?highlight=${emailId}`;
            },
            primary: true,
          },
          {
            id: "quarantine",
            label: "Quarantine",
            action: () => {
              // Handle quarantine action
              console.log("Quarantine email:", emailId);
            },
            destructive: true,
          },
        ],
      });
    },
    [addNotification]
  );

  const notifySystemUpdate = useCallback(
    (
      component: string,
      status: "updating" | "completed" | "failed",
      message: string
    ) => {
      addNotification({
        type:
          status === "failed"
            ? "error"
            : status === "completed"
            ? "success"
            : "info",
        title: `System Update: ${component}`,
        message,
        duration: status === "completed" ? 5000 : undefined,
      });
    },
    [addNotification]
  );

  const notifyScanComplete = useCallback(
    (emailsProcessed: number, threatsFound: number, scanDuration: number) => {
      addNotification({
        type: threatsFound > 0 ? "warning" : "success",
        title: "Email Scan Complete",
        message: `Processed ${emailsProcessed} emails, found ${threatsFound} threats in ${scanDuration}s`,
        duration: 5000,
      });
    },
    [addNotification]
  );

  return {
    notifyThreat,
    notifySystemUpdate,
    notifyScanComplete,
  };
}
