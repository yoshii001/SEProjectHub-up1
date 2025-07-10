import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Search, 
  Filter, 
  Eye, 
  Code, 
  Copy, 
  Check,
  Navigation,
  Square,
  CreditCard,
  MousePointer,
  Box,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useComponents, ComponentSample } from '../hooks/useComponents';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import ComponentModal from '../components/Components/ComponentModal';

const Components: React.FC = () => {
  const { components, loading, addComponent, updateComponent, deleteComponent } = useComponents();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentSample | null>(null);

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Components', icon: Layers },
    { value: 'navigation', label: 'Navigation', icon: Navigation },
    { value: 'forms', label: 'Forms', icon: Square },
    { value: 'cards', label: 'Cards', icon: CreditCard },
    { value: 'buttons', label: 'Buttons', icon: MousePointer },
    { value: 'modals', label: 'Modals', icon: Box },
  ];

  const handleToggleSelection = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleCopyCode = async (code: string, componentId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(componentId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleAddComponent = async (componentData: Omit<ComponentSample, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      console.log('🚀 Adding new component:', componentData);
      await addComponent(componentData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add component:', error);
    }
  };

  const handleUpdateComponent = async (componentData: Omit<ComponentSample, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!editingComponent) return;
    
    try {
      console.log('✏️ Updating component:', editingComponent.id);
      await updateComponent(editingComponent.id, componentData);
      setEditingComponent(null);
    } catch (error) {
      console.error('Failed to update component:', error);
    }
  };

  const handleDeleteComponent = async (componentId: string, componentName: string) => {
    if (window.confirm(`Are you sure you want to delete "${componentName}"? This action cannot be undone.`)) {
      try {
        await deleteComponent(componentId);
      } catch (error) {
        console.error('Failed to delete component:', error);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryItem = categories.find(cat => cat.value === category);
    return categoryItem?.icon || Layers;
  };

  const renderComponentPreview = (component: ComponentSample) => {
    const CategoryIcon = getCategoryIcon(component.category);
    
    return (
      <div className="min-h-[120px] flex items-center justify-center">
        {component.category === 'navigation' && (
          <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Brand</span>
              <div className="hidden md:flex space-x-4">
                <span className="text-white text-sm">Home</span>
                <span className="text-white text-sm">About</span>
                <span className="text-white text-sm">Services</span>
              </div>
            </div>
          </div>
        )}
        
        {component.category === 'cards' && component.name.includes('Hero') && (
          <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold text-primary mb-2">Build Amazing Websites</h3>
            <p className="text-sm text-secondary mb-4">Create stunning, responsive websites</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm">
              Get Started
            </button>
          </div>
        )}
        
        {component.category === 'cards' && component.name.includes('Feature') && (
          <div className="w-full bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
            </div>
            <h4 className="font-bold text-primary text-sm mb-2">Fast Performance</h4>
            <p className="text-xs text-secondary">Lightning-fast loading times and optimized performance.</p>
          </div>
        )}
        
        {component.category === 'forms' && (
          <div className="w-full bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-primary text-sm mb-3">Get in Touch</h4>
            <div className="space-y-2">
              <input type="text" placeholder="Your name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-xs bg-gray-50 dark:bg-gray-700" />
              <input type="email" placeholder="your@email.com" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-xs bg-gray-50 dark:bg-gray-700" />
              <button className="w-full bg-blue-600 text-white py-2 rounded text-xs">Send Message</button>
            </div>
          </div>
        )}
        
        {component.category === 'buttons' && (
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            Click Me
          </button>
        )}
        
        {component.category === 'modals' && (
          <div className="w-full bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <h4 className="font-bold text-primary text-sm mb-2">Confirm Action</h4>
            <p className="text-xs text-secondary mb-3">Are you sure you want to proceed?</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs">Confirm</button>
              <button className="flex-1 bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs">Cancel</button>
            </div>
          </div>
        )}
        
        {/* Fallback for unknown categories */}
        {!['navigation', 'cards', 'forms', 'buttons', 'modals'].includes(component.category) && (
          <div className="w-full bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <CategoryIcon className="w-8 h-8 text-muted" />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary text-shadow-sm">Component Gallery</h1>
          <p className="text-secondary mt-2">
            Browse and manage UI components for your client projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-muted">
            {selectedComponents.length} selected
          </div>
          {currentUser && (
            <Button
              onClick={() => setShowAddModal(true)}
              icon={Plus}
              className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
            >
              Add Component
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Components</p>
              <p className="text-xl font-bold text-primary">{components.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Selected</p>
              <p className="text-xl font-bold text-primary">{selectedComponents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Categories</p>
              <p className="text-xl font-bold text-primary">
                {new Set(components.map(c => c.category)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Filtered</p>
              <p className="text-xl font-bold text-primary">{filteredComponents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedCategory === category.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'bg-gray-100 text-secondary hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredComponents.map((component, index) => {
          const CategoryIcon = getCategoryIcon(component.category);
          const isSelected = selectedComponents.includes(component.id);
          const isOwner = currentUser && component.userId === currentUser.id;
          
          return (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-surface rounded-xl shadow-lg border-2 transition-all duration-300 overflow-hidden ${
                isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-xl'
              }`}
            >
              {/* Component Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">
                        {component.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 capitalize">
                        {component.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isOwner && (
                      <>
                        <button
                          onClick={() => setEditingComponent(component)}
                          className="p-2 text-muted hover:text-link transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                          aria-label="Edit component"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComponent(component.id, component.name)}
                          className="p-2 text-muted hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                          aria-label="Delete component"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleToggleSelection(component.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-secondary text-sm">
                  {component.preview}
                </p>
                {component.userId && (
                  <p className="text-xs text-muted mt-2">
                    Created by: {isOwner ? 'You' : 'Another user'}
                  </p>
                )}
              </div>

              {/* Component Visual Preview */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                <div className="bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="text-xs text-muted mb-2 flex items-center space-x-2">
                    <Eye className="w-3 h-3" />
                    <span>Live Preview:</span>
                  </div>
                  
                  {renderComponentPreview(component)}
                </div>

                {/* Code Section - Hidden by default, can be toggled */}
                <details className="bg-gray-900 rounded-lg">
                  <summary className="p-3 cursor-pointer text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="w-3 h-3" />
                      <span>View Code</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCopyCode(component.code, component.id);
                      }}
                      className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                    >
                      {copiedCode === component.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </summary>
                  <div className="p-3 pt-0">
                    <pre className="text-xs text-gray-300 overflow-x-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                      <code>{component.code}</code>
                    </pre>
                  </div>
                </details>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-primary">
              No components found
            </h3>
            <p className="text-secondary max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria to find the components you\'re looking for.'
                : 'Components will be loaded from the Firebase database.'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <div className="text-sm text-muted mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-md mx-auto">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  📡 Loading from Firebase Database
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Components are now loaded from: <br />
                  <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                    https://seprojecthub-default-rtdb.firebaseio.com/components
                  </code>
                </p>
              </div>
            )}
            {currentUser && (
              <Button
                onClick={() => setShowAddModal(true)}
                icon={Plus}
                className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
              >
                Add Your First Component
              </Button>
            )}
          </motion.div>
        </div>
      )}

      {/* Selected Components Summary */}
      {selectedComponents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-surface p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-primary">
                {selectedComponents.length} components selected
              </p>
              <p className="text-sm text-secondary">
                Ready to share with clients
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ComponentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddComponent}
        />
      )}

      {editingComponent && (
        <ComponentModal
          isOpen={!!editingComponent}
          onClose={() => setEditingComponent(null)}
          onSubmit={handleUpdateComponent}
          component={editingComponent}
        />
      )}
    </div>
  );
};

export default Components;