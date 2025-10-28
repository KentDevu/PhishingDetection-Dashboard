// Header Component with Search and User Actions

import { useState } from "react";
import { Search, User, Menu } from "lucide-react";

export interface HeaderProps {
  title: string;
  onToggleSidebar?: () => void;
}

export function Header({ title, onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex items-center gap-6 px-6 xl:px-8 bg-gray-800 border-b border-gray-700 min-h-20">
      {/* Mobile Menu Toggle */}
      <button 
        className="hidden md:flex bg-transparent border border-gray-600 rounded-md text-gray-400 p-2 cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-green-400 hover:text-green-400"
        onClick={onToggleSidebar}
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="flex-1 md:flex-none">
        <h1 className="text-2xl font-bold text-white m-0 leading-tight">{title}</h1>
        <p className="text-sm text-gray-400 m-0 leading-tight">Phishing Detection Overview</p>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          <input
            type="text"
            placeholder="Search emails, domains, threats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}

        {/* User Profile */}
        <div className="relative">
          <button className="flex items-center gap-2 p-2 bg-transparent border border-gray-600 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-green-400">
            <div className="w-8 h-8 bg-linear-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-sm font-medium text-white leading-tight">Admin</span>
              <span className="text-xs text-gray-400 leading-tight">Security Analyst</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
