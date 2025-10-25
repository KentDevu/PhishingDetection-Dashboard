// Real-time Threat Status Component
// Compact status indicator for navigation bar or header

import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRealTimeThreatMonitoring } from "../../hooks/useRealTimeThreatMonitoring";

interface ThreatStatusIndicatorProps {
  className?: string;
  onClick?: () => void;
  showDetails?: boolean;
  autoStart?: boolean;
}

export const ThreatStatusIndicator: React.FC<ThreatStatusIndicatorProps> = ({
  className = "",
  onClick,
  showDetails = false,
  autoStart = true,
}) => {
  const { isMonitoring, connectionStatus, stats, hasActiveThreats } =
    useRealTimeThreatMonitoring({
      autoStart,
      maxEvents: 20,
      notificationEnabled: false, // Reduce noise for status indicator
    });

  // Status color based on threats and connection
  const getStatusColor = (): string => {
    if (!isMonitoring) return "bg-gray-500";
    if (connectionStatus !== "connected") return "bg-yellow-500";
    if (stats.criticalThreats > 0) return "bg-red-500";
    if (stats.highThreats > 0) return "bg-orange-500";
    return "bg-green-500";
  };

  // Status text
  const getStatusText = (): string => {
    if (!isMonitoring) return "Monitoring Offline";
    if (connectionStatus !== "connected") return "Connecting...";
    if (stats.criticalThreats > 0)
      return `${stats.criticalThreats} Critical Threats`;
    if (stats.highThreats > 0) return `${stats.highThreats} High Threats`;
    return "All Clear";
  };

  // Alert count for badge
  const alertCount = stats.criticalThreats + stats.highThreats;

  const content = (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status indicator dot */}
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor()} ${
          isMonitoring && connectionStatus === "connected"
            ? "animate-pulse"
            : ""
        }`}
      />

      {/* Status text (if showing details) */}
      {showDetails && (
        <span className="text-sm font-medium text-gray-700">
          {getStatusText()}
        </span>
      )}

      {/* Alert badge */}
      {alertCount > 0 && (
        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
          {alertCount}
        </Badge>
      )}

      {/* Active threats indicator */}
      {hasActiveThreats && (
        <span className="text-red-500 text-lg animate-pulse">🚨</span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={`h-auto p-2 hover:bg-gray-100 ${className}`}
        title={getStatusText()}
      >
        {content}
      </Button>
    );
  }

  return (
    <div className={`p-2 ${className}`} title={getStatusText()}>
      {content}
    </div>
  );
};

// Compact threat counter for dashboards
export const ThreatCounter: React.FC<{
  className?: string;
  variant?: "default" | "minimal";
}> = ({ className = "", variant = "default" }) => {
  const { stats, isMonitoring } = useRealTimeThreatMonitoring({
    autoStart: true,
    maxEvents: 10,
    notificationEnabled: false,
  });

  if (!isMonitoring) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Monitoring offline
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {stats.criticalThreats > 0 && (
          <Badge className="bg-red-500 text-white">
            {stats.criticalThreats} Critical
          </Badge>
        )}
        {stats.highThreats > 0 && (
          <Badge className="bg-orange-500 text-white">
            {stats.highThreats} High
          </Badge>
        )}
        {stats.criticalThreats === 0 && stats.highThreats === 0 && (
          <Badge className="bg-green-500 text-white">All Clear</Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Active Threats</h4>
        <span className="text-xs text-gray-500">
          {stats.totalEvents} total events
        </span>
      </div>

      <div className="mt-2 flex items-center space-x-3">
        {stats.criticalThreats > 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm text-red-700 font-medium">
              {stats.criticalThreats} Critical
            </span>
          </div>
        )}

        {stats.highThreats > 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-sm text-orange-700 font-medium">
              {stats.highThreats} High
            </span>
          </div>
        )}

        {stats.criticalThreats === 0 && stats.highThreats === 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-green-700 font-medium">
              No Active Threats
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Live event feed for sidebar or mini-dashboard
export const LiveEventFeed: React.FC<{
  className?: string;
  maxEvents?: number;
  showSystemEvents?: boolean;
}> = ({ className = "", maxEvents = 5, showSystemEvents = false }) => {
  const { recentEvents, isMonitoring } = useRealTimeThreatMonitoring({
    autoStart: true,
    maxEvents,
    notificationEnabled: false,
  });

  const displayEvents = showSystemEvents
    ? recentEvents
    : recentEvents.filter((e) => e.type === "threat_detected");

  if (!isMonitoring) {
    return (
      <div className={`p-3 text-center text-gray-500 text-sm ${className}`}>
        <div className="text-2xl mb-1">⏸️</div>
        Monitoring paused
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-3 border-b">
        <h4 className="text-sm font-medium text-gray-900">Live Events</h4>
        <div className="flex items-center space-x-1 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Monitoring active</span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {displayEvents.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            <div className="text-xl mb-1">📭</div>
            No recent events
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {displayEvents.slice(0, maxEvents).map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50"
              >
                <div className="text-sm shrink-0 mt-0.5">
                  {event.type === "threat_detected"
                    ? "🚨"
                    : event.type === "system_alert"
                    ? "⚠️"
                    : "📊"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {(event.severity === "critical" ||
                  event.severity === "high") && (
                  <Badge
                    className={`text-xs ${
                      event.severity === "critical"
                        ? "bg-red-500 text-white"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    {event.severity}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
