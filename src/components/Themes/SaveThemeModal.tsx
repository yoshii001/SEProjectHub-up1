import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Palette } from 'lucide-react';
import { useThemes } from '../../hooks/useThemes';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../UI/Button';

interface SaveThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveThemeModal: React.FC<SaveThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { saveTheme } = useThemes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Theme name is required';
    } else if (/\s/.test(formData.name)) {
      newErrors.name = 'Theme name cannot contain spaces';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Theme name must be at least 3 characters';
    } else if (formData.name.length > 30) {
      newErrors.name = 'Theme name must be less than 30 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await saveTheme({
        name: formData.name.trim(),
        description: formData.description.trim(),
        themeData: {
          mode: theme.mode,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor
        }
      });
      
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to save theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
            onClick={handleBackdropClick}
          />
          
          {/* Modal container */}
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface px-6 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-primary text-shadow-sm flex items-center">
                    <Palette className="w-6 h-6 mr-2" />
                    Save Theme
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-muted hover:text-secondary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Current Theme Preview */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-primary mb-3">Current Theme Preview</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                    <div className="text-sm text-secondary">
                      <p>Mode: <span className="capitalize font-medium">{theme.mode}</span></p>
                      <p>Colors: {theme.primaryColor}, {theme.secondaryColor}, {theme.accentColor}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Theme Name */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Theme Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`block w-full px-3 py-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., oceanblue, modernslate"
                      maxLength={30}
                    />
                    {errors.name && (
                      <p className="text-error text-sm mt-1">{errors.name}</p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      No spaces allowed. Use lowercase letters, numbers, and underscores only.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`block w-full px-3 py-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                        errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Describe your theme..."
                      maxLength={200}
                    />
                    {errors.description && (
                      <p className="text-error text-sm mt-1">{errors.description}</p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      {formData.description.length}/200 characters
                    </p>
                  </div>

                  {/* Theme Data Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Theme Configuration
                    </h5>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <p>Mode: <span className="font-mono">{theme.mode}</span></p>
                      <p>Primary: <span className="font-mono">{theme.primaryColor}</span></p>
                      <p>Secondary: <span className="font-mono">{theme.secondaryColor}</span></p>
                      <p>Accent: <span className="font-mono">{theme.accentColor}</span></p>
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!formData.name.trim() || loading}
                  icon={Save}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save Theme'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="mt-3 sm:mt-0 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SaveThemeModal;