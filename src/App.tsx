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
import { Analytics } from "./pages/Analytics";
import Settings from "./pages/Settings";
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
