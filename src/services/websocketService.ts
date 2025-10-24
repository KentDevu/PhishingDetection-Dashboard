// WebSocket Service for Real-time Communication

import type {
  WebSocketMessage,
  ThreatAlert,
  SystemUpdate,
  EmailScanComplete,
} from "../types/notifications";

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

interface WebSocketServiceConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketServiceConfig;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private isConnecting = false;
  private isManuallyDisconnected = false;

  constructor(config: Partial<WebSocketServiceConfig> = {}) {
    this.config = {
      url: config.url || "ws://localhost:8080/ws",
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
    };
  }

  // Connection Management
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error("Connection attempt already in progress"));
        return;
      }

      this.isConnecting = true;
      this.isManuallyDisconnected = false;

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit("connection", {
            type: "notification",
            payload: { status: "connected" },
            timestamp: new Date().toISOString(),
          });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          this.emit("error", {
            type: "notification",
            payload: { error: "WebSocket connection error" },
            timestamp: new Date().toISOString(),
          });

          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit("disconnect", {
            type: "notification",
            payload: { code: event.code, reason: event.reason },
            timestamp: new Date().toISOString(),
          });

          if (!this.isManuallyDisconnected && this.shouldReconnect()) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
  }

  // Message Handling
  private handleMessage(message: WebSocketMessage): void {
    console.log("Received WebSocket message:", message);

    // Handle different message types
    switch (message.type) {
      case "notification":
        this.emit("notification", message);
        break;
      case "alert":
      case "threat_detected":
        this.emit("threat_alert", message as ThreatAlert);
        break;
      case "system_update":
        this.emit("system_update", message as SystemUpdate);
        break;
      case "email_scan_complete":
        this.emit("scan_complete", message as EmailScanComplete);
        break;
      default:
        this.emit("message", message);
    }
  }

  // Event Management
  on(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    const handlers = this.eventHandlers.get(event)!;
    handlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  private emit(event: string, message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error("Error in WebSocket event handler:", error);
        }
      });
    }
  }

  // Send Messages
  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        return false;
      }
    }
    return false;
  }

  // Heartbeat
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "ping", timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Reconnection Logic
  private shouldReconnect(): boolean {
    return this.reconnectAttempts < this.config.maxReconnectAttempts;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay =
      this.config.reconnectInterval *
      Math.pow(2, Math.min(this.reconnectAttempts - 1, 5)); // Exponential backoff

    console.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => {
        // Reconnection failed, will try again if under limit
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "unknown";
    }
  }

  get reconnectAttemptsRemaining(): number {
    return Math.max(
      0,
      this.config.maxReconnectAttempts - this.reconnectAttempts
    );
  }
}

// Singleton instance
export const webSocketService = new WebSocketService({
  url: import.meta.env.DEV
    ? "ws://localhost:8080/ws"
    : `wss://${window.location.host}/ws`,
});

// Mock WebSocket messages for development
export function createMockWebSocketMessages() {
  const mockMessages = [
    {
      type: "threat_detected" as const,
      payload: {
        email_id: "email_123",
        threat_type: "phishing",
        severity: "high" as const,
        sender: "suspicious@example.com",
        subject: "Urgent: Verify Your Account",
        detected_at: new Date().toISOString(),
        action_required: true,
      },
      timestamp: new Date().toISOString(),
    },
    {
      type: "email_scan_complete" as const,
      payload: {
        scan_id: "scan_456",
        emails_processed: 47,
        threats_found: 3,
        scan_duration: 2340,
        summary: {
          clean: 41,
          suspicious: 3,
          malicious: 2,
          quarantined: 1,
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      type: "system_update" as const,
      payload: {
        component: "threat-detection-engine",
        status: "completed" as const,
        message: "Threat detection models updated successfully",
        progress: 100,
      },
      timestamp: new Date().toISOString(),
    },
  ];

  return mockMessages;
}

// Development helper to simulate real-time messages
export function startMockWebSocketMessages(
  intervalMs: number = 10000
): () => void {
  const mockMessages = createMockWebSocketMessages();
  let messageIndex = 0;

  const interval = setInterval(() => {
    const message = mockMessages[messageIndex % mockMessages.length];
    messageIndex++;

    // Simulate received message
    webSocketService["handleMessage"](message);
  }, intervalMs);

  return () => clearInterval(interval);
}
