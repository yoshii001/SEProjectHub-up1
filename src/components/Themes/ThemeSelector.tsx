import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Palette } from 'lucide-react';
import { useThemes, SavedTheme } from '../../hooks/useThemes';

interface ThemeSelectorProps {
  selectedThemeIds: string[];
  onThemeChange: (themeIds: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeIds,
  onThemeChange,
  placeholder = "Select themes...",
  multiple = true,
  required = false,
  className = ""
}) => {
  const { themes, loading } = useThemes();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredThemes, setFilteredThemes] = useState<SavedTheme[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = themes.filter(theme =>
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (theme.description && theme.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredThemes(filtered);
  }, [themes, searchTerm]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeToggle = (themeId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🎨 Theme toggle clicked:', themeId);
    console.log('🎨 Current selection:', selectedThemeIds);
    
    let newSelection: string[];
    
    if (multiple) {
      newSelection = selectedThemeIds.includes(themeId)
        ? selectedThemeIds.filter(id => id !== themeId)
        : [...selectedThemeIds, themeId];
    } else {
      newSelection = selectedThemeIds.includes(themeId) ? [] : [themeId];
      setIsOpen(false);
    }
    
    console.log('🎨 New selection:', newSelection);
    onThemeChange(newSelection);
  };

  const handleRemoveTheme = (themeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🗑️ Removing theme:', themeId);
    const newSelection = selectedThemeIds.filter(id => id !== themeId);
    console.log('🎨 New selection after removal:', newSelection);
    onThemeChange(newSelection);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔽 Dropdown toggle clicked, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  const getSelectedThemes = () => {
    return themes.filter(theme => selectedThemeIds.includes(theme.id));
  };

  const selectedThemes = getSelectedThemes();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Themes Display */}
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="min-h-[48px] w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedThemes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedThemes.map(theme => (
                  <div
                    key={theme.id}
                    className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: theme.themeData.primaryColor }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: theme.themeData.secondaryColor }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: theme.themeData.accentColor }}
                      />
                    </div>
                    <span className="font-medium">{theme.name}</span>
                    {multiple && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTheme(theme.id, e)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Validation Message */}
      {required && selectedThemeIds.length === 0 && (
        <p className="text-error text-sm mt-1">At least one theme is required</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search themes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
            </div>

            {/* Theme List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredThemes.length > 0 ? (
                filteredThemes.map(theme => {
                  const isSelected = selectedThemeIds.includes(theme.id);
                  return (
                    <motion.button
                      key={theme.id}
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`w-full p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 text-left ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={(e) => handleThemeToggle(theme.id, e)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex space-x-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: theme.themeData.primaryColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: theme.themeData.secondaryColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: theme.themeData.accentColor }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-primary text-sm">{theme.name}</p>
                            {theme.description && (
                              <p className="text-xs text-secondary">{theme.description}</p>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                <div className="p-6 text-center">
                  <Palette className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-muted text-sm">
                    {searchTerm ? 'No themes found matching your search' : 'No themes available'}
                  </p>
                  {!searchTerm && (
                    <p className="text-xs text-muted mt-1">
                      Create themes in the Themes section first
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''} available</span>
                {multiple && (
                  <span>{selectedThemeIds.length} selected</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;