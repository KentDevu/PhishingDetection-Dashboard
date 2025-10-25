// Real-time Threat Monitoring Integration Example
// Demonstrates how to integrate real-time monitoring into the main application

import React, { useState } from "react";
import { RealTimeThreatDashboard } from "./RealTimeThreatDashboard";
import {
  ThreatStatusIndicator,
  ThreatCounter,
  LiveEventFeed,
} from "./ThreatStatusIndicator";
import { useRealTimeThreatMonitoring } from "../../hooks/useRealTimeThreatMonitoring";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

interface ThreatMonitoringPageProps {
  className?: string;
}

export const ThreatMonitoringPage: React.FC<ThreatMonitoringPageProps> = ({
  className = "",
}) => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Navigation Bar Example */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Phishing Detection Platform
          </h1>

          {/* Real-time status in navigation */}
          <div className="flex items-center space-x-4">
            <ThreatStatusIndicator
              showDetails={true}
              onClick={() => setShowDashboard(!showDashboard)}
              autoStart={true}
            />
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Header with threat counter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Security Dashboard
              </h2>
              <p className="text-gray-600">
                Real-time threat monitoring and email analysis
              </p>
            </div>

            <ThreatCounter variant="default" />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main dashboard area */}
          <div className="lg:col-span-3">
            {showDashboard ? (
              <RealTimeThreatDashboard
                autoStart={true}
                showSystemEvents={true}
                maxEvents={100}
              />
            ) : (
              <WelcomeDashboard
                onShowMonitoring={() => setShowDashboard(true)}
              />
            )}
          </div>

          {/* Sidebar with live feed */}
          <div className="lg:col-span-1 space-y-6">
            <LiveEventFeed maxEvents={10} showSystemEvents={true} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setShowDashboard(true)}
                  className="w-full text-left justify-start"
                  variant="ghost"
                  size="sm"
                >
                  📊 View Full Dashboard
                </Button>
                <Button
                  onClick={() => (window.location.href = "/emails")}
                  className="w-full text-left justify-start"
                  variant="ghost"
                  size="sm"
                >
                  📧 Analyze Emails
                </Button>
                <Button
                  onClick={() => (window.location.href = "/threats")}
                  className="w-full text-left justify-start"
                  variant="ghost"
                  size="sm"
                >
                  🚨 View Threats
                </Button>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <MonitoringStatusSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

// Welcome dashboard component
const WelcomeDashboard: React.FC<{ onShowMonitoring: () => void }> = ({
  onShowMonitoring,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Real-time Threat Monitoring</CardTitle>
          <CardDescription>
            Advanced phishing detection with immediate threat awareness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                🚨 Real-time Alerts
              </h3>
              <p className="text-sm text-blue-700">
                Get instant notifications when threats are detected
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                📊 Live Monitoring
              </h3>
              <p className="text-sm text-green-700">
                Continuous email analysis and threat assessment
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                🔍 AI Analysis
              </h3>
              <p className="text-sm text-purple-700">
                Advanced CTI engines for accurate threat detection
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">
                ⚡ Instant Response
              </h3>
              <p className="text-sm text-orange-700">
                Immediate awareness and response capabilities
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={onShowMonitoring} className="w-full">
              Open Real-time Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Monitoring status summary component
const MonitoringStatusSummary: React.FC = () => {
  const {
    isMonitoring,
    connectionStatus,
    stats,
    startMonitoring,
    stopMonitoring,
    loading,
  } = useRealTimeThreatMonitoring({
    autoStart: true,
    maxEvents: 10,
    notificationEnabled: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Monitoring Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span
            className={`font-medium ${
              isMonitoring ? "text-green-600" : "text-red-600"
            }`}
          >
            {isMonitoring ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Connection:</span>
          <span
            className={`font-medium ${
              connectionStatus === "connected"
                ? "text-green-600"
                : connectionStatus === "connecting"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {connectionStatus}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Events:</span>
          <span className="font-medium">{stats.totalEvents}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Active Threats:</span>
          <span
            className={`font-medium ${
              stats.criticalThreats + stats.highThreats > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {stats.criticalThreats + stats.highThreats}
          </span>
        </div>

        <div className="pt-2 border-t">
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={loading}
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            className="w-full"
          >
            {loading ? "Loading..." : isMonitoring ? "Stop" : "Start"}{" "}
            Monitoring
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatMonitoringPage;
