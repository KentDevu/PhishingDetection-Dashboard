import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { DashboardLayout } from "./components/layout";
import { Dashboard } from "./pages/Dashboard";
import { Alerts } from "./pages/Alerts";
import { Emails } from "./pages/Emails";
import { EmailUploadPage } from "./pages/EmailUploadPage";
import { Threats } from "./pages/Threats";
import { Analytics } from "./pages/Analytics";
import Settings from "./pages/Settings";
import { ThreatMonitoringPage } from "./components/monitoring/ThreatMonitoringPage";
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
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/emails/upload" element={<EmailUploadPage />} />
            <Route path="/threats" element={<Threats />} />
            <Route path="/monitoring" element={<ThreatMonitoringPage />} />
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
