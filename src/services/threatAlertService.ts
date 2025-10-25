// Enhanced Threat Alert Service - Advanced threat detection and notification system

import { emailService } from "./emailService";
import { webSocketService } from "./websocketService";
import type { Email } from "../models/email";
import type { ThreatAlert, NotificationType } from "../types/notifications";

export interface ThreatAlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: ThreatCondition[];
  actions: ThreatAction[];
  severity: "low" | "medium" | "high" | "critical";
  cooldown?: number; // Minutes before same alert can trigger again
}

export interface ThreatCondition {
  type:
    | "threat_level"
    | "confidence"
    | "phishing_score"
    | "sender_domain"
    | "cti_flags"
    | "attachment_count";
  operator:
    | "equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "not_contains";
  value: string | number | boolean;
}

export interface ThreatAction {
  type: "notify" | "quarantine" | "block_sender" | "escalate" | "log";
  parameters?: Record<string, any>;
}

export interface ThreatAlertSummary {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  recent_alerts: ThreatAlert[];
  threat_trends: {
    phishing: number;
    malware: number;
    spam: number;
    suspicious: number;
  };
  top_threats: {
    sender: string;
    threat_count: number;
    latest_threat: string;
  }[];
}

export interface ThreatMonitoringStats {
  emails_monitored: number;
  threats_detected: number;
  false_positives: number;
  detection_rate: number;
  response_time_avg: number; // Minutes
  active_rules: number;
}

class ThreatAlertService {
  private alertHistory: ThreatAlert[] = [];
  private lastAlertTimes: Map<string, number> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: number;

  // Default threat alert rules
  private defaultRules: ThreatAlertRule[] = [
    {
      id: "critical-phishing",
      name: "Critical Phishing Detection",
      description: "High confidence phishing emails with malicious indicators",
      enabled: true,
      severity: "critical",
      cooldown: 5,
      conditions: [
        { type: "threat_level", operator: "equals", value: "critical" },
        { type: "confidence", operator: "equals", value: "high" },
        { type: "phishing_score", operator: "greater_than", value: 0.8 },
      ],
      actions: [
        {
          type: "notify",
          parameters: { persistent: true, browser: true, sound: true },
        },
        { type: "quarantine", parameters: { auto: true } },
        { type: "escalate", parameters: { level: "security_team" } },
      ],
    },
    {
      id: "malicious-attachments",
      name: "Malicious Attachment Alert",
      description: "Emails with malicious attachments detected",
      enabled: true,
      severity: "high",
      cooldown: 10,
      conditions: [
        { type: "threat_level", operator: "equals", value: "malicious" },
        { type: "attachment_count", operator: "greater_than", value: 0 },
        {
          type: "cti_flags",
          operator: "contains",
          value: "malicious_attachment",
        },
      ],
      actions: [
        { type: "notify", parameters: { persistent: true, browser: true } },
        { type: "quarantine", parameters: { auto: false } },
      ],
    },
    {
      id: "suspicious-sender",
      name: "Suspicious Sender Pattern",
      description: "Multiple suspicious emails from same sender/domain",
      enabled: true,
      severity: "medium",
      cooldown: 30,
      conditions: [
        { type: "threat_level", operator: "equals", value: "suspicious" },
        { type: "confidence", operator: "equals", value: "medium" },
      ],
      actions: [
        { type: "notify", parameters: { persistent: false, browser: true } },
        { type: "log", parameters: { level: "warning" } },
      ],
    },
    {
      id: "high-volume-threats",
      name: "High Volume Threat Detection",
      description: "Multiple threats detected in short timeframe",
      enabled: true,
      severity: "high",
      cooldown: 15,
      conditions: [
        { type: "threat_level", operator: "greater_than", value: "suspicious" },
      ],
      actions: [
        { type: "notify", parameters: { persistent: true } },
        { type: "escalate", parameters: { level: "admin" } },
      ],
    },
  ];

  private rules: ThreatAlertRule[] = [...this.defaultRules];

  /**
   * Initialize threat monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Load custom rules from localStorage
      const savedRules = localStorage.getItem("threat-alert-rules");
      if (savedRules) {
        const customRules = JSON.parse(savedRules);
        this.rules = [...this.defaultRules, ...customRules];
      }

      // Set up WebSocket listeners for real-time threat detection
      this.setupWebSocketListeners();

      // Start monitoring if not already running
      if (!this.isMonitoring) {
        this.startMonitoring();
      }

      console.log("🛡️ Threat Alert Service initialized");
    } catch (error) {
      console.error("Failed to initialize Threat Alert Service:", error);
      throw error;
    }
  }

  /**
   * Set up WebSocket listeners for real-time threats
   */
  private setupWebSocketListeners(): void {
    webSocketService.on("threat_detected", (message: any) => {
      const alert = message as ThreatAlert;
      this.processIncomingThreat(alert);
    });

    webSocketService.on("email_analyzed", (message: any) => {
      const email = message.payload as Email;
      this.evaluateEmailThreat(email);
    });
  }

  /**
   * Start continuous threat monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.performThreatScan();
    }, 30000);

    console.log("🔍 Threat monitoring started");
  }

  /**
   * Stop threat monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log("⏹️ Threat monitoring stopped");
  }

  /**
   * Perform automated threat scan
   */
  private async performThreatScan(): Promise<void> {
    try {
      // Get recent emails (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const recentEmails = await emailService.getAllEmails({
        start_date: fiveMinutesAgo,
      });

      // Evaluate each email against threat rules
      for (const email of recentEmails) {
        this.evaluateEmailThreat(email);
      }
    } catch (error) {
      console.error("Threat scan failed:", error);
    }
  }

  /**
   * Evaluate a single email against threat rules
   */
  evaluateEmailThreat(email: Email): void {
    const enabledRules = this.rules.filter((rule) => rule.enabled);

    for (const rule of enabledRules) {
      if (this.shouldApplyRule(rule, email)) {
        this.triggerThreatAlert(rule, email);
      }
    }
  }

  /**
   * Check if a rule should be applied to an email
   */
  private shouldApplyRule(rule: ThreatAlertRule, email: Email): boolean {
    // Check cooldown
    const lastAlert = this.lastAlertTimes.get(rule.id);
    if (lastAlert && rule.cooldown) {
      const cooldownMs = rule.cooldown * 60 * 1000;
      if (Date.now() - lastAlert < cooldownMs) {
        return false;
      }
    }

    // Check all conditions
    return rule.conditions.every((condition) =>
      this.evaluateCondition(condition, email)
    );
  }

  /**
   * Evaluate a single condition against an email
   */
  private evaluateCondition(condition: ThreatCondition, email: Email): boolean {
    let actualValue: any;

    switch (condition.type) {
      case "threat_level":
        actualValue = email.threat_summary.overall_risk;
        break;
      case "confidence":
        actualValue = email.threat_summary.confidence;
        break;
      case "phishing_score":
        actualValue = email.phishing_score_cti;
        break;
      case "sender_domain":
        actualValue = email.sender_domain;
        break;
      case "cti_flags":
        actualValue = email.cti_flags.join(",");
        break;
      case "attachment_count":
        actualValue = email.attachments.length;
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case "equals":
        return actualValue === condition.value;
      case "greater_than":
        return Number(actualValue) > Number(condition.value);
      case "less_than":
        return Number(actualValue) < Number(condition.value);
      case "contains":
        return String(actualValue)
          .toLowerCase()
          .includes(String(condition.value).toLowerCase());
      case "not_contains":
        return !String(actualValue)
          .toLowerCase()
          .includes(String(condition.value).toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Trigger a threat alert
   */
  private triggerThreatAlert(rule: ThreatAlertRule, email: Email): void {
    const alert: ThreatAlert = {
      type: "threat_detected",
      payload: {
        email_id: email.id.toString(),
        threat_type: this.determineThreatType(email),
        severity: rule.severity,
        sender: email.sender,
        subject: email.subject,
        detected_at: new Date().toISOString(),
        action_required:
          rule.severity === "critical" || rule.severity === "high",
      },
      timestamp: new Date().toISOString(),
    };

    // Add to history
    this.alertHistory.push(alert);
    this.lastAlertTimes.set(rule.id, Date.now());

    // Execute rule actions
    this.executeActions(rule.actions, alert, email);

    // Emit to WebSocket for real-time updates
    this.emitThreatAlert(alert);
  }

  /**
   * Determine threat type from email analysis
   */
  private determineThreatType(email: Email): string {
    if (email.cti_flags.some((flag) => flag.includes("phishing")))
      return "phishing";
    if (email.cti_flags.some((flag) => flag.includes("malware")))
      return "malware";
    if (email.cti_flags.some((flag) => flag.includes("spam"))) return "spam";
    if (email.threat_summary.overall_risk === "suspicious") return "suspicious";
    return "unknown";
  }

  /**
   * Execute threat rule actions
   */
  private executeActions(
    actions: ThreatAction[],
    alert: ThreatAlert,
    email: Email
  ): void {
    for (const action of actions) {
      switch (action.type) {
        case "notify":
          this.sendNotification(alert, email, action.parameters);
          break;
        case "quarantine":
          this.quarantineEmail(email, action.parameters);
          break;
        case "block_sender":
          this.blockSender(email.sender, action.parameters);
          break;
        case "escalate":
          this.escalateThreat(alert, email, action.parameters);
          break;
        case "log":
          this.logThreat(alert, email, action.parameters);
          break;
      }
    }
  }

  /**
   * Send notification for threat alert
   */
  private sendNotification(
    alert: ThreatAlert,
    email: Email,
    params?: any
  ): void {
    // This will be handled by the notification context
    const event = new CustomEvent("threat-alert", {
      detail: {
        type: "threat" as NotificationType,
        title: `${alert.payload.severity.toUpperCase()} Threat Detected`,
        message: `${alert.payload.threat_type.toUpperCase()} from ${
          email.sender
        }`,
        persistent: params?.persistent || alert.payload.severity === "critical",
        metadata: {
          severity: alert.payload.severity,
          email_id: alert.payload.email_id,
          threat_type: alert.payload.threat_type,
          sender: email.sender,
          subject: email.subject,
        },
        actions: [
          {
            id: "investigate",
            label: "Investigate",
            action: () => {
              window.location.href = `/emails?highlight=${email.id}`;
            },
            primary: true,
          },
          {
            id: "quarantine",
            label: "Quarantine",
            action: () => {
              this.quarantineEmail(email, { manual: true });
            },
            destructive: true,
          },
        ],
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * Quarantine an email
   */
  private quarantineEmail(email: Email, params?: any): void {
    console.log("🔒 Quarantining email:", email.id, params);
    // In a real implementation, this would call an API endpoint
    // For now, we'll just log and potentially delete the email
    if (params?.auto) {
      // Auto-quarantine could delete the email
      emailService.deleteEmail(email.id).catch(console.error);
    }
  }

  /**
   * Block a sender
   */
  private blockSender(sender: string, params?: any): void {
    console.log("🚫 Blocking sender:", sender, params);
    // This would typically update a blacklist or firewall rules
  }

  /**
   * Escalate threat to security team
   */
  private escalateThreat(
    alert: ThreatAlert,
    _email: Email,
    params?: any
  ): void {
    console.log("⚠️ Escalating threat:", alert, params);
    // This would send notifications to security team or create tickets
  }

  /**
   * Log threat for analysis
   */
  private logThreat(alert: ThreatAlert, _email: Email, params?: any): void {
    console.log("📝 Logging threat:", alert, params);
    // This would write to security logs or SIEM systems
  }

  /**
   * Emit threat alert via WebSocket
   */
  private emitThreatAlert(alert: ThreatAlert): void {
    if (webSocketService.isConnected) {
      // For now, just emit to browser event
      const event = new CustomEvent("threat-alert-emitted", { detail: alert });
      window.dispatchEvent(event);
    }
  }

  /**
   * Process incoming threat from WebSocket
   */
  private processIncomingThreat(alert: ThreatAlert): void {
    this.alertHistory.push(alert);

    // Trigger browser notification
    const event = new CustomEvent("external-threat-alert", { detail: alert });
    window.dispatchEvent(event);
  }

  /**
   * Get threat alert summary
   */
  getThreatSummary(): ThreatAlertSummary {
    const recent = this.alertHistory.slice(-50); // Last 50 alerts

    return {
      total_alerts: this.alertHistory.length,
      critical_alerts: this.alertHistory.filter(
        (a) => a.payload.severity === "critical"
      ).length,
      high_alerts: this.alertHistory.filter(
        (a) => a.payload.severity === "high"
      ).length,
      medium_alerts: this.alertHistory.filter(
        (a) => a.payload.severity === "medium"
      ).length,
      low_alerts: this.alertHistory.filter((a) => a.payload.severity === "low")
        .length,
      recent_alerts: recent,
      threat_trends: {
        phishing: this.alertHistory.filter(
          (a) => a.payload.threat_type === "phishing"
        ).length,
        malware: this.alertHistory.filter(
          (a) => a.payload.threat_type === "malware"
        ).length,
        spam: this.alertHistory.filter((a) => a.payload.threat_type === "spam")
          .length,
        suspicious: this.alertHistory.filter(
          (a) => a.payload.threat_type === "suspicious"
        ).length,
      },
      top_threats: this.getTopThreats(),
    };
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): ThreatMonitoringStats {
    return {
      emails_monitored: 0, // Would come from monitoring metrics
      threats_detected: this.alertHistory.length,
      false_positives: 0, // Would track user feedback
      detection_rate: 0, // Would calculate based on monitoring data
      response_time_avg: 0, // Would track response times
      active_rules: this.rules.filter((r) => r.enabled).length,
    };
  }

  /**
   * Get top threat sources
   */
  private getTopThreats(): {
    sender: string;
    threat_count: number;
    latest_threat: string;
  }[] {
    const senderCounts = new Map<string, { count: number; latest: string }>();

    this.alertHistory.forEach((alert) => {
      const sender = alert.payload.sender;
      const existing = senderCounts.get(sender);
      senderCounts.set(sender, {
        count: (existing?.count || 0) + 1,
        latest: alert.timestamp,
      });
    });

    return Array.from(senderCounts.entries())
      .map(([sender, data]) => ({
        sender,
        threat_count: data.count,
        latest_threat: data.latest,
      }))
      .sort((a, b) => b.threat_count - a.threat_count)
      .slice(0, 10);
  }

  /**
   * Add custom threat rule
   */
  addThreatRule(rule: Omit<ThreatAlertRule, "id">): string {
    const newRule: ThreatAlertRule = {
      ...rule,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.rules.push(newRule);
    this.saveCustomRules();

    return newRule.id;
  }

  /**
   * Update threat rule
   */
  updateThreatRule(id: string, updates: Partial<ThreatAlertRule>): boolean {
    const index = this.rules.findIndex((rule) => rule.id === id);
    if (index === -1) return false;

    this.rules[index] = { ...this.rules[index], ...updates };
    this.saveCustomRules();

    return true;
  }

  /**
   * Delete threat rule
   */
  deleteThreatRule(id: string): boolean {
    const index = this.rules.findIndex((rule) => rule.id === id);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    this.saveCustomRules();

    return true;
  }

  /**
   * Get all threat rules
   */
  getThreatRules(): ThreatAlertRule[] {
    return [...this.rules];
  }

  /**
   * Save custom rules to localStorage
   */
  private saveCustomRules(): void {
    const customRules = this.rules.filter((rule) =>
      rule.id.startsWith("custom-")
    );
    localStorage.setItem("threat-alert-rules", JSON.stringify(customRules));
  }

  /**
   * Clear all alert history
   */
  clearAlertHistory(): void {
    this.alertHistory = [];
    this.lastAlertTimes.clear();
  }

  /**
   * Test threat rule against sample data
   */
  testThreatRule(rule: ThreatAlertRule, email: Email): boolean {
    return this.shouldApplyRule(rule, email);
  }
}

// Singleton instance
export const threatAlertService = new ThreatAlertService();
