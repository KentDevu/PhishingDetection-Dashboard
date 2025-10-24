// Notification Context Provider

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type {
  Notification,
  NotificationContextType,
  NotificationPreferences,
  NotificationType,
} from "../types/notifications";
import {
  generateNotificationId,
  defaultNotificationPreferences,
  shouldShowNotification,
  getNotificationSound,
} from "../types/notifications";
import { webSocketService } from "../services/websocketService";

// Notification Actions
type NotificationAction =
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: { id: string } }
  | { type: "MARK_AS_READ"; payload: { id: string } }
  | { type: "MARK_ALL_READ" }
  | { type: "CLEAR_ALL" }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<NotificationPreferences> };

// Notification State
interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
}

const initialState: NotificationState = {
  notifications: [],
  preferences: defaultNotificationPreferences,
};

// Notification Reducer
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 100), // Keep max 100 notifications
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload.id
        ),
      };

    case "MARK_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, read: true } : n
        ),
      };

    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "CLEAR_ALL":
      return {
        ...state,
        notifications: [],
      };

    case "UPDATE_PREFERENCES":
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    default:
      return state;
  }
}

// Create Context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Notification Provider Component
interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [hasBrowserPermission, setHasBrowserPermission] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);

  // Initialize browser notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setHasBrowserPermission(Notification.permission === "granted");
    }
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("notification-preferences");
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
      } catch (error) {
        console.error("Failed to load notification preferences:", error);
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(
      "notification-preferences",
      JSON.stringify(state.preferences)
    );
  }, [state.preferences]);

  // WebSocket connection management
  useEffect(() => {
    let mounted = true;

    const connectWebSocket = async () => {
      try {
        await webSocketService.connect();
        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    // Set up WebSocket event listeners
    const unsubscribeHandlers = [
      webSocketService.on("connection", () => {
        if (mounted) {
          setIsConnected(true);
          addNotification({
            type: "success",
            title: "Connected",
            message: "Real-time notifications are now active",
            duration: 3000,
          });
        }
      }),

      webSocketService.on("disconnect", () => {
        if (mounted) {
          setIsConnected(false);
        }
      }),

      webSocketService.on("threat_alert", (message) => {
        if (mounted) {
          addNotification({
            type: "threat",
            title: "Threat Detected",
            message: `${message.payload.threat_type.toUpperCase()} detected from ${
              message.payload.sender
            }`,
            persistent: true,
            metadata: {
              severity: message.payload.severity,
              email_id: message.payload.email_id,
              threat_type: message.payload.threat_type,
            },
            actions: [
              {
                id: "investigate",
                label: "Investigate",
                action: () => {
                  window.location.href = `/emails?id=${message.payload.email_id}`;
                },
                primary: true,
              },
              {
                id: "quarantine",
                label: "Quarantine",
                action: () => {
                  // Handle quarantine action
                  console.log("Quarantine email:", message.payload.email_id);
                },
                destructive: true,
              },
            ],
          });
        }
      }),

      webSocketService.on("system_update", (message) => {
        if (mounted) {
          const { component, status, message: updateMessage } = message.payload;
          addNotification({
            type:
              status === "failed"
                ? "error"
                : status === "completed"
                ? "success"
                : "info",
            title: `System Update: ${component}`,
            message: updateMessage,
            duration: status === "completed" ? 5000 : undefined,
          });
        }
      }),

      webSocketService.on("scan_complete", (message) => {
        if (mounted) {
          const { emails_processed, threats_found } = message.payload;
          addNotification({
            type: threats_found > 0 ? "warning" : "success",
            title: "Email Scan Complete",
            message: `Processed ${emails_processed} emails, found ${threats_found} threats`,
            duration: 5000,
            metadata: message.payload,
          });
        }
      }),
    ];

    connectWebSocket();

    return () => {
      mounted = false;
      unsubscribeHandlers.forEach((unsubscribe) => unsubscribe());
      webSocketService.disconnect();
    };
  }, []);

  // Auto-remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      state.notifications.forEach((notification) => {
        if (
          notification.duration &&
          !notification.persistent &&
          now - notification.timestamp.getTime() > notification.duration
        ) {
          dispatch({
            type: "REMOVE_NOTIFICATION",
            payload: { id: notification.id },
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.notifications]);

  // Add notification function
  const addNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "timestamp">): string => {
      const notification: Notification = {
        ...notificationData,
        id: generateNotificationId(),
        timestamp: new Date(),
        read: false,
      };

      // Check if notification should be shown based on preferences
      if (!shouldShowNotification(notification, state.preferences)) {
        return notification.id;
      }

      dispatch({ type: "ADD_NOTIFICATION", payload: notification });

      // Show browser notification if enabled and permission granted
      const typePrefs = state.preferences.notification_types[notification.type];
      if (
        hasBrowserPermission &&
        typePrefs?.browser &&
        state.preferences.browser_notifications
      ) {
        showBrowserNotification(notification);
      }

      // Play sound if enabled
      if (typePrefs?.sound && state.preferences.sound_enabled) {
        playNotificationSound(notification.type);
      }

      return notification.id;
    },
    [state.preferences, hasBrowserPermission]
  );

  // Browser notification
  const showBrowserNotification = useCallback((notification: Notification) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      tag: notification.id,
      requireInteraction: notification.persistent,
    });

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
    };

    // Auto-close after duration if not persistent
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        browserNotification.close();
      }, notification.duration);
    }
  }, []);

  // Sound notification
  const playNotificationSound = useCallback((type: NotificationType) => {
    const soundUrl = getNotificationSound(type);
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.warn("Failed to play notification sound:", error);
      });
    }
  }, []);

  // Request browser permission
  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      setHasBrowserPermission(true);
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setHasBrowserPermission(granted);
      return granted;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }, []);

  // Other actions
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: { id } });
  }, []);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: "MARK_AS_READ", payload: { id } });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_READ" });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const updatePreferences = useCallback(
    (preferences: Partial<NotificationPreferences>) => {
      dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
    },
    []
  );

  const connect = useCallback(() => {
    webSocketService.connect().catch(console.error);
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
  }, []);

  // Computed values
  const unreadCount = useMemo(() => {
    return state.notifications.filter((n) => !n.read).length;
  }, [state.notifications]);

  const contextValue: NotificationContextType = {
    notifications: state.notifications,
    unreadCount,
    preferences: state.preferences,
    isConnected,
    hasBrowserPermission,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updatePreferences,
    connect,
    disconnect,
    requestBrowserPermission,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
}
