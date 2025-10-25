// Real-time Threat Dashboard Component
// Comprehensive dashboard for monitoring and managing real-time threats

import React, { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  useRealTimeThreatMonitoring,
  useThreatEvents,
  useSystemEvents,
} from "../../hooks/useRealTimeThreatMonitoring";
import type { RealTimeThreatEvent } from "../../services/realTimeThreatMonitor";

interface ThreatDashboardProps {
  className?: string;
  autoStart?: boolean;
  showSystemEvents?: boolean;
  maxEvents?: number;
}

interface ThreatEventItemProps {
  event: RealTimeThreatEvent;
  onViewDetails?: (event: RealTimeThreatEvent) => void;
}

// Severity color mapping
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "critical":
      return "bg-red-500 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "medium":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-500 text-white";
  }
};

// Event type icon mapping
const getEventTypeIcon = (type: string): string => {
  switch (type) {
    case "threat_detected":
      return "🚨";
    case "system_alert":
      return "⚠️";
    case "scan_complete":
      return "✅";
    case "email_processed":
      return "📧";
    default:
      return "📊";
  }
};

// Format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
};

// Individual threat event component
const ThreatEventItem: React.FC<ThreatEventItemProps> = ({
  event,
  onViewDetails,
}) => {
  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="text-xl shrink-0 mt-1">
        {getEventTypeIcon(event.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {event.title}
          </h4>
          <div className="flex items-center space-x-2">
            <Badge className={`${getSeverityColor(event.severity)} text-xs`}>
              {event.severity.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {event.description}
        </p>

        {event.metadata && (
          <div className="mt-2 text-xs text-gray-500">
            {event.email_id && (
              <span className="mr-4">Email: {event.email_id}</span>
            )}
            {event.metadata.threat_type && (
              <span className="mr-4">Type: {event.metadata.threat_type}</span>
            )}
            {event.metadata.confidence_score && (
              <span>
                Confidence: {Math.round(event.metadata.confidence_score * 100)}%
              </span>
            )}
          </div>
        )}

        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-6 px-2 text-xs"
            onClick={() => onViewDetails(event)}
          >
            View Details
          </Button>
        )}
      </div>
    </div>
  );
};

// Main dashboard component
export const RealTimeThreatDashboard: React.FC<ThreatDashboardProps> = ({
  className = "",
  autoStart = true,
  showSystemEvents = true,
  maxEvents = 50,
}) => {
  const [selectedTab, setSelectedTab] = useState<"threats" | "system" | "all">(
    "threats"
  );
  const [selectedEvent, setSelectedEvent] =
    useState<RealTimeThreatEvent | null>(null);

  // Main monitoring hook
  const {
    isMonitoring,
    connectionStatus,
    loading,
    error,
    stats,
    hasActiveThreats,
    startMonitoring,
    stopMonitoring,
    clearEvents,
  } = useRealTimeThreatMonitoring({
    autoStart,
    maxEvents,
    notificationEnabled: true,
  });

  // Specific event hooks
  const { threatEvents } = useThreatEvents({
    autoRefresh: true,
    limit: maxEvents,
  });

  const { systemEvents, criticalAlerts } = useSystemEvents({
    autoRefresh: true,
    limit: maxEvents,
  });

  // Combine events for "all" tab
  const allEvents = useMemo(() => {
    const combined = [...threatEvents, ...systemEvents];
    return combined
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, maxEvents);
  }, [threatEvents, systemEvents, maxEvents]);

  // Get current events based on selected tab
  const currentEvents = useMemo(() => {
    switch (selectedTab) {
      case "threats":
        return threatEvents;
      case "system":
        return systemEvents;
      case "all":
        return allEvents;
      default:
        return [];
    }
  }, [selectedTab, threatEvents, systemEvents, allEvents]);

  // Connection status indicator
  const getConnectionStatusColor = (status: string): string => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle view details
  const handleViewDetails = (event: RealTimeThreatEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Real-time Threat Monitor
          </h2>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${getConnectionStatusColor(
                connectionStatus
              )}`}
            />
            <span className="text-sm text-gray-600 capitalize">
              {connectionStatus}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={loading}
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
          >
            {loading
              ? "Loading..."
              : isMonitoring
              ? "Stop Monitoring"
              : "Start Monitoring"}
          </Button>

          <Button
            onClick={clearEvents}
            variant="outline"
            size="sm"
            disabled={stats.totalEvents === 0}
          >
            Clear Events
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Monitoring Error
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All monitoring events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Threats
            </CardTitle>
            <span className="text-2xl">{hasActiveThreats ? "🚨" : "✅"}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.criticalThreats + stats.highThreats}
            </div>
            <p className="text-xs text-muted-foreground">
              Critical and high severity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {criticalAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              System critical alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <span className="text-2xl">{isMonitoring ? "🟢" : "🔴"}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMonitoring ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-muted-foreground">Monitoring status</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>
            Real-time threat detection and system monitoring events
          </CardDescription>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setSelectedTab("threats")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedTab === "threats"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Threats ({threatEvents.length})
            </button>

            {showSystemEvents && (
              <button
                onClick={() => setSelectedTab("system")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTab === "system"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                System ({systemEvents.length})
              </button>
            )}

            <button
              onClick={() => setSelectedTab("all")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedTab === "all"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({allEvents.length})
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {currentEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No {selectedTab} events detected</p>
              <p className="text-sm mt-1">
                {isMonitoring
                  ? "Monitoring is active..."
                  : "Start monitoring to see events"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentEvents.map((event) => (
                <ThreatEventItem
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>{getEventTypeIcon(selectedEvent.type)}</span>
                  <span>{selectedEvent.title}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Event ID: {selectedEvent.id} •{" "}
                {formatTimestamp(selectedEvent.timestamp)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Severity</h4>
                <Badge className={getSeverityColor(selectedEvent.severity)}>
                  {selectedEvent.severity.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              {selectedEvent.email_id && (
                <div>
                  <h4 className="font-medium mb-2">Associated Email</h4>
                  <p className="text-gray-700 font-mono text-sm">
                    {selectedEvent.email_id}
                  </p>
                </div>
              )}

              {selectedEvent.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Metadata</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
