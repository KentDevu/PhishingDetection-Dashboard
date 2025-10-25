// React hooks for Automated Threat Response System
// Comprehensive state management for threat response automation

import { useState, useEffect, useCallback } from "react";
import { automatedThreatResponseService } from "../services/automatedThreatResponseService";
import { useNotifications } from "../contexts/NotificationContext";
import type {
  ResponseRule,
  ResponseExecution,
  ResponseAnalytics,
  ResponseAction,
} from "../services/automatedThreatResponseService";

// Hook for managing response rules
export function useResponseRules() {
  const [rules, setRules] = useState<ResponseRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rulesList = automatedThreatResponseService.getRules();
      setRules(rulesList);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load response rules";
      setError(errorMessage);
      addNotification({
        type: "error",
        title: "Failed to Load Rules",
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createRule = useCallback(
    async (rule: Omit<ResponseRule, "id" | "created_at" | "updated_at">) => {
      try {
        const newRule = automatedThreatResponseService.createRule(rule);
        setRules((prev) => [...prev, newRule]);

        addNotification({
          type: "success",
          title: "Rule Created",
          message: `Response rule "${newRule.name}" has been created successfully`,
          duration: 4000,
        });

        return newRule;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create rule";
        addNotification({
          type: "error",
          title: "Failed to Create Rule",
          message: errorMessage,
          duration: 5000,
        });
        throw err;
      }
    },
    [addNotification]
  );

  const updateRule = useCallback(
    async (ruleId: string, updates: Partial<ResponseRule>) => {
      try {
        const updatedRule = automatedThreatResponseService.updateRule(
          ruleId,
          updates
        );
        if (updatedRule) {
          setRules((prev) =>
            prev.map((rule) => (rule.id === ruleId ? updatedRule : rule))
          );

          addNotification({
            type: "success",
            title: "Rule Updated",
            message: `Response rule "${updatedRule.name}" has been updated`,
            duration: 4000,
          });

          return updatedRule;
        }
        throw new Error("Rule not found");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update rule";
        addNotification({
          type: "error",
          title: "Failed to Update Rule",
          message: errorMessage,
          duration: 5000,
        });
        throw err;
      }
    },
    [addNotification]
  );

  const deleteRule = useCallback(
    async (ruleId: string) => {
      try {
        const success = automatedThreatResponseService.deleteRule(ruleId);
        if (success) {
          setRules((prev) => prev.filter((rule) => rule.id !== ruleId));

          addNotification({
            type: "success",
            title: "Rule Deleted",
            message: "Response rule has been deleted successfully",
            duration: 4000,
          });
        } else {
          throw new Error("Failed to delete rule");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete rule";
        addNotification({
          type: "error",
          title: "Failed to Delete Rule",
          message: errorMessage,
          duration: 5000,
        });
        throw err;
      }
    },
    [addNotification]
  );

  const toggleRule = useCallback(
    async (ruleId: string, enabled: boolean) => {
      try {
        await updateRule(ruleId, { enabled });
      } catch (err) {
        console.error("Failed to toggle rule:", err);
      }
    },
    [updateRule]
  );

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refresh: loadRules,
  };
}

// Hook for monitoring response executions
export function useResponseExecutions() {
  const [activeExecutions, setActiveExecutions] = useState<ResponseExecution[]>(
    []
  );
  const [executionHistory, setExecutionHistory] = useState<ResponseExecution[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const loadExecutions = useCallback(async () => {
    try {
      setLoading(true);
      const active = automatedThreatResponseService.getActiveExecutions();
      const history = automatedThreatResponseService.getExecutionHistory(100);

      setActiveExecutions(active);
      setExecutionHistory(history);
    } catch (err) {
      console.error("Failed to load executions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveExecution = useCallback(
    async (executionId: string, approvedBy: string = "current_user") => {
      try {
        const success = automatedThreatResponseService.approveExecution(
          executionId,
          approvedBy
        );
        if (success) {
          await loadExecutions(); // Refresh data

          addNotification({
            type: "success",
            title: "Execution Approved",
            message: `Threat response execution has been approved and will continue`,
            duration: 4000,
          });
        } else {
          throw new Error("Failed to approve execution");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to approve execution";
        addNotification({
          type: "error",
          title: "Approval Failed",
          message: errorMessage,
          duration: 5000,
        });
      }
    },
    [loadExecutions, addNotification]
  );

  const cancelExecution = useCallback(
    async (executionId: string) => {
      try {
        const success =
          automatedThreatResponseService.cancelExecution(executionId);
        if (success) {
          await loadExecutions(); // Refresh data

          addNotification({
            type: "warning",
            title: "Execution Cancelled",
            message: "Threat response execution has been cancelled",
            duration: 4000,
          });
        } else {
          throw new Error("Failed to cancel execution");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to cancel execution";
        addNotification({
          type: "error",
          title: "Cancellation Failed",
          message: errorMessage,
          duration: 5000,
        });
      }
    },
    [loadExecutions, addNotification]
  );

  // Auto-refresh executions every 30 seconds
  useEffect(() => {
    loadExecutions();

    const interval = setInterval(loadExecutions, 30000);
    return () => clearInterval(interval);
  }, [loadExecutions]);

  return {
    activeExecutions,
    executionHistory,
    loading,
    approveExecution,
    cancelExecution,
    refresh: loadExecutions,
  };
}

// Hook for response analytics
export function useResponseAnalytics() {
  const [analytics, setAnalytics] = useState<ResponseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = automatedThreatResponseService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();

    // Refresh analytics every 60 seconds
    const interval = setInterval(loadAnalytics, 60000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    refresh: loadAnalytics,
  };
}

// Hook for system control
export function useAutomatedResponseControl() {
  const [isEnabled, setIsEnabled] = useState(
    automatedThreatResponseService.isEnabled()
  );
  const { addNotification } = useNotifications();

  const toggleSystem = useCallback(
    async (enabled: boolean) => {
      try {
        automatedThreatResponseService.setEnabled(enabled);
        setIsEnabled(enabled);

        addNotification({
          type: enabled ? "success" : "warning",
          title: `Automated Response ${enabled ? "Enabled" : "Disabled"}`,
          message: `Automated threat response system is now ${
            enabled ? "active" : "inactive"
          }`,
          duration: 4000,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to toggle system";
        addNotification({
          type: "error",
          title: "System Toggle Failed",
          message: errorMessage,
          duration: 5000,
        });
      }
    },
    [addNotification]
  );

  return {
    isEnabled,
    toggleSystem,
  };
}

// Comprehensive hook that combines all functionality
export function useAutomatedThreatResponse() {
  const rulesData = useResponseRules();
  const executionsData = useResponseExecutions();
  const analyticsData = useResponseAnalytics();
  const controlData = useAutomatedResponseControl();

  // Combined loading state
  const loading =
    rulesData.loading || executionsData.loading || analyticsData.loading;

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      rulesData.refresh(),
      executionsData.refresh(),
      analyticsData.refresh(),
    ]);
  }, [rulesData.refresh, executionsData.refresh, analyticsData.refresh]);

  // Get pending approvals count
  const pendingApprovals = executionsData.activeExecutions.filter(
    (exec) => exec.approval_required && !exec.approved_by
  ).length;

  return {
    // Rules management
    rules: rulesData.rules,
    createRule: rulesData.createRule,
    updateRule: rulesData.updateRule,
    deleteRule: rulesData.deleteRule,
    toggleRule: rulesData.toggleRule,

    // Executions monitoring
    activeExecutions: executionsData.activeExecutions,
    executionHistory: executionsData.executionHistory,
    approveExecution: executionsData.approveExecution,
    cancelExecution: executionsData.cancelExecution,

    // Analytics
    analytics: analyticsData.analytics,

    // System control
    isEnabled: controlData.isEnabled,
    toggleSystem: controlData.toggleSystem,

    // Combined state
    loading,
    pendingApprovals,
    refreshAll,

    // Error handling
    error: rulesData.error,
  };
}

// Helper hooks for specific use cases
export function usePendingApprovals() {
  const { activeExecutions } = useResponseExecutions();

  const pendingExecutions = activeExecutions.filter(
    (exec) => exec.approval_required && !exec.approved_by
  );

  return {
    pendingExecutions,
    count: pendingExecutions.length,
    hasPending: pendingExecutions.length > 0,
  };
}

export function useResponseMetrics() {
  const { analytics } = useResponseAnalytics();

  if (!analytics) {
    return {
      totalResponses: 0,
      successRate: 0,
      averageResponseTime: 0,
      topActions: [],
      loading: true,
    };
  }

  const topActions = Object.entries(analytics.action_distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([action, count]) => ({ action: action as ResponseAction, count }));

  return {
    totalResponses: analytics.total_responses,
    successRate: Math.round(analytics.success_rate * 100),
    averageResponseTime: Math.round(analytics.response_times.average_ms / 1000),
    topActions,
    loading: false,
  };
}
