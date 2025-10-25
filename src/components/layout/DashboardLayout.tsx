// Dashboard Layout Component - Main container for the application

import type { ReactNode } from "react";
import { SidebarProvider, useSidebar, Sidebar } from "./Sidebar.tsx";
import { Header } from "./Header.tsx";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div
        className="main-content"
        style={{
          marginLeft: isCollapsed ? '80px' : '280px',
          transition: 'margin-left var(--duration-normal) var(--ease-in-out)'
        }}
      >
        <Header />
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

// CSS-in-JS styles using CSS custom properties
const styles = `
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("dashboard-layout-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "dashboard-layout-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
