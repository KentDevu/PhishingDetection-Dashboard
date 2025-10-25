// Automated Threat Response Dashboard
// Comprehensive management interface for threat response automation

import React, { useState } from "react";
import {
  Shield,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Eye,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAutomatedThreatResponse } from "../../hooks/useAutomatedThreatResponse";
import type {
  ResponseRule,
  ResponseExecution,
} from "../../services/automatedThreatResponseService";

interface ResponseDashboardProps {
  className?: string;
}

// Main dashboard component
export const AutomatedResponseDashboard: React.FC<ResponseDashboardProps> = ({
  className = "",
}) => {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "rules" | "executions" | "analytics"
  >("overview");
  const [selectedRule, setSelectedRule] = useState<ResponseRule | null>(null);
  const [selectedExecution, setSelectedExecution] =
    useState<ResponseExecution | null>(null);

  const {
    rules,
    activeExecutions,
    executionHistory,
    analytics,
    isEnabled,
    pendingApprovals,
    loading,
    toggleSystem,
    approveExecution,
    cancelExecution,
    toggleRule,
    refreshAll,
  } = useAutomatedThreatResponse();

  // Get action color for badges
  const getActionColor = (action: string): string => {
    switch (action) {
      case "quarantine":
        return "bg-red-500 text-white";
      case "block_sender":
        return "bg-orange-500 text-white";
      case "escalate":
        return "bg-yellow-600 text-white";
      case "monitor":
        return "bg-blue-500 text-white";
      case "notify_admin":
        return "bg-purple-500 text-white";
      case "auto_delete":
        return "bg-red-700 text-white";
      case "mark_safe":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get execution status color
  const getExecutionStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-black";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      case "cancelled":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading automated response system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`automated-response-dashboard ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Shield className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Automated Threat Response
            </h1>
            <p className="text-gray-600">
              Intelligent automation for threat detection and response
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              isEnabled
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isEnabled ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium">
              {isEnabled ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Control Buttons */}
          <Button
            onClick={() => toggleSystem(!isEnabled)}
            variant={isEnabled ? "destructive" : "default"}
            size="sm"
          >
            {isEnabled ? <Pause size={16} /> : <Play size={16} />}
            {isEnabled ? "Disable" : "Enable"} System
          </Button>

          <Button onClick={refreshAll} variant="outline" size="sm">
            <Activity size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            <span className="font-medium text-yellow-800">
              {pendingApprovals} response{pendingApprovals > 1 ? "s" : ""}{" "}
              pending approval
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedTab("executions")}
            >
              Review
            </Button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "rules", label: "Rules", icon: Settings },
          { id: "executions", label: "Executions", icon: Activity },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-colors ${
                selectedTab === tab.id
                  ? "bg-white shadow-sm text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <OverviewTab
          analytics={analytics}
          rules={rules}
          activeExecutions={activeExecutions}
          isEnabled={isEnabled}
        />
      )}

      {selectedTab === "rules" && (
        <RulesTab
          rules={rules}
          onRuleSelect={setSelectedRule}
          onToggleRule={toggleRule}
        />
      )}

      {selectedTab === "executions" && (
        <ExecutionsTab
          activeExecutions={activeExecutions}
          executionHistory={executionHistory}
          onExecutionSelect={setSelectedExecution}
          onApprove={approveExecution}
          onCancel={cancelExecution}
          getExecutionStatusColor={getExecutionStatusColor}
          getActionColor={getActionColor}
          formatTimeAgo={formatTimeAgo}
        />
      )}

      {selectedTab === "analytics" && <AnalyticsTab analytics={analytics} />}

      {/* Modals */}
      {selectedRule && (
        <RuleDetailModal
          rule={selectedRule}
          onClose={() => setSelectedRule(null)}
        />
      )}

      {selectedExecution && (
        <ExecutionDetailModal
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
          getActionColor={getActionColor}
          getExecutionStatusColor={getExecutionStatusColor}
          formatTimeAgo={formatTimeAgo}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  analytics: any;
  rules: ResponseRule[];
  activeExecutions: ResponseExecution[];
  isEnabled: boolean;
}> = ({ analytics, rules, activeExecutions, isEnabled }) => {
  const enabledRules = rules.filter((rule) => rule.enabled).length;
  const totalRules = rules.length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p
                  className={`text-2xl font-bold ${
                    isEnabled ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isEnabled ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enabledRules}/{totalRules}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Active Executions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeExecutions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics ? Math.round(analytics.success_rate * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest automated responses and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeExecutions.length > 0 ? (
            <div className="space-y-3">
              {activeExecutions.slice(0, 5).map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Response execution for email {execution.email_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {execution.actions_executed.length} action(s) •{" "}
                      {execution.status}
                    </p>
                  </div>
                  <Badge
                    className={`${getExecutionStatusColor(execution.status)}`}
                  >
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No active executions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Rules Tab Component
const RulesTab: React.FC<{
  rules: ResponseRule[];
  onRuleSelect: (rule: ResponseRule) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
}> = ({ rules, onRuleSelect, onToggleRule }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Response Rules</h3>
        <Button>
          <Plus size={16} />
          Create Rule
        </Button>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card
            key={rule.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Priority: {rule.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {rule.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {rule.actions.map((action, index) => (
                      <Badge
                        key={index}
                        className={`${getActionColor(action.type)} text-xs`}
                      >
                        {action.type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleRule(rule.id, !rule.enabled)}
                  >
                    {rule.enabled ? <Pause size={14} /> : <Play size={14} />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRuleSelect(rule)}
                  >
                    <Eye size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Executions Tab Component
const ExecutionsTab: React.FC<{
  activeExecutions: ResponseExecution[];
  executionHistory: ResponseExecution[];
  onExecutionSelect: (execution: ResponseExecution) => void;
  onApprove: (executionId: string) => void;
  onCancel: (executionId: string) => void;
  getExecutionStatusColor: (status: string) => string;
  getActionColor: (action: string) => string;
  formatTimeAgo: (timestamp: string) => string;
}> = ({
  activeExecutions,
  executionHistory,
  onExecutionSelect,
  onApprove,
  onCancel,
  getExecutionStatusColor,
  getActionColor,
  formatTimeAgo,
}) => {
  return (
    <div className="space-y-6">
      {/* Active Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Executions</CardTitle>
          <CardDescription>
            Currently running automated responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeExecutions.length > 0 ? (
            <div className="space-y-3">
              {activeExecutions.map((execution) => (
                <div key={execution.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Email: {execution.email_id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Started {formatTimeAgo(execution.initiated_at)}
                      </p>
                    </div>
                    <Badge
                      className={getExecutionStatusColor(execution.status)}
                    >
                      {execution.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {execution.actions_executed.map((action, index) => (
                      <Badge
                        key={index}
                        className={`${getActionColor(action.type)} text-xs`}
                      >
                        {action.type} - {action.status}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    {execution.approval_required && !execution.approved_by && (
                      <Button size="sm" onClick={() => onApprove(execution.id)}>
                        <CheckCircle size={14} />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancel(execution.id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExecutionSelect(execution)}
                    >
                      <Eye size={14} />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No active executions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
          <CardDescription>Past automated response executions</CardDescription>
        </CardHeader>
        <CardContent>
          {executionHistory.length > 0 ? (
            <div className="space-y-2">
              {executionHistory.slice(0, 10).map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => onExecutionSelect(execution)}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Email: {execution.email_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {execution.actions_executed.length} actions •{" "}
                      {formatTimeAgo(execution.initiated_at)}
                    </p>
                  </div>
                  <Badge className={getExecutionStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No execution history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Average Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.response_times.average_ms / 1000)}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.success_rate * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.total_responses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Action Distribution</CardTitle>
          <CardDescription>
            Breakdown of automated response actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.action_distribution)
              .filter(([, count]) => (count as number) > 0)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getActionColor(action)} text-xs`}>
                      {action.replace("_", " ")}
                    </Badge>
                    <span className="text-sm text-gray-600 capitalize">
                      {action.replace("_", " ")}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {count as number}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Rule Detail Modal
const RuleDetailModal: React.FC<{
  rule: ResponseRule;
  onClose: () => void;
}> = ({ rule, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{rule.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <CardDescription>{rule.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Configuration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    rule.enabled ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {rule.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <span className="ml-2 font-medium">{rule.priority}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">
                  {new Date(rule.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2">
                  {new Date(rule.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Conditions</h4>
            <div className="space-y-2">
              {rule.conditions.map((condition, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                  <code>
                    {condition.field} {condition.operator} {condition.value}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Actions</h4>
            <div className="space-y-2">
              {rule.actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <Badge className={`${getActionColor(action.type)} text-xs`}>
                    {action.type.replace("_", " ")}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    {action.delay_seconds && `Delay: ${action.delay_seconds}s`}
                    {action.requires_approval && " • Requires approval"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Execution Detail Modal
const ExecutionDetailModal: React.FC<{
  execution: ResponseExecution;
  onClose: () => void;
  getActionColor: (action: string) => string;
  getExecutionStatusColor: (status: string) => string;
  formatTimeAgo: (timestamp: string) => string;
}> = ({
  execution,
  onClose,
  getActionColor,
  getExecutionStatusColor,
  formatTimeAgo,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Execution Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <CardDescription>Email: {execution.email_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Status</h4>
            <Badge className={getExecutionStatusColor(execution.status)}>
              {execution.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Initiated:</span>
              <span className="ml-2">
                {formatTimeAgo(execution.initiated_at)}
              </span>
            </div>
            {execution.completed_at && (
              <div>
                <span className="text-gray-600">Completed:</span>
                <span className="ml-2">
                  {formatTimeAgo(execution.completed_at)}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Executed by:</span>
              <span className="ml-2 capitalize">{execution.executed_by}</span>
            </div>
            {execution.approved_by && (
              <div>
                <span className="text-gray-600">Approved by:</span>
                <span className="ml-2">{execution.approved_by}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Actions</h4>
            <div className="space-y-2">
              {execution.actions_executed.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <Badge className={`${getActionColor(action.type)} text-xs`}>
                    {action.type.replace("_", " ")}
                  </Badge>
                  <Badge className={getExecutionStatusColor(action.status)}>
                    {action.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {execution.error_message && (
            <div>
              <h4 className="font-medium mb-2 text-red-600">Error</h4>
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                {execution.error_message}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get action color (defined outside component to be reusable)
function getActionColor(action: string): string {
  switch (action) {
    case "quarantine":
      return "bg-red-500 text-white";
    case "block_sender":
      return "bg-orange-500 text-white";
    case "escalate":
      return "bg-yellow-600 text-white";
    case "monitor":
      return "bg-blue-500 text-white";
    case "notify_admin":
      return "bg-purple-500 text-white";
    case "auto_delete":
      return "bg-red-700 text-white";
    case "mark_safe":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function getExecutionStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-500 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    case "in_progress":
      return "bg-blue-500 text-white";
    case "failed":
      return "bg-red-500 text-white";
    case "cancelled":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-400 text-white";
  }
}

export default AutomatedResponseDashboard;
