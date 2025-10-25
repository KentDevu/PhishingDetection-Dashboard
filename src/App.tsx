import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { DashboardLayout } from "./components/layout";
import { Dashboard } from "./pages/Dashboard";
import { Emails } from "./pages/Emails";
import { Analytics } from "./pages/Analytics";
import Settings from "./pages/Settings";
// Removed pages - no API support:
// - Alerts page (alerts are just high-risk emails, shown in Dashboard/Emails)
// - Threats page (threat data is in email.threat_summary already)
// - Intelligence page (no separate intelligence API)
// - ThreatMonitoringPage (no real-time monitoring API)
// - EmailUploadPage (n8n handles email ingestion via IMAP)
import { NotificationProvider } from "./contexts/NotificationContext";
import { ConnectedToastContainer } from "./components/notifications/ConnectedToastContainer";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ConnectedToastContainer />
        </DashboardLayout>
      </Router>
    </NotificationProvider>
  );
}

export default App;
