// Simplified Real-time Threat Monitoring Service
// Focused on WebSocket integration and notification enhancement

import { webSocketService } from "./websocketService";
import { threatAlertService } from "./threatAlertService";
import { emailService } from "./emailService";
import type { Email } from "../models/email";
import type { WebSocketMessage } from "../types/notifications";

interface RealTimeThreatEvent {
  id: string;
  timestamp: string;
  type:
    | "threat_detected"
    | "system_alert"
    | "scan_complete"
    | "email_processed";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  email_id?: string;
  metadata: Record<string, any>;
}

class RealTimeThreatMonitor {
  private isActive = false;
  private eventHandlers = new Map<
    string,
    Set<(event: RealTimeThreatEvent) => void>
  >();
  private recentEvents: RealTimeThreatEvent[] = [];
  private lastEmailCheck = new Date();
  private pollingInterval?: number;

  // ===== INITIALIZATION AND CONTROL =====

  async start(): Promise<void> {
    if (this.isActive) {
      console.log("Real-time threat monitoring already active");
      return;
    }

    console.log("Starting real-time threat monitoring...");
    this.isActive = true;

    try {
      // Initialize WebSocket connection
      await this.initializeWebSocket();

      // Start email polling as fallback
      this.startEmailPolling();

      // Start threat alert monitoring
      await this.initializeThreatMonitoring();

      this.emitEvent({
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        type: "system_alert",
        severity: "low",
        title: "Real-time Monitoring Started",
        description: "Threat monitoring is now active",
        metadata: {
          websocket_connected: webSocketService.isConnected,
          monitoring_enabled: true,
        },
      });
    } catch (error) {
      console.error("Failed to start threat monitoring:", error);
      this.isActive = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isActive) return;

    console.log("Stopping real-time threat monitoring...");
    this.isActive = false;

    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }

    // Clear events
    this.recentEvents = [];

    this.emitEvent({
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: "system_alert",
      severity: "low",
      title: "Real-time Monitoring Stopped",
      description: "Threat monitoring has been deactivated",
      metadata: { monitoring_enabled: false },
    });
  }

  // ===== WEBSOCKET INTEGRATION =====

  private async initializeWebSocket(): Promise<void> {
    try {
      if (!webSocketService.isConnected) {
        await webSocketService.connect();
      }

      // Set up WebSocket event handlers
      webSocketService.on("threat_alert", (message: WebSocketMessage) => {
        if (!this.isActive) return;
        this.handleWebSocketThreatAlert(message);
      });

      webSocketService.on("system_update", (message: WebSocketMessage) => {
        if (!this.isActive) return;
        this.handleWebSocketSystemUpdate(message);
      });

      webSocketService.on("scan_complete", (message: WebSocketMessage) => {
        if (!this.isActive) return;
        this.handleWebSocketScanComplete(message);
      });

      webSocketService.on("connection", () => {
        if (this.isActive) {
          this.emitEvent({
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            type: "system_alert",
            severity: "low",
            title: "WebSocket Connected",
            description: "Real-time connection established",
            metadata: { connection_status: "connected" },
          });
        }
      });

      webSocketService.on("disconnect", () => {
        if (this.isActive) {
          this.emitEvent({
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            type: "system_alert",
            severity: "medium",
            title: "WebSocket Disconnected",
            description: "Real-time connection lost, using polling fallback",
            metadata: { connection_status: "disconnected" },
          });
        }
      });
    } catch (error) {
      console.warn(
        "WebSocket initialization failed, using polling only:",
        error
      );
    }
  }

  // ===== EMAIL POLLING =====

  private startEmailPolling(): void {
    // Poll for new emails every 30 seconds
    this.pollingInterval = setInterval(async () => {
      if (this.isActive) {
        await this.checkForNewEmails();
      }
    }, 30000);
  }

  private async checkForNewEmails(): Promise<void> {
    try {
      // Get recent emails
      const emails = await emailService.getAllEmails();

      for (const email of emails.slice(0, 10)) {
        // Check last 10 emails
        const emailDate = new Date(email.timestamp);

        if (emailDate > this.lastEmailCheck) {
          await this.analyzeEmailForThreats(email);
        }
      }

      this.lastEmailCheck = new Date();
    } catch (error) {
      console.error("Error checking for new emails:", error);
    }
  }

  private async analyzeEmailForThreats(email: Email): Promise<void> {
    try {
      // Analyze threat level
      const threatScore = email.phishing_score_cti;
      const threatLevel = email.threat_summary.overall_risk;

      // Create event for high-risk emails
      if (
        threatScore >= 0.7 ||
        threatLevel === "high" ||
        threatLevel === "critical"
      ) {
        this.emitEvent({
          id: this.generateId(),
          timestamp: new Date().toISOString(),
          type: "threat_detected",
          severity: this.mapThreatToSeverity(threatLevel),
          title: `High-Risk Email Detected`,
          description: `Email from ${email.sender} flagged as ${threatLevel} risk`,
          email_id: email.id.toString(),
          metadata: {
            sender: email.sender,
            subject: email.subject,
            threat_level: threatLevel,
            phishing_score: threatScore,
            cti_flags: email.cti_flags,
            confidence: email.threat_summary.confidence,
          },
        });
      }

      // Create event for any processed email (for activity tracking)
      this.emitEvent({
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        type: "email_processed",
        severity: "low",
        title: "Email Processed",
        description: `Email from ${email.sender} analyzed`,
        email_id: email.id.toString(),
        metadata: {
          sender: email.sender,
          threat_level: threatLevel,
          phishing_score: threatScore,
        },
      });
    } catch (error) {
      console.error("Error analyzing email for threats:", error);
    }
  }

  // ===== WEBSOCKET EVENT HANDLERS =====

  private handleWebSocketThreatAlert(message: WebSocketMessage): void {
    const { payload } = message;

    this.emitEvent({
      id: this.generateId(),
      timestamp: message.timestamp,
      type: "threat_detected",
      severity: payload.severity || "medium",
      title: `${(payload.threat_type || "Threat").toUpperCase()} Detected`,
      description: `Real-time threat detected from ${
        payload.sender || "unknown sender"
      }`,
      email_id: payload.email_id,
      metadata: {
        threat_type: payload.threat_type,
        sender: payload.sender,
        subject: payload.subject,
        action_required: payload.action_required,
        source: "websocket",
      },
    });
  }

  private handleWebSocketSystemUpdate(message: WebSocketMessage): void {
    const { component, status, message: updateMessage } = message.payload;

    this.emitEvent({
      id: this.generateId(),
      timestamp: message.timestamp,
      type: "system_alert",
      severity:
        status === "failed"
          ? "high"
          : status === "completed"
          ? "low"
          : "medium",
      title: `System Update: ${component}`,
      description: updateMessage || "System component updated",
      metadata: {
        component,
        status,
        progress: message.payload.progress,
        source: "websocket",
      },
    });
  }

  private handleWebSocketScanComplete(message: WebSocketMessage): void {
    const { emails_processed, threats_found, summary } = message.payload;

    this.emitEvent({
      id: this.generateId(),
      timestamp: message.timestamp,
      type: "scan_complete",
      severity:
        threats_found > 5 ? "high" : threats_found > 0 ? "medium" : "low",
      title: "Email Scan Completed",
      description: `Processed ${emails_processed} emails, found ${threats_found} threats`,
      metadata: {
        emails_processed,
        threats_found,
        scan_summary: summary,
        source: "websocket",
      },
    });
  }

  // ===== THREAT ALERT INTEGRATION =====

  private async initializeThreatMonitoring(): Promise<void> {
    try {
      // Start threat alert service if not already running
      const stats = threatAlertService.getMonitoringStats();

      this.emitEvent({
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        type: "system_alert",
        severity: "low",
        title: "Threat Alert Service Initialized",
        description: `Monitoring ${stats.emails_monitored} emails with ${stats.active_rules} active rules`,
        metadata: {
          stats,
          service: "threat-alert-service",
        },
      });
    } catch (error) {
      console.error("Error initializing threat monitoring:", error);
    }
  }

  // ===== EVENT MANAGEMENT =====

  private emitEvent(event: RealTimeThreatEvent): void {
    // Add to recent events (keep last 100)
    this.recentEvents.unshift(event);
    this.recentEvents = this.recentEvents.slice(0, 100);

    // Emit to handlers
    const handlers = this.eventHandlers.get(event.type) || new Set();
    const allHandlers = this.eventHandlers.get("*") || new Set();

    [...handlers, ...allHandlers].forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in event handler:", error);
      }
    });

    console.log("Real-time threat event:", event);
  }

  // ===== PUBLIC API =====

  on(
    eventType: string,
    handler: (event: RealTimeThreatEvent) => void
  ): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
    };
  }

  getRecentEvents(limit: number = 50): RealTimeThreatEvent[] {
    return this.recentEvents.slice(0, limit);
  }

  getEventsByType(
    eventType: string,
    limit: number = 50
  ): RealTimeThreatEvent[] {
    return this.recentEvents
      .filter((event) => event.type === eventType)
      .slice(0, limit);
  }

  getThreatEvents(limit: number = 50): RealTimeThreatEvent[] {
    return this.getEventsByType("threat_detected", limit);
  }

  getSystemEvents(limit: number = 50): RealTimeThreatEvent[] {
    return this.getEventsByType("system_alert", limit);
  }

  // ===== UTILITY FUNCTIONS =====

  private mapThreatToSeverity(
    threatLevel: string
  ): "low" | "medium" | "high" | "critical" {
    switch (threatLevel) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
      case "suspicious":
        return "medium";
      default:
        return "low";
    }
  }

  private generateId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== STATUS =====

  get isMonitoring(): boolean {
    return this.isActive;
  }

  get connectionStatus(): string {
    if (webSocketService.isConnected) return "websocket";
    if (this.pollingInterval) return "polling";
    return "disconnected";
  }

  get eventCount(): number {
    return this.recentEvents.length;
  }

  get handlerCount(): number {
    let count = 0;
    this.eventHandlers.forEach((handlers) => (count += handlers.size));
    return count;
  }
}

// Export singleton instance
export const realTimeThreatMonitor = new RealTimeThreatMonitor();

// Export types
export type { RealTimeThreatEvent };
