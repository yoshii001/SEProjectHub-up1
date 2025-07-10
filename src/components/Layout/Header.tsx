import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../UI/NotificationPanel';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleMode } = useTheme();
  const { notifications, markAsRead, markAllAsRead, dismissNotification } = useNotifications();

  return (
    <header className="h-16 bg-surface border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects, clients, meetings..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleMode}
          className="p-2 text-muted hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme.mode === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.button>

        {/* Notifications */}
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDismiss={dismissNotification}
        />

        {/* User Avatar */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white text-shadow-sm">
              {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-primary">
              {currentUser?.displayName || 'User'}
            </p>
            <p className="text-xs text-muted">
              {currentUser?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;