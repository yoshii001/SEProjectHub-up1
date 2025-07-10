import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Code, Eye, FileText, Tag, Layers } from 'lucide-react';
import { ComponentSample } from '../../hooks/useComponents';
import Button from '../UI/Button';

const schema = yup.object({
  name: yup.string().required('Component name is required'),
  category: yup.string().oneOf(['navigation', 'forms', 'cards', 'buttons', 'modals']).required('Category is required'),
  preview: yup.string().required('Preview description is required'),
  code: yup.string().required('Component code is required'),
});

type FormData = yup.InferType<typeof schema>;

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ComponentSample, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  component?: ComponentSample;
}

const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  component
}) => {
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: 'cards',
      preview: '',
      code: '',
    }
  });

  const watchedValues = watch();
  const watchedCode = watch('code');
  const watchedCategory = watch('category');

  useEffect(() => {
    if (isOpen) {
      if (component) {
        console.log('🔄 Editing component:', component);
        reset({
          name: component.name,
          category: component.category,
          preview: component.preview,
          code: component.code,
        });
      } else {
        console.log('🔄 Adding new component');
        reset({
          name: '',
          category: 'cards',
          preview: '',
          code: '',
        });
      }
    }
  }, [component, reset, isOpen]);

  const handleFormSubmit = async (data: FormData) => {
    console.log('🚀 Component form submitted with data:', data);
    console.log('✅ Form is valid:', isValid);
    
    setLoading(true);
    try {
      await onSubmit(data);
      console.log('✅ Component submission successful');
      onClose();
    } catch (error) {
      console.error('❌ Error submitting component form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const categories = [
    { value: 'navigation', label: 'Navigation', description: 'Headers, menus, breadcrumbs' },
    { value: 'forms', label: 'Forms', description: 'Input fields, forms, validation' },
    { value: 'cards', label: 'Cards', description: 'Content cards, hero sections' },
    { value: 'buttons', label: 'Buttons', description: 'Buttons, CTAs, actions' },
    { value: 'modals', label: 'Modals', description: 'Dialogs, popups, overlays' },
  ];

  const codeTemplates = {
    navigation: `<nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <h1 className="text-white text-xl font-bold">Brand</h1>
        </div>
        <div className="hidden md:block ml-10">
          <div className="flex items-baseline space-x-4">
            <a href="#" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
            <a href="#" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
            <a href="#" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">Services</a>
            <a href="#" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>`,
    forms: `<form className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Form</h2>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
      <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your name" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
      <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your@email.com" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
      <textarea rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your message"></textarea>
    </div>
    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
      Send Message
    </button>
  </div>
</form>`,
    cards: `<div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
  <h3 className="text-xl font-bold text-gray-900 mb-2">Feature Title</h3>
  <p className="text-gray-600">Feature description goes here. Explain the benefits and value proposition.</p>
</div>`,
    buttons: `<button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Click Me
</button>`,
    modals: `<div className="fixed inset-0 z-50 overflow-y-auto">
  <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div className="bg-white px-6 pt-6 pb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Modal Title</h3>
        <p className="text-gray-600 mb-6">Modal content goes here.</p>
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Confirm
          </button>
          <button className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`
  };

  const handleCategoryChange = (category: string) => {
    setValue('category', category as any);
    if (!watchedCode && codeTemplates[category as keyof typeof codeTemplates]) {
      setValue('code', codeTemplates[category as keyof typeof codeTemplates]);
    }
  };

  const handleUseTemplate = () => {
    if (codeTemplates[watchedCategory as keyof typeof codeTemplates]) {
      setValue('code', codeTemplates[watchedCategory as keyof typeof codeTemplates]);
    }
  };

  const renderCodePreview = () => {
    if (!watchedCode) return null;

    try {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-xs text-muted mb-2 flex items-center space-x-2">
            <Eye className="w-3 h-3" />
            <span>Live Preview:</span>
          </div>
          <div 
            className="min-h-[100px] bg-white dark:bg-gray-900 rounded border p-4 overflow-auto"
            dangerouslySetInnerHTML={{ __html: watchedCode }}
          />
        </div>
      );
    } catch (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Invalid HTML/JSX code. Please check your syntax.
          </p>
        </div>
      );
    }
  };

  const requiredFieldsFilled = watchedValues.name && 
                              watchedValues.category && 
                              watchedValues.preview && 
                              watchedValues.code;

  const isFormValid = requiredFieldsFilled && Object.keys(errors).length === 0;

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
              className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface px-6 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-primary text-shadow-sm">
                    {component ? 'Edit Component' : 'Add New Component'}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                      {/* Component Name */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Component Name *
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                          <input
                            {...register('name')}
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter component name"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-error text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Category *
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {categories.map(category => (
                            <label
                              key={category.value}
                              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                watchedCategory === category.value
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <input
                                {...register('category')}
                                type="radio"
                                value={category.value}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="sr-only"
                              />
                              <div className="flex items-center space-x-3 flex-1">
                                <Tag className="w-5 h-5 text-muted" />
                                <div>
                                  <p className="font-medium text-primary">{category.label}</p>
                                  <p className="text-sm text-secondary">{category.description}</p>
                                </div>
                              </div>
                              {watchedCategory === category.value && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </label>
                          ))}
                        </div>
                        {errors.category && (
                          <p className="text-error text-sm mt-1">{errors.category.message}</p>
                        )}
                      </div>

                      {/* Preview Description */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Preview Description *
                        </label>
                        <textarea
                          {...register('preview')}
                          rows={3}
                          className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                          placeholder="Describe what this component does and when to use it"
                        />
                        {errors.preview && (
                          <p className="text-error text-sm mt-1">{errors.preview.message}</p>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Code Section */}
                  <div className="space-y-6">
                    {/* Code Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-primary">
                          Component Code *
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handleUseTemplate}
                            className="text-xs text-link hover:text-link-hover font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                          >
                            Use Template
                          </button>
                          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setPreviewMode('edit')}
                              className={`px-3 py-1 text-xs font-medium transition-colors ${
                                previewMode === 'edit'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <Code className="w-3 h-3 inline mr-1" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewMode('preview')}
                              className={`px-3 py-1 text-xs font-medium transition-colors ${
                                previewMode === 'preview'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <Eye className="w-3 h-3 inline mr-1" />
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>

                      {previewMode === 'edit' ? (
                        <textarea
                          {...register('code')}
                          rows={12}
                          className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors font-mono text-sm"
                          placeholder="Enter your HTML/JSX code here..."
                        />
                      ) : (
                        <div className="h-80 overflow-auto">
                          {renderCodePreview()}
                        </div>
                      )}
                      
                      {errors.code && (
                        <p className="text-error text-sm mt-1">{errors.code.message}</p>
                      )}
                    </div>

                    {/* Form Status */}
                    <div className="text-xs text-muted p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className={`flex items-center space-x-1 ${isFormValid ? 'text-success' : 'text-error'}`}>
                          <div className={`w-2 h-2 rounded-full ${isFormValid ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          <span>Form {isFormValid ? 'Valid' : 'Invalid'}</span>
                        </span>
                        <span>Required Fields: {Object.keys(watchedValues).filter(key => 
                          ['name', 'category', 'preview', 'code'].includes(key) && 
                          watchedValues[key as keyof FormData]
                        ).length}/4</span>
                        <span>Errors: {Object.keys(errors).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                <Button
                  type="submit"
                  onClick={handleSubmit(handleFormSubmit)}
                  loading={loading}
                  disabled={!isFormValid || loading}
                  className={`w-full sm:w-auto transition-all duration-200 ${
                    isFormValid && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-shadow-sm'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    component ? 'Update Component' : 'Add Component'
                  )}
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

export default ComponentModal;