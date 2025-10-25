# Real-time Threat Monitoring Feature

## Overview

This feature implements comprehensive real-time threat monitoring and notification capabilities for the phishing detection platform. It provides immediate awareness of threat detections, system events, and monitoring status through WebSocket connections and polling fallbacks.

## ✅ Implementation Status

### Completed Components

1. **Real-time Threat Monitor Service** (`src/services/realTimeThreatMonitor.ts`)

   - ✅ WebSocket integration with existing service
   - ✅ Polling fallback for email analysis
   - ✅ Event management and broadcasting
   - ✅ Connection status monitoring
   - ✅ Clean TypeScript implementation

2. **React Hooks** (`src/hooks/useRealTimeThreatMonitoring.ts`)

   - ✅ Main monitoring hook with full state management
   - ✅ Specialized threat events hook
   - ✅ System events monitoring hook
   - ✅ Notification integration
   - ✅ Auto-start and cleanup handling

3. **UI Components**

   - ✅ **RealTimeThreatDashboard** - Full-featured monitoring dashboard
   - ✅ **ThreatStatusIndicator** - Compact status indicator for navigation
   - ✅ **ThreatCounter** - Threat statistics display
   - ✅ **LiveEventFeed** - Real-time event stream component
   - ✅ **ThreatMonitoringPage** - Complete page integration example

4. **Integration**
   - ✅ Dashboard integration with real-time components
   - ✅ Navigation route for monitoring page (`/monitoring`)
   - ✅ Notification system integration
   - ✅ WebSocket service connectivity

## 🚀 Key Features

### Real-time Capabilities

- **Instant Threat Detection**: Immediate notifications for phishing attempts
- **WebSocket Integration**: Real-time communication with threat analysis API
- **Polling Fallback**: Ensures monitoring continues even without WebSocket connection
- **Event Management**: Sophisticated event handling and state management

### Monitoring Features

- **Live Status Indicators**: Visual connection and threat status
- **Event Classification**: Threats, system alerts, email processing events
- **Severity Levels**: Critical, high, medium categorization
- **Historical Events**: Maintains event history with filtering capabilities

### User Interface

- **Dashboard Components**: Full-featured monitoring dashboard
- **Status Indicators**: Compact indicators for navigation/header integration
- **Live Event Feeds**: Real-time event streams with filtering
- **Interactive Notifications**: Action buttons for threat response

### Developer Experience

- **TypeScript Safety**: Full type safety throughout the implementation
- **React Hooks Pattern**: Clean, reusable hooks for state management
- **Modular Architecture**: Separate concerns for services, hooks, and components
- **Error Handling**: Comprehensive error states and recovery

## 📁 File Structure

```
src/
├── services/
│   ├── realTimeThreatMonitor.ts      # Core monitoring service
│   ├── webSocketService.ts           # WebSocket communication (existing)
│   ├── threatAlertService.ts         # Threat detection service (existing)
│   └── emailService.ts               # Email analysis service (existing)
├── hooks/
│   └── useRealTimeThreatMonitoring.ts # React hooks for monitoring
├── components/
│   └── monitoring/
│       ├── RealTimeThreatDashboard.tsx    # Full dashboard component
│       ├── ThreatStatusIndicator.tsx      # Status indicators & live feed
│       └── ThreatMonitoringPage.tsx       # Complete page example
└── models/
    └── email.ts                       # Updated email models for API integration
```

## 🔧 Usage Examples

### Basic Monitoring Hook

```typescript
import { useRealTimeThreatMonitoring } from "../hooks/useRealTimeThreatMonitoring";

function MyComponent() {
  const {
    isMonitoring,
    connectionStatus,
    stats,
    hasActiveThreats,
    startMonitoring,
    stopMonitoring,
  } = useRealTimeThreatMonitoring({
    autoStart: true,
    maxEvents: 50,
    notificationEnabled: true,
  });

  return (
    <div>
      <p>Status: {isMonitoring ? "Active" : "Inactive"}</p>
      <p>Connection: {connectionStatus}</p>
      <p>Active Threats: {stats.criticalThreats + stats.highThreats}</p>
      {hasActiveThreats && <div>⚠️ Threats detected!</div>}
    </div>
  );
}
```

### Navigation Status Indicator

```typescript
import { ThreatStatusIndicator } from "../components/monitoring/ThreatStatusIndicator";

function NavigationBar() {
  return (
    <nav>
      <h1>Phishing Detection Platform</h1>
      <ThreatStatusIndicator
        showDetails={true}
        onClick={() => navigate("/monitoring")}
        autoStart={true}
      />
    </nav>
  );
}
```

### Full Dashboard Integration

```typescript
import { RealTimeThreatDashboard } from "../components/monitoring/RealTimeThreatDashboard";

function MonitoringPage() {
  return (
    <RealTimeThreatDashboard
      autoStart={true}
      showSystemEvents={true}
      maxEvents={100}
    />
  );
}
```

### Live Event Feed

```typescript
import { LiveEventFeed } from "../components/monitoring/ThreatStatusIndicator";

function Sidebar() {
  return (
    <aside>
      <LiveEventFeed maxEvents={10} showSystemEvents={true} />
    </aside>
  );
}
```

## 🔗 API Integration

### WebSocket Events

The system listens for these WebSocket events:

- `threat_detected` - New threat identification
- `system_alert` - System-level alerts
- `scan_complete` - Bulk scanning completion
- `email_processed` - Individual email analysis

### Polling Integration

- Automatic polling of `/api/emails` endpoint every 30 seconds
- Fallback when WebSocket connection is unavailable
- Configurable polling intervals

### Notification Integration

- Seamless integration with existing `NotificationContext`
- Automatic threat notifications for high/critical severity
- Action buttons for threat investigation and response

## ⚙️ Configuration Options

### Monitoring Configuration

```typescript
interface UseRealTimeThreatMonitoringOptions {
  autoStart?: boolean; // Auto-start monitoring (default: false)
  eventFilters?: {
    // Filter events by type/severity
    types?: string[];
    severities?: string[];
  };
  maxEvents?: number; // Maximum events to store (default: 50)
  notificationEnabled?: boolean; // Enable notifications (default: true)
}
```

### Service Configuration

```typescript
interface RealTimeThreatConfig {
  polling_interval_ms: number; // Polling interval (default: 30000)
  max_events: number; // Max stored events (default: 1000)
  critical_threshold: number; // Critical threat threshold (default: 0.8)
  high_threshold: number; // High threat threshold (default: 0.6)
}
```

## 🎯 Event Types and Severity Levels

### Event Types

- **threat_detected**: New phishing/malware detection
- **system_alert**: System-level alerts and warnings
- **scan_complete**: Bulk email scanning completion
- **email_processed**: Individual email analysis completion

### Severity Levels

- **critical**: Immediate action required (score > 0.8)
- **high**: High priority threats (score > 0.6)
- **medium**: Medium priority items
- **low**: Informational events

## 🔄 State Management

The monitoring system maintains comprehensive state:

```typescript
interface RealTimeThreatMonitoringState {
  isMonitoring: boolean; // Current monitoring status
  connectionStatus: string; // WebSocket connection status
  recentEvents: RealTimeThreatEvent[]; // Recent events across all types
  threatEvents: RealTimeThreatEvent[]; // Threat-specific events
  systemEvents: RealTimeThreatEvent[]; // System events
  eventCount: number; // Total event count
  loading: boolean; // Loading state
  error: string | null; // Error state
}
```

## 🚦 Connection Status

The system provides detailed connection status:

- **connected**: WebSocket active and receiving data
- **connecting**: Attempting to establish connection
- **disconnected**: No connection, using polling fallback
- **error**: Connection error occurred

## 📊 Statistics and Metrics

The monitoring system tracks:

- Total events processed
- Threat counts by severity level
- System event counts
- Connection uptime
- Error rates

## 🎨 UI Components Features

### RealTimeThreatDashboard

- Full-featured monitoring interface
- Statistics cards with real-time updates
- Event filtering by type and severity
- Interactive event details modal
- Connection status indicators

### ThreatStatusIndicator

- Compact status display for navigation
- Visual threat level indicators
- Click-through to full dashboard
- Badge notifications for active threats

### LiveEventFeed

- Real-time event stream
- Configurable event limits
- System/threat event filtering
- Timestamp formatting and grouping

## 🧪 Testing and Validation

### Build Status

✅ TypeScript compilation successful
✅ All components render without errors
✅ Hook state management functional
✅ Service integration working
✅ WebSocket connectivity established

### Validated Components

- Real-time threat monitor service
- React hooks for state management
- UI components and integrations
- Notification system integration
- Dashboard and page routing

## 🚀 Getting Started

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Navigate to monitoring page**:
   Visit `http://localhost:5173/monitoring`

3. **View integrated dashboard**:
   The main dashboard at `http://localhost:5173/dashboard` includes real-time components

4. **Test the monitoring**:
   - Monitoring auto-starts when components mount
   - WebSocket connection to `phishing-detection-api.kentharold.space`
   - Real-time updates and notifications

## 🔧 Customization

### Adding Custom Event Types

Extend the `RealTimeThreatEvent` interface in the monitor service:

```typescript
interface RealTimeThreatEvent {
  id: string;
  type:
    | "threat_detected"
    | "system_alert"
    | "scan_complete"
    | "email_processed"
    | "custom_event";
  // ... other properties
}
```

### Custom Notification Handlers

Implement custom notification logic in the hooks:

```typescript
const handleThreatEvent = useCallback((event: RealTimeThreatEvent) => {
  // Custom threat handling logic
  if (event.metadata?.custom_field) {
    // Handle custom event properties
  }
}, []);
```

## 🎯 Next Steps and Enhancements

### Potential Improvements

1. **Advanced Filtering**: More sophisticated event filtering options
2. **Historical Analytics**: Long-term threat trend analysis
3. **Custom Dashboards**: User-configurable dashboard layouts
4. **Export Capabilities**: Event data export and reporting
5. **Mobile Optimization**: Enhanced mobile interface for monitoring
6. **Alert Routing**: Advanced notification routing and escalation

### Integration Opportunities

1. **Email Client Integration**: Direct email client threat indicators
2. **SIEM Integration**: Security information and event management
3. **Incident Response**: Automated incident creation and tracking
4. **Threat Intelligence**: External threat feed integration

## 📋 Summary

The Real-time Threat Monitoring feature provides a comprehensive, production-ready solution for immediate threat awareness in the phishing detection platform. With robust TypeScript implementation, clean React patterns, and seamless integration with existing services, it delivers enterprise-grade monitoring capabilities with an excellent developer and user experience.

**Key Achievement**: Successfully implemented a complete real-time threat monitoring system with WebSocket integration, React hooks, comprehensive UI components, and seamless notification integration, all with full TypeScript safety and clean architecture.
