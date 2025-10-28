// Notification Settings Component

import { useState, useEffect } from "react";
import { Bell, Volume2, VolumeX } from "lucide-react";

export function NotificationSettings() {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Check current notification permission
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="text-gray-400" size={20} />
        <h3 className="text-lg font-medium text-white">Browser Notifications</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            {permissionStatus === "granted" ? (
              <Volume2 className="text-green-400" size={20} />
            ) : (
              <VolumeX className="text-gray-400" size={20} />
            )}
            <div>
              <p className="text-white font-medium">Browser Notifications</p>
              <p className="text-sm text-gray-400">
                {permissionStatus === "granted"
                  ? "Notifications are enabled"
                  : permissionStatus === "denied"
                  ? "Notifications are blocked"
                  : "Click to enable notifications"}
              </p>
            </div>
          </div>

          {permissionStatus !== "granted" && (
            <button
              onClick={requestBrowserPermission}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Enable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}