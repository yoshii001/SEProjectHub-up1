import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Palette, 
  Settings, 
  LogOut,
  Layers,
  FileText,
  Target,
  GitBranch
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { theme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Agile Board', href: '/agile', icon: Target },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Components', href: '/components', icon: Layers },
    { name: 'Themes', href: '/themes', icon: Palette },
    { name: 'Requirements', href: '/requirements', icon: FileText },
    { name: 'Team Management', href: '/teams', icon: GitBranch },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="w-64 h-screen bg-surface border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary text-shadow-sm">
          SE Project Hub
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-shadow-sm'
                  : 'text-secondary hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex items-center w-full"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-error hover:bg-red-50 
                     dark:hover:bg-red-900/20 rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;