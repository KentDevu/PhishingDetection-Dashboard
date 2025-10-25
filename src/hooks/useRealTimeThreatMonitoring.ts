// Real-time Threat Monitoring Hook
// React hook for managing real-time threat monitoring and events

import { useState, useEffect, useCallback, useRef } from "react";
import { realTimeThreatMonitor } from "../services/realTimeThreatMonitor";
import type { RealTimeThreatEvent } from "../services/realTimeThreatMonitor";
import { useNotifications } from "../contexts/NotificationContext";

interface UseRealTimeThreatMonitoringOptions {
  autoStart?: boolean;
  eventFilters?: {
    types?: string[];
    severities?: string[];
  };
  maxEvents?: number;
  notificationEnabled?: boolean;
}

interface RealTimeThreatMonitoringState {
  isMonitoring: boolean;
  connectionStatus: string;
  recentEvents: RealTimeThreatEvent[];
  threatEvents: RealTimeThreatEvent[];
  systemEvents: RealTimeThreatEvent[];
  eventCount: number;
  loading: boolean;
  error: string | null;
}

export function useRealTimeThreatMonitoring(
  options: UseRealTimeThreatMonitoringOptions = {}
) {
  const {
    autoStart = false,
    eventFilters = {},
    maxEvents = 50,
    notificationEnabled = true,
  } = options;

  const { addNotification } = useNotifications();

  const [state, setState] = useState<RealTimeThreatMonitoringState>({
    isMonitoring: realTimeThreatMonitor.isMonitoring,
    connectionStatus: realTimeThreatMonitor.connectionStatus,
    recentEvents: [],
    threatEvents: [],
    systemEvents: [],
    eventCount: 0,
    loading: false,
    error: null,
  });

  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Update state with current monitoring status
  const updateState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMonitoring: realTimeThreatMonitor.isMonitoring,
      connectionStatus: realTimeThreatMonitor.connectionStatus,
      recentEvents: realTimeThreatMonitor.getRecentEvents(maxEvents),
      threatEvents: realTimeThreatMonitor.getThreatEvents(maxEvents),
      systemEvents: realTimeThreatMonitor.getSystemEvents(maxEvents),
      eventCount: realTimeThreatMonitor.eventCount,
    }));
  }, [maxEvents]);

  // Handle new threat events
  const handleThreatEvent = useCallback(
    (event: RealTimeThreatEvent) => {
      // Filter events if filters are specified
      if (eventFilters.types && !eventFilters.types.includes(event.type)) {
        return;
      }
      if (
        eventFilters.severities &&
        !eventFilters.severities.includes(event.severity)
      ) {
        return;
      }

      // Update state
      updateState();

      // Create notification for high-priority threats
      if (
        notificationEnabled &&
        (event.severity === "high" || event.severity === "critical")
      ) {
        const notificationType =
          event.type === "threat_detected"
            ? "threat"
            : event.severity === "critical"
            ? "error"
            : event.severity === "high"
            ? "warning"
            : "info";

        addNotification({
          type: notificationType,
          title: event.title,
          message: event.description,
          persistent: event.severity === "critical",
          metadata: event.metadata,
          actions:
            event.type === "threat_detected" && event.email_id
              ? [
                  {
                    id: "view-email",
                    label: "View Email",
                    action: () => {
                      window.location.href = `/emails?highlight=${event.email_id}`;
                    },
                    primary: true,
                  },
                  {
                    id: "investigate",
                    label: "Investigate",
                    action: () => {
                      window.location.href = `/threats?event=${event.id}`;
                    },
                  },
                ]
              : undefined,
        });
      }
    },
    [addNotification, eventFilters, notificationEnabled, updateState]
  );

  // Handle system events
  const handleSystemEvent = useCallback(
    (event: RealTimeThreatEvent) => {
      updateState();

      // Create notification for system alerts
      if (notificationEnabled && event.severity !== "low") {
        const notificationType =
          event.severity === "critical"
            ? "error"
            : event.severity === "high"
            ? "warning"
            : "info";

        addNotification({
          type: notificationType,
          title: event.title,
          message: event.description,
          duration: event.severity === "medium" ? 3000 : undefined,
          metadata: event.metadata,
        });
      }
    },
    [addNotification, notificationEnabled, updateState]
  );

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    if (state.isMonitoring) {
      console.log("Monitoring already active");
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await realTimeThreatMonitor.start();

      // Subscribe to events
      const unsubscribes = [
        realTimeThreatMonitor.on("threat_detected", handleThreatEvent),
        realTimeThreatMonitor.on("system_alert", handleSystemEvent),
        realTimeThreatMonitor.on("scan_complete", handleSystemEvent),
        realTimeThreatMonitor.on("email_processed", (_event) => {
          // Only update state for email processing events, no notifications
          updateState();
        }),
      ];

      unsubscribeRefs.current = unsubscribes;

      updateState();
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error("Failed to start threat monitoring:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to start monitoring",
      }));
    }
  }, [state.isMonitoring, handleThreatEvent, handleSystemEvent, updateState]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    if (!state.isMonitoring) {
      console.log("Monitoring not active");
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Unsubscribe from events
      unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
      unsubscribeRefs.current = [];

      await realTimeThreatMonitor.stop();

      updateState();
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error("Failed to stop threat monitoring:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to stop monitoring",
      }));
    }
  }, [state.isMonitoring, updateState]);

  // Refresh events
  const refreshEvents = useCallback(() => {
    updateState();
  }, [updateState]);

  // Clear events
  const clearEvents = useCallback(() => {
    setState((prev) => ({
      ...prev,
      recentEvents: [],
      threatEvents: [],
      systemEvents: [],
      eventCount: 0,
    }));
  }, []);

  // Get events by type
  const getEventsByType = useCallback(
    (eventType: string, limit?: number) => {
      return realTimeThreatMonitor.getEventsByType(
        eventType,
        limit || maxEvents
      );
    },
    [maxEvents]
  );

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (autoStart && !realTimeThreatMonitor.isMonitoring) {
      startMonitoring();
    }

    // Cleanup on unmount
    return () => {
      unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
    };
  }, [autoStart, startMonitoring]);

  // Periodic state refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeThreatMonitor.isMonitoring) {
        updateState();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [updateState]);

  return {
    // State
    ...state,

    // Actions
    startMonitoring,
    stopMonitoring,
    refreshEvents,
    clearEvents,
    getEventsByType,

    // Computed values
    hasActiveThreats: state.threatEvents.some(
      (e) => e.severity === "high" || e.severity === "critical"
    ),
    hasRecentActivity: state.recentEvents.length > 0,

    // Statistics
    stats: {
      totalEvents: state.eventCount,
      threatCount: state.threatEvents.length,
      systemEventCount: state.systemEvents.length,
      criticalThreats: state.threatEvents.filter(
        (e) => e.severity === "critical"
      ).length,
      highThreats: state.threatEvents.filter((e) => e.severity === "high")
        .length,
    },
  };
}

// Hook for specific threat monitoring
export function useThreatEvents(
  options: { autoRefresh?: boolean; limit?: number } = {}
) {
  const { autoRefresh = true, limit = 50 } = options;

  const [threatEvents, setThreatEvents] = useState<RealTimeThreatEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshThreatEvents = useCallback(() => {
    setLoading(true);
    const events = realTimeThreatMonitor.getThreatEvents(limit);
    setThreatEvents(events);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    refreshThreatEvents();

    if (autoRefresh) {
      const unsubscribe = realTimeThreatMonitor.on(
        "threat_detected",
        refreshThreatEvents
      );
      return unsubscribe;
    }
  }, [autoRefresh, refreshThreatEvents]);

  return {
    threatEvents,
    loading,
    refresh: refreshThreatEvents,
    criticalThreats: threatEvents.filter((e) => e.severity === "critical"),
    highThreats: threatEvents.filter((e) => e.severity === "high"),
    recentThreats: threatEvents.slice(0, 10),
  };
}

// Hook for system events monitoring
export function useSystemEvents(
  options: { autoRefresh?: boolean; limit?: number } = {}
) {
  const { autoRefresh = true, limit = 50 } = options;

  const [systemEvents, setSystemEvents] = useState<RealTimeThreatEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSystemEvents = useCallback(() => {
    setLoading(true);
    const events = realTimeThreatMonitor.getSystemEvents(limit);
    setSystemEvents(events);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    refreshSystemEvents();

    if (autoRefresh) {
      const unsubscribe = realTimeThreatMonitor.on(
        "system_alert",
        refreshSystemEvents
      );
      return unsubscribe;
    }
  }, [autoRefresh, refreshSystemEvents]);

  return {
    systemEvents,
    loading,
    refresh: refreshSystemEvents,
    criticalAlerts: systemEvents.filter((e) => e.severity === "critical"),
    recentAlerts: systemEvents.slice(0, 10),
  };
}
