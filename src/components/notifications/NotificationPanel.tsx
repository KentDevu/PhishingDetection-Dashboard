// Notification Panel Component

import { useState, useRef, useEffect } from "react";
import { Bell, BellRing, Check, X, Settings, Trash2 } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import type { Notification } from "../../types/notifications";

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = notification.timestamp.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const sortedGroups = Object.entries(groupedNotifications).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="notification-panel">
      <button
        ref={buttonRef}
        className={`notification-bell ${
          unreadCount > 0 ? "notification-bell--has-unread" : ""
        }`}
        onClick={togglePanel}
        aria-label={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} unread)` : ""
        }`}
        aria-expanded={isOpen}
      >
        {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {Math.min(unreadCount, 99)}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="notification-dropdown">
          <div className="notification-dropdown__header">
            <h3>Notifications</h3>
            <div className="notification-dropdown__actions">
              {unreadCount > 0 && (
                <button
                  className="btn-icon"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <Check size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="btn-icon"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                className="btn-icon"
                onClick={() => {
                  /* Navigate to notification settings */
                }}
                title="Notification settings"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="notification-dropdown__content">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={48} />
                <h4>No notifications</h4>
                <p>You're all caught up! New notifications will appear here.</p>
              </div>
            ) : (
              <div className="notification-list">
                {sortedGroups.map(([date, dayNotifications]) => (
                  <div key={date} className="notification-group">
                    <div className="notification-group__date">
                      {formatGroupDate(date)}
                    </div>
                    {dayNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onRemove={() => removeNotification(notification.id)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-dropdown__footer">
              <button className="btn-link">View all notifications</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onRemove: () => void;
}

function NotificationItem({
  notification,
  onClick,
  onRemove,
}: NotificationItemProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "var(--color-success)";
      case "error":
        return "var(--color-danger)";
      case "warning":
        return "var(--color-warning)";
      case "info":
        return "var(--color-info)";
      case "threat":
        return "var(--color-danger)";
      default:
        return "var(--color-primary)";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "threat":
        return "🛡️";
      default:
        return "📢";
    }
  };

  return (
    <div
      className={`notification-item ${
        !notification.read ? "notification-item--unread" : ""
      }`}
      onClick={onClick}
    >
      <div className="notification-item__indicator">
        <div
          className="notification-item__dot"
          style={{ backgroundColor: getTypeColor(notification.type) }}
        />
      </div>

      <div className="notification-item__content">
        <div className="notification-item__header">
          <span className="notification-item__icon">
            {getTypeIcon(notification.type)}
          </span>
          <h4 className="notification-item__title">{notification.title}</h4>
          <time className="notification-item__time">
            {formatTime(notification.timestamp)}
          </time>
        </div>

        <p className="notification-item__message">{notification.message}</p>

        {notification.actions && notification.actions.length > 0 && (
          <div className="notification-item__actions">
            {notification.actions.slice(0, 2).map((action) => (
              <button
                key={action.id}
                className={`notification-item__action ${
                  action.primary ? "primary" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  action.action();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="notification-item__remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Remove notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Helper functions
function formatGroupDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return "Just now";
  }
}

// Notification Panel Styles
const styles = `
.notification-panel {
  position: relative;
}

.notification-bell {
  position: relative;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.notification-bell:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.notification-bell--has-unread {
  color: var(--color-primary);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-danger);
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-width: 90vw;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-dropdown, 1000);
  max-height: 600px;
  display: flex;
  flex-direction: column;
  margin-top: var(--spacing-sm);
}

.notification-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.notification-dropdown__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.notification-dropdown__actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.notification-dropdown__content {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.notification-empty svg {
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.notification-empty h4 {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.notification-empty p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  max-width: 250px;
}

.notification-list {
  padding: var(--spacing-sm) 0;
}

.notification-group__date {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-primary);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 1;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  border-bottom: 1px solid var(--border-secondary);
}

.notification-item:hover {
  background: var(--bg-tertiary);
}

.notification-item--unread {
  background: rgba(19, 255, 160, 0.05);
}

.notification-item__indicator {
  flex-shrink: 0;
  padding-top: 4px;
}

.notification-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
}

.notification-item__content {
  flex: 1;
  min-width: 0;
}

.notification-item__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.notification-item__icon {
  font-size: 14px;
}

.notification-item__title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-item__time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  flex-shrink: 0;
}

.notification-item__message {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-item__actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.notification-item__action {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.notification-item__action:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
}

.notification-item__action.primary {
  background: var(--color-primary);
  color: var(--bg-primary);
  border-color: var(--color-primary);
}

.notification-item__remove {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  margin-top: 2px;
}

.notification-item__remove:hover {
  background: var(--bg-danger);
  color: var(--color-danger);
}

.notification-dropdown__footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
  text-align: center;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.btn-link:hover {
  color: #00CC80;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notification-dropdown {
    width: calc(100vw - 2 * var(--spacing-lg));
    right: calc(-100vw + 100% + var(--spacing-lg));
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("notification-panel-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "notification-panel-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
