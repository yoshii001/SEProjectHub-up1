import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Sparkles,
  Eye,
  Download,
  Paintbrush,
  Save,
  Trash2,
  Plus,
  Edit
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemes } from '../hooks/useThemes';
import Button from '../components/UI/Button';
import SaveThemeModal from '../components/Themes/SaveThemeModal';
import { toast } from 'react-toastify';

const Themes: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  const { themes, loading, deleteTheme } = useThemes();
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const colorPalettes = [
    {
      id: 'default',
      name: 'Ocean Blue',
      description: 'Professional blue theme with purple accents',
      primary: '#3B82F6',
      secondary: '#14B8A6',
      accent: '#F97316',
      preview: 'bg-gradient-to-br from-blue-500 to-purple-600'
    },
    {
      id: 'emerald',
      name: 'Emerald Green',
      description: 'Fresh green theme with teal highlights',
      primary: '#10B981',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      preview: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      id: 'rose',
      name: 'Rose Pink',
      description: 'Elegant pink theme with warm accents',
      primary: '#F43F5E',
      secondary: '#EC4899',
      accent: '#F97316',
      preview: 'bg-gradient-to-br from-rose-500 to-pink-600'
    },
    {
      id: 'violet',
      name: 'Deep Violet',
      description: 'Rich purple theme with blue undertones',
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#06B6D4',
      preview: 'bg-gradient-to-br from-violet-500 to-purple-600'
    },
    {
      id: 'amber',
      name: 'Warm Amber',
      description: 'Warm orange theme with yellow highlights',
      primary: '#F59E0B',
      secondary: '#F97316',
      accent: '#EF4444',
      preview: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      id: 'slate',
      name: 'Modern Slate',
      description: 'Sophisticated gray theme with blue accents',
      primary: '#64748B',
      secondary: '#475569',
      accent: '#3B82F6',
      preview: 'bg-gradient-to-br from-slate-500 to-gray-600'
    }
  ];

  const customColors = [
    '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6', '#F59E0B', '#64748B',
    '#06B6D4', '#EC4899', '#A855F7', '#EF4444', '#84CC16', '#6366F1',
    '#14B8A6', '#F97316', '#BE185D', '#7C3AED', '#DC2626', '#059669'
  ];

  const applyPalette = (palette: typeof colorPalettes[0]) => {
    updateTheme({
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent
    });
  };

  const applyCustomColor = (color: string, type: 'primary' | 'secondary' | 'accent') => {
    updateTheme({
      [type === 'primary' ? 'primaryColor' : type === 'secondary' ? 'secondaryColor' : 'accentColor']: color
    });
  };

  const loadSavedTheme = (savedTheme: any) => {
    updateTheme({
      mode: savedTheme.themeData.mode,
      primaryColor: savedTheme.themeData.primaryColor,
      secondaryColor: savedTheme.themeData.secondaryColor,
      accentColor: savedTheme.themeData.accentColor
    });
    toast.success(`Theme "${savedTheme.name}" loaded!`);
  };

  const handleDeleteTheme = async (themeId: string, themeName: string) => {
    if (window.confirm(`Are you sure you want to delete the theme "${themeName}"?`)) {
      try {
        await deleteTheme(themeId);
      } catch (error) {
        console.error('Failed to delete theme:', error);
      }
    }
  };

  const exportTheme = () => {
    const themeData = {
      mode: theme.mode,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCurrentPalette = () => {
    return colorPalettes.find(palette => 
      palette.primary === theme.primaryColor &&
      palette.secondary === theme.secondaryColor &&
      palette.accent === theme.accentColor
    );
  };

  const currentPalette = getCurrentPalette();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary text-shadow-sm">Theme Customization</h1>
          <p className="text-secondary mt-2">
            Customize colors and appearance to match your brand
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowSaveModal(true)}
            icon={Save}
            variant="outline"
            className="bg-surface"
          >
            Save Theme
          </Button>
          <Button
            onClick={exportTheme}
            icon={Download}
            variant="outline"
            className="bg-surface"
          >
            Export Theme
          </Button>
        </div>
      </div>

      {/* Saved Themes */}
      {!loading && themes.length > 0 && (
        <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Saved Themes ({themes.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((savedTheme, index) => (
              <motion.div
                key={savedTheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-primary">{savedTheme.name}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => loadSavedTheme(savedTheme)}
                      className="text-muted hover:text-link transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                      title="Load theme"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTheme(savedTheme.id, savedTheme.name)}
                      className="text-muted hover:text-error transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                      title="Delete theme"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {savedTheme.description && (
                  <p className="text-sm text-secondary mb-3">{savedTheme.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: savedTheme.themeData.primaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: savedTheme.themeData.secondaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: savedTheme.themeData.accentColor }}
                    />
                  </div>
                  <span className="text-xs text-muted capitalize">
                    {savedTheme.themeData.mode} mode
                  </span>
                </div>
                
                <Button
                  onClick={() => loadSavedTheme(savedTheme)}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
                >
                  Load Theme
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Dark/Light Mode Toggle */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          Display Mode
        </h2>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => updateTheme({ mode: 'light' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
              theme.mode === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
          >
            <Sun className="w-6 h-6 text-yellow-500" />
            <div className="text-left">
              <p className="font-medium text-primary">Light Mode</p>
              <p className="text-sm text-secondary">Clean and bright interface</p>
            </div>
            {theme.mode === 'light' && <Check className="w-5 h-5 text-blue-600" />}
          </motion.button>

          <motion.button
            onClick={() => updateTheme({ mode: 'dark' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
              theme.mode === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
          >
            <Moon className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-primary">Dark Mode</p>
              <p className="text-sm text-secondary">Easy on the eyes</p>
            </div>
            {theme.mode === 'dark' && <Check className="w-5 h-5 text-blue-600" />}
          </motion.button>
        </div>
      </div>

      {/* Color Palettes */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-primary mb-6 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Color Palettes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorPalettes.map((palette, index) => (
            <motion.div
              key={palette.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                currentPalette?.id === palette.id
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
              onClick={() => applyPalette(palette)}
            >
              {/* Color Preview */}
              <div className={`w-full h-20 rounded-lg mb-3 ${palette.preview}`} />
              
              {/* Palette Info */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-primary">{palette.name}</h3>
                  <p className="text-sm text-secondary">{palette.description}</p>
                </div>
                {currentPalette?.id === palette.id && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Color Swatches */}
              <div className="flex space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: palette.primary }}
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: palette.secondary }}
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: palette.accent }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-primary mb-6 flex items-center">
          <Paintbrush className="w-5 h-5 mr-2" />
          Custom Colors
        </h2>
        
        <div className="space-y-6">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Primary Color
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => applyCustomColor(e.target.value, 'primary')}
                className="w-12 h-12 rounded-xl border-0 cursor-pointer"
              />
              <span className="text-sm font-mono text-secondary">
                {theme.primaryColor}
              </span>
            </div>
            <div className="grid grid-cols-9 gap-2">
              {customColors.map(color => (
                <button
                  key={`primary-${color}`}
                  onClick={() => applyCustomColor(color, 'primary')}
                  className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                style={{ backgroundColor: theme.secondaryColor }}
              />
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => applyCustomColor(e.target.value, 'secondary')}
                className="w-12 h-12 rounded-xl border-0 cursor-pointer"
              />
              <span className="text-sm font-mono text-secondary">
                {theme.secondaryColor}
              </span>
            </div>
            <div className="grid grid-cols-9 gap-2">
              {customColors.map(color => (
                <button
                  key={`secondary-${color}`}
                  onClick={() => applyCustomColor(color, 'secondary')}
                  className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Accent Color
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                style={{ backgroundColor: theme.accentColor }}
              />
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => applyCustomColor(e.target.value, 'accent')}
                className="w-12 h-12 rounded-xl border-0 cursor-pointer"
              />
              <span className="text-sm font-mono text-secondary">
                {theme.accentColor}
              </span>
            </div>
            <div className="grid grid-cols-9 gap-2">
              {customColors.map(color => (
                <button
                  key={`accent-${color}`}
                  onClick={() => applyCustomColor(color, 'accent')}
                  className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Theme Preview
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode('light')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                previewMode === 'light'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setPreviewMode('dark')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                previewMode === 'dark'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className={`p-6 rounded-xl border transition-all ${
          previewMode === 'dark' 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-4">
            {/* Header */}
            <div className={`p-4 rounded-lg ${previewMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-bold ${previewMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Sample Header
              </h3>
              <p className={`text-sm ${previewMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                This is how your headers will look
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button 
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Primary Button
              </button>
              <button 
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                Secondary Button
              </button>
              <button 
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: theme.accentColor }}
              >
                Accent Button
              </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${
                previewMode === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <h4 className={`font-medium ${previewMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Sample Card
                  </h4>
                </div>
                <p className={`text-sm ${previewMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  This is how your cards will appear with the current theme.
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${
                previewMode === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                  <h4 className={`font-medium ${previewMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Another Card
                  </h4>
                </div>
                <p className={`text-sm ${previewMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Cards will maintain consistent styling across your application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Actions */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          onClick={() => updateTheme({ 
            mode: 'light',
            primaryColor: '#3B82F6',
            secondaryColor: '#14B8A6',
            accentColor: '#F97316'
          })}
          variant="outline"
          className="bg-surface"
        >
          Reset to Default
        </Button>
        <Button
          onClick={() => setShowSaveModal(true)}
          icon={Sparkles}
          className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
        >
          Save Current Theme
        </Button>
      </div>

      {/* Save Theme Modal */}
      <SaveThemeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </div>
  );
};

export default Themes;