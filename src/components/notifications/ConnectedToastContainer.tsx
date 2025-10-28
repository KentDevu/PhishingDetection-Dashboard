// Connected Toast Container

import { useNotifications } from "../../contexts/NotificationContext";
import { ToastContainer as BaseToastContainer } from "./Toast";

export function ConnectedToastContainer() {
  const { notifications, removeNotification } = useNotifications();

  // Only show notifications that are not persistent or are less than 10 seconds old
  const visibleNotifications = notifications
    .filter((notification) => {
      if (notification.persistent) return true;

      const age = notification.timestamp ? Date.now() - notification.timestamp.getTime() : 0;
      return age < 30000; // Show for 30 seconds max
    })
    .slice(0, 5); // Maximum 5 toasts at once

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  const handleAction = (notificationId: string, actionId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    const action = notification?.actions?.find((a) => a.id === actionId);

    if (action && notification) {
      action.action();

      // Auto-remove notification after action unless it's persistent
      if (!notification.persistent) {
        setTimeout(() => removeNotification(notificationId), 1000);
      }
    }
  };

  return (
    <BaseToastContainer
      notifications={visibleNotifications}
      onClose={handleClose}
      onAction={handleAction}
    />
  );
}
