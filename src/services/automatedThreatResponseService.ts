// Automated Threat Response Service
// Intelligent automation for threat detection and response workflows

import { realTimeThreatMonitor } from "./realTimeThreatMonitor";
import type { Email } from "@/types/email";

// Response action types
export type ResponseAction =
  | "quarantine"
  | "block_sender"
  | "escalate"
  | "monitor"
  | "notify_admin"
  | "auto_delete"
  | "mark_safe";

// Response severity levels
export type ResponseSeverity = "low" | "medium" | "high" | "critical";

// Response configuration
export interface ResponseRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: ResponseCondition[];
  actions: ResponseActionConfig[];
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ResponseCondition {
  field:
    | "phishing_score"
    | "threat_level"
    | "sender_domain"
    | "attachment_count"
    | "malicious_found";
  operator:
    | "greater_than"
    | "less_than"
    | "equals"
    | "contains"
    | "not_contains";
  value: string | number;
}

export interface ResponseActionConfig {
  type: ResponseAction;
  parameters?: Record<string, any>;
  delay_seconds?: number;
  requires_approval?: boolean;
}

// Response execution result
export interface ResponseExecution {
  id: string;
  rule_id: string;
  email_id: number;
  actions_executed: ExecutedAction[];
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  initiated_at: string;
  completed_at?: string;
  error_message?: string;
  executed_by: "system" | "user";
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface ExecutedAction {
  type: ResponseAction;
  status: "pending" | "completed" | "failed";
  executed_at?: string;
  error?: string;
  result?: any;
}

// Threat response analytics
export interface ResponseAnalytics {
  total_responses: number;
  automated_responses: number;
  manual_responses: number;
  response_times: {
    average_ms: number;
    median_ms: number;
    fastest_ms: number;
    slowest_ms: number;
  };
  action_distribution: Record<ResponseAction, number>;
  success_rate: number;
  escalation_rate: number;
  recent_executions: ResponseExecution[];
}

class AutomatedThreatResponseService {
  private responseRules: Map<string, ResponseRule> = new Map();
  private activeExecutions: Map<string, ResponseExecution> = new Map();
  private executionHistory: ResponseExecution[] = [];
  private enabled = true;

  // Default response rules
  private readonly defaultRules: Omit<
    ResponseRule,
    "id" | "created_at" | "updated_at"
  >[] = [
    {
      name: "Critical Threat Auto-Quarantine",
      description:
        "Automatically quarantine emails with critical threat levels",
      enabled: true,
      priority: 1,
      conditions: [
        { field: "threat_level", operator: "equals", value: "critical" },
      ],
      actions: [
        { type: "quarantine", delay_seconds: 0 },
        { type: "block_sender", delay_seconds: 5 },
        { type: "notify_admin", delay_seconds: 10 },
      ],
    },
    {
      name: "High Phishing Score Response",
      description: "Handle emails with high phishing confidence scores",
      enabled: true,
      priority: 2,
      conditions: [
        { field: "phishing_score", operator: "greater_than", value: 0.8 },
      ],
      actions: [
        { type: "quarantine", delay_seconds: 0 },
        { type: "escalate", delay_seconds: 30 },
      ],
    },
    {
      name: "Multiple Malicious Indicators",
      description: "Respond to emails with multiple malicious indicators",
      enabled: true,
      priority: 3,
      conditions: [
        { field: "malicious_found", operator: "greater_than", value: 3 },
      ],
      actions: [
        { type: "quarantine", delay_seconds: 0 },
        { type: "monitor", delay_seconds: 60 },
      ],
    },
    {
      name: "Suspicious Attachment Handling",
      description: "Monitor emails with multiple attachments",
      enabled: true,
      priority: 4,
      conditions: [
        { field: "attachment_count", operator: "greater_than", value: 3 },
      ],
      actions: [
        { type: "monitor", delay_seconds: 0 },
        { type: "escalate", delay_seconds: 300, requires_approval: true },
      ],
    },
  ];

  constructor() {
    this.initializeDefaultRules();
    this.setupEventListeners();
  }

  // Initialize service with default rules
  private initializeDefaultRules(): void {
    this.defaultRules.forEach((rule) => {
      const id = `default_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      this.responseRules.set(id, {
        ...rule,
        id,
        created_at: timestamp,
        updated_at: timestamp,
      });
    });

    console.log(
      `Initialized ${this.responseRules.size} default response rules`
    );
  }

  // Set up event listeners for threat detection
  private setupEventListeners(): void {
    // Listen for new threat detections
    realTimeThreatMonitor.on(
      "threat_detected",
      this.handleThreatDetection.bind(this)
    );

    // Listen for email processing events
    realTimeThreatMonitor.on(
      "email_processed",
      this.handleEmailProcessed.bind(this)
    );
  }

  // Main threat detection handler
  private async handleThreatDetection(event: any): Promise<void> {
    if (!this.enabled) return;

    try {
      const emailId = event.email_id;
      if (!emailId) return;

      console.log(`Processing threat detection for email: ${emailId}`);

      // Get email details for analysis
      const email = await this.getEmailDetails(emailId);
      if (!email) return;

      // Find applicable response rules
      const applicableRules = this.findApplicableRules(email);

      if (applicableRules.length > 0) {
        console.log(
          `Found ${applicableRules.length} applicable response rules`
        );

        // Execute responses based on priority
        for (const rule of applicableRules.sort(
          (a, b) => a.priority - b.priority
        )) {
          await this.executeResponseRule(rule, email);
        }
      }
    } catch (error) {
      console.error("Error handling threat detection:", error);
    }
  }

  // Handle email processing events
  private async handleEmailProcessed(event: any): Promise<void> {
    if (!this.enabled) return;

    try {
      const emailId = event.email_id;
      if (!emailId) return;

      // Check if email needs automated response based on analysis results
      const email = await this.getEmailDetails(emailId);
      if (!email) return;

      const applicableRules = this.findApplicableRules(email);

      for (const rule of applicableRules) {
        // Only execute if not already processed for this email
        const existingExecution = this.executionHistory.find(
          (exec) => exec.email_id === emailId && exec.rule_id === rule.id
        );

        if (!existingExecution) {
          await this.executeResponseRule(rule, email);
        }
      }
    } catch (error) {
      console.error("Error handling email processing:", error);
    }
  }

  // Get email details for analysis
  private async getEmailDetails(emailId: string): Promise<Email | null> {
    try {
      // This would typically fetch from the email service
      // For now, we'll simulate the email data structure
      const simulatedEmail: Email = {
        id: emailId,
        sender: "unknown@example.com",
        recipient: "user@company.com",
        subject: "Unknown Subject",
        body: "Email content",
        attachments: [],
        attachment_hashes: [],
        phishing_score_cti: 0.5,
        received_at: new Date().toISOString(),
        status: "inbox",
        labels: [],
        importance: "normal",
        is_read: false,
        has_attachments: false,
        folder: "inbox",
        thread_id: `thread-${emailId}`,
        in_reply_to: null,
        references: [],
        threat_summary: {
          overall_risk: "medium",
          malicious_found: 0,
          suspicious_found: 1,
          clean_found: 0,
        },
      };
      return simulatedEmail;
    } catch (error) {
      console.error("Error fetching email details:", error);
      return null;
    }
  }

  // Find applicable response rules for an email
  private findApplicableRules(email: Email): ResponseRule[] {
    const applicableRules: ResponseRule[] = [];

    for (const rule of this.responseRules.values()) {
      if (!rule.enabled) continue;

      const allConditionsMet = rule.conditions.every((condition) =>
        this.evaluateCondition(condition, email)
      );

      if (allConditionsMet) {
        applicableRules.push(rule);
      }
    }

    return applicableRules;
  }

  // Evaluate a single condition against an email
  private evaluateCondition(
    condition: ResponseCondition,
    email: Email
  ): boolean {
    let fieldValue: any;

    // Extract field value from email
    switch (condition.field) {
      case "phishing_score":
        fieldValue = email.phishing_score_cti;
        break;
      case "threat_level":
        fieldValue = email.threat_summary.overall_risk;
        break;
      case "sender_domain":
        fieldValue = email.sender.split("@")[1] || "";
        break;
      case "attachment_count":
        fieldValue = (email as any).attachments?.length || 0;
        break;
      case "malicious_found":
        fieldValue = email.threat_summary.malicious_found;
        break;
      default:
        return false;
    }

    // Evaluate condition
    switch (condition.operator) {
      case "greater_than":
        return (
          typeof fieldValue === "number" && fieldValue > Number(condition.value)
        );
      case "less_than":
        return (
          typeof fieldValue === "number" && fieldValue < Number(condition.value)
        );
      case "equals":
        return fieldValue === condition.value;
      case "contains":
        return (
          typeof fieldValue === "string" &&
          fieldValue.includes(condition.value as string)
        );
      case "not_contains":
        return (
          typeof fieldValue === "string" &&
          !fieldValue.includes(condition.value as string)
        );
      default:
        return false;
    }
  }

  // Execute a response rule
  private async executeResponseRule(
    rule: ResponseRule,
    email: Email
  ): Promise<void> {
    const executionId = `exec_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const execution: ResponseExecution = {
      id: executionId,
      rule_id: rule.id,
      email_id: parseInt(email.id),
      actions_executed: [],
      status: "pending",
      initiated_at: new Date().toISOString(),
      executed_by: "system",
      approval_required: rule.actions.some(
        (action) => action.requires_approval
      ),
    };

    this.activeExecutions.set(executionId, execution);

    try {
      execution.status = "in_progress";

      // Execute actions in sequence
      for (const actionConfig of rule.actions) {
        const executedAction: ExecutedAction = {
          type: actionConfig.type,
          status: "pending",
        };

        execution.actions_executed.push(executedAction);

        // Check if approval is required
        if (actionConfig.requires_approval && !execution.approved_by) {
          execution.status = "pending";
          console.log(
            `Action ${actionConfig.type} requires approval for execution ${executionId}`
          );
          continue;
        }

        // Add delay if specified
        if (actionConfig.delay_seconds && actionConfig.delay_seconds > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, actionConfig.delay_seconds! * 1000)
          );
        }

        // Execute the action
        try {
          const result = await this.executeAction(actionConfig, email);
          executedAction.status = "completed";
          executedAction.executed_at = new Date().toISOString();
          executedAction.result = result;
        } catch (error) {
          executedAction.status = "failed";
          executedAction.error =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `Failed to execute action ${actionConfig.type}:`,
            error
          );
        }
      }

      // Mark execution as completed
      execution.status = "completed";
      execution.completed_at = new Date().toISOString();
    } catch (error) {
      execution.status = "failed";
      execution.error_message =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to execute response rule ${rule.id}:`, error);
    }

    // Move to history and clean up
    this.executionHistory.push(execution);
    this.activeExecutions.delete(executionId);

    // Limit history size
    if (this.executionHistory.length > 1000) {
      this.executionHistory.splice(0, this.executionHistory.length - 1000);
    }

    console.log(
      `Completed execution ${executionId} with status: ${execution.status}`
    );
  }

  // Execute a single action
  private async executeAction(
    actionConfig: ResponseActionConfig,
    email: Email
  ): Promise<any> {
    switch (actionConfig.type) {
      case "quarantine":
        return this.quarantineEmail(email);
      case "block_sender":
        return this.blockSender(email.sender);
      case "escalate":
        return this.escalateThreat(email);
      case "monitor":
        return this.addToMonitoring(email);
      case "notify_admin":
        return this.notifyAdministrator(email);
      case "auto_delete":
        return this.deleteEmail(email);
      case "mark_safe":
        return this.markAsSafe(email);
      default:
        throw new Error(`Unknown action type: ${actionConfig.type}`);
    }
  }

  // Action implementations
  private async quarantineEmail(email: Email): Promise<any> {
    console.log(`Quarantining email: ${email.id}`);
    // Implementation would interact with email service
    return {
      action: "quarantine",
      email_id: email.id,
      timestamp: new Date().toISOString(),
    };
  }

  private async blockSender(sender: string): Promise<any> {
    console.log(`Blocking sender: ${sender}`);
    // Implementation would add sender to block list
    return {
      action: "block_sender",
      sender,
      timestamp: new Date().toISOString(),
    };
  }

  private async escalateThreat(email: Email): Promise<any> {
    console.log(`Escalating threat for email: ${email.id}`);
    // Implementation would create high-priority alert
    return {
      action: "escalate",
      email_id: email.id,
      timestamp: new Date().toISOString(),
    };
  }

  private async addToMonitoring(email: Email): Promise<any> {
    console.log(`Adding email to monitoring: ${email.id}`);
    // Implementation would add to monitoring dashboard
    return {
      action: "monitor",
      email_id: email.id,
      timestamp: new Date().toISOString(),
    };
  }

  private async notifyAdministrator(email: Email): Promise<any> {
    console.log(`Notifying administrator about email: ${email.id}`);
    // Implementation would send notification to admin
    return {
      action: "notify_admin",
      email_id: email.id,
      timestamp: new Date().toISOString(),
    };
  }

  private async deleteEmail(email: Email): Promise<any> {
    console.log(`Deleting email: ${email.id}`);
    // Implementation would permanently delete email
    return {
      action: "auto_delete",
      email_id: email.id,
      timestamp: new Date().toISOString(),
    };
  }

  private async markAsSafe(email: Email): Promise<any> {
    console.log(`Marking email as safe: ${email.id}`);
    // Implementation would mark email as false positive
    return {
      action: "mark_safe",
      email_id: email.id,
      timestamp: new Date().toISOString(),
    };
  }

  // Public API methods
  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(
      `Automated threat response ${enabled ? "enabled" : "disabled"}`
    );
  }

  public getRules(): ResponseRule[] {
    return Array.from(this.responseRules.values());
  }

  public getRule(ruleId: string): ResponseRule | null {
    return this.responseRules.get(ruleId) || null;
  }

  public createRule(
    rule: Omit<ResponseRule, "id" | "created_at" | "updated_at">
  ): ResponseRule {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const newRule: ResponseRule = {
      ...rule,
      id,
      created_at: timestamp,
      updated_at: timestamp,
    };

    this.responseRules.set(id, newRule);
    console.log(`Created new response rule: ${newRule.name}`);

    return newRule;
  }

  public updateRule(
    ruleId: string,
    updates: Partial<ResponseRule>
  ): ResponseRule | null {
    const rule = this.responseRules.get(ruleId);
    if (!rule) return null;

    const updatedRule: ResponseRule = {
      ...rule,
      ...updates,
      id: ruleId, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    this.responseRules.set(ruleId, updatedRule);
    console.log(`Updated response rule: ${updatedRule.name}`);

    return updatedRule;
  }

  public deleteRule(ruleId: string): boolean {
    const deleted = this.responseRules.delete(ruleId);
    if (deleted) {
      console.log(`Deleted response rule: ${ruleId}`);
    }
    return deleted;
  }

  public getActiveExecutions(): ResponseExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  public getExecutionHistory(limit: number = 50): ResponseExecution[] {
    return this.executionHistory.slice(-limit).reverse();
  }

  public approveExecution(executionId: string, approvedBy: string): boolean {
    const execution = this.activeExecutions.get(executionId);
    if (!execution || !execution.approval_required) return false;

    execution.approved_by = approvedBy;
    execution.approved_at = new Date().toISOString();

    console.log(`Execution ${executionId} approved by ${approvedBy}`);

    // Continue execution of pending actions
    this.continueExecution(execution);

    return true;
  }

  public cancelExecution(executionId: string): boolean {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return false;

    execution.status = "cancelled";
    execution.completed_at = new Date().toISOString();

    this.executionHistory.push(execution);
    this.activeExecutions.delete(executionId);

    console.log(`Execution ${executionId} cancelled`);
    return true;
  }

  private async continueExecution(execution: ResponseExecution): Promise<void> {
    // Implementation for continuing execution after approval
    console.log(`Continuing execution ${execution.id} after approval`);
  }

  public getAnalytics(): ResponseAnalytics {
    const totalResponses = this.executionHistory.length;
    const automatedResponses = this.executionHistory.filter(
      (exec) => exec.executed_by === "system"
    ).length;
    const manualResponses = totalResponses - automatedResponses;

    const responseTimes = this.executionHistory
      .filter((exec) => exec.completed_at)
      .map((exec) => {
        const start = new Date(exec.initiated_at).getTime();
        const end = new Date(exec.completed_at!).getTime();
        return end - start;
      });

    const actionDistribution: Record<ResponseAction, number> = {
      quarantine: 0,
      block_sender: 0,
      escalate: 0,
      monitor: 0,
      notify_admin: 0,
      auto_delete: 0,
      mark_safe: 0,
    };

    this.executionHistory.forEach((exec) => {
      exec.actions_executed.forEach((action) => {
        actionDistribution[action.type]++;
      });
    });

    const successfulExecutions = this.executionHistory.filter(
      (exec) => exec.status === "completed"
    ).length;
    const escalatedExecutions = this.executionHistory.filter((exec) =>
      exec.actions_executed.some((action) => action.type === "escalate")
    ).length;

    return {
      total_responses: totalResponses,
      automated_responses: automatedResponses,
      manual_responses: manualResponses,
      response_times: {
        average_ms:
          responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0,
        median_ms:
          responseTimes.length > 0
            ? responseTimes.sort()[Math.floor(responseTimes.length / 2)]
            : 0,
        fastest_ms: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        slowest_ms: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      },
      action_distribution: actionDistribution,
      success_rate:
        totalResponses > 0 ? successfulExecutions / totalResponses : 1,
      escalation_rate:
        totalResponses > 0 ? escalatedExecutions / totalResponses : 0,
      recent_executions: this.getExecutionHistory(10),
    };
  }
}

// Export singleton instance
export const automatedThreatResponseService =
  new AutomatedThreatResponseService();
export default automatedThreatResponseService;
