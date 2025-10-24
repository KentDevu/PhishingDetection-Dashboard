// Toast Notification Component

import React, { useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
} from "lucide-react";
import type { Notification, NotificationType } from "../../types/notifications";

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  onAction?: (actionId: string) => void;
}

const notificationIcons: Record<NotificationType, React.ReactElement> = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
  threat: <Shield size={20} />,
};

const notificationStyles: Record<NotificationType, string> = {
  success: "toast--success",
  error: "toast--error",
  warning: "toast--warning",
  info: "toast--info",
  threat: "toast--threat",
};

export function Toast({ notification, onClose, onAction }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-dismiss if duration is specified and not persistent
    if (notification.duration && !notification.persistent) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.persistent]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200); // Match animation duration
  };

  const handleActionClick = (actionId: string) => {
    if (onAction) {
      onAction(actionId);
    }
    // Close toast after action unless it's persistent
    if (!notification.persistent) {
      handleClose();
    }
  };

  const icon = notificationIcons[notification.type];
  const styleClass = notificationStyles[notification.type];

  return (
    <div
      className={`toast ${styleClass} ${isVisible ? "toast--visible" : ""} ${
        isLeaving ? "toast--leaving" : ""
      }`}
      role="alert"
      aria-live={notification.type === "threat" ? "assertive" : "polite"}
    >
      <div className="toast__content">
        <div className="toast__header">
          <div className="toast__icon">{icon}</div>
          <div className="toast__title-wrapper">
            <h4 className="toast__title">{notification.title}</h4>
            <time className="toast__timestamp">
              {notification.timestamp.toLocaleTimeString()}
            </time>
          </div>
          {!notification.persistent && (
            <button
              className="toast__close"
              onClick={handleClose}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="toast__body">
          <p className="toast__message">{notification.message}</p>

          {notification.actions && notification.actions.length > 0 && (
            <div className="toast__actions">
              {notification.actions.map((action) => (
                <button
                  key={action.id}
                  className={`toast__action ${
                    action.primary ? "toast__action--primary" : ""
                  } ${action.destructive ? "toast__action--destructive" : ""}`}
                  onClick={() => handleActionClick(action.id)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  onAction?: (notificationId: string, actionId: string) => void;
}

export function ToastContainer({
  notifications,
  onClose,
  onAction,
}: ToastContainerProps) {
  const handleAction = (notificationId: string) => (actionId: string) => {
    if (onAction) {
      onAction(notificationId, actionId);
    }
  };

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
          onAction={handleAction(notification.id)}
        />
      ))}
    </div>
  );
}

// Toast Styles
const styles = `
.toast-container {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: var(--z-toast, 9999);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 420px;
  width: 100%;
  pointer-events: none;
}

.toast {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-lg);
  transform: translateX(100%);
  opacity: 0;
  transition: all 200ms var(--ease-in-out);
  pointer-events: auto;
  max-width: 100%;
}

.toast--visible {
  transform: translateX(0);
  opacity: 1;
}

.toast--leaving {
  transform: translateX(100%);
  opacity: 0;
}

/* Toast Type Styles */
.toast--success {
  border-left: 4px solid var(--color-success);
}

.toast--success .toast__icon {
  color: var(--color-success);
}

.toast--error {
  border-left: 4px solid var(--color-danger);
}

.toast--error .toast__icon {
  color: var(--color-danger);
}

.toast--warning {
  border-left: 4px solid var(--color-warning);
}

.toast--warning .toast__icon {
  color: var(--color-warning);
}

.toast--info {
  border-left: 4px solid var(--color-info);
}

.toast--info .toast__icon {
  color: var(--color-info);
}

.toast--threat {
  border-left: 4px solid var(--color-danger);
  background: rgba(239, 68, 68, 0.05);
  border-color: var(--color-danger);
}

.toast--threat .toast__icon {
  color: var(--color-danger);
}

/* Toast Content */
.toast__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.toast__header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.toast__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast__title-wrapper {
  flex: 1;
  min-width: 0;
}

.toast__title {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: 1.4;
}

.toast__timestamp {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.toast__close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.toast__body {
  padding-left: calc(20px + var(--spacing-sm)); /* Icon width + gap */
}

.toast__message {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.toast__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.toast__action {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.toast__action:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--color-primary);
}

.toast__action--primary {
  background: var(--color-primary);
  color: var(--bg-primary);
  border-color: var(--color-primary);
}

.toast__action--primary:hover {
  background: #00CC80;
  border-color: #00CC80;
}

.toast__action--destructive {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

.toast__action--destructive:hover {
  background: #dc2626;
  border-color: #dc2626;
}

/* Responsive Design */
@media (max-width: 768px) {
  .toast-container {
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    left: var(--spacing-lg);
    max-width: none;
  }

  .toast {
    padding: var(--spacing-md);
  }

  .toast__actions {
    flex-direction: column;
  }

  .toast__action {
    justify-content: center;
  }
}

/* Animation for multiple toasts */
.toast:nth-child(n+4) {
  opacity: 0.8;
  transform: scale(0.95);
}

.toast:nth-child(n+6) {
  display: none;
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("toast-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
