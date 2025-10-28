// Sidebar Navigation Component

import { useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Mail,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  active?: boolean;
  badge?: number;
}

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export function Sidebar() {
  const { isCollapsed } = useSidebar();

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      path: "/dashboard",
    },
    {
      id: "emails",
      label: "Emails",
      icon: <Mail size={20} />,
      path: "/emails",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out z-40 ${
      isCollapsed ? 'w-20' : 'w-70'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700 min-h-20">
        <div className="flex items-center gap-2">
          <Shield className="text-green-400 shrink-0" size={24} />
          {!isCollapsed && (
            <span className="text-lg font-bold text-white whitespace-nowrap">
              Phishing<span className="text-green-400">Guard</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="list-none m-0 p-0">
          {sidebarItems.map((item) => (
            <li key={item.id} className="mb-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center w-full px-6 py-3 bg-transparent border-none text-gray-300 no-underline transition-all duration-200 cursor-pointer rounded-none relative ${
                    isActive
                      ? 'bg-green-400/10 text-green-400 border-r-4 border-green-400'
                      : 'hover:bg-gray-700 hover:text-white'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <span className="shrink-0 flex items-center justify-center">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="ml-3 text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-5 text-center ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">System Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
