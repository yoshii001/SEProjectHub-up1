import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Calendar, DollarSign, User, FileText, Flag, BarChart3, Palette } from 'lucide-react';
import { Project, Client } from '../../types';
import Button from '../UI/Button';
import ThemeSelector from '../Themes/ThemeSelector';

const schema = yup.object({
  title: yup.string().required('Project title is required'),
  description: yup.string().required('Description is required'),
  clientId: yup.string().required('Client is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
  budget: yup.number().min(0, 'Budget must be positive').required('Budget is required'),
  status: yup.string().oneOf(['planning', 'in-progress', 'review', 'completed', 'cancelled']).required(),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required(),
  progress: yup.number().min(0).max(100).required('Progress is required'),
});

type FormData = yup.InferType<typeof schema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, themeIds?: string[]) => void;
  project?: Project;
  clients: Client[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  clients
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      clientId: '',
      startDate: '',
      endDate: '',
      budget: 0,
      status: 'planning',
      priority: 'medium',
      progress: 0,
    }
  });

  const watchedProgress = watch('progress', 0);
  const watchedValues = watch();

  useEffect(() => {
    if (isOpen) {
      if (project) {
        console.log('🔄 Editing project:', project);
        reset({
          title: project.title,
          description: project.description,
          clientId: project.clientId,
          startDate: new Date(project.startDate).toISOString().slice(0, 16),
          endDate: new Date(project.endDate).toISOString().slice(0, 16),
          budget: project.budget,
          status: project.status,
          priority: project.priority,
          progress: project.progress,
        });
        // Set theme IDs if they exist
        setSelectedThemeIds(project.themeIds || []);
      } else {
        console.log('🔄 Adding new project');
        reset({
          title: '',
          description: '',
          clientId: '',
          startDate: '',
          endDate: '',
          budget: 0,
          status: 'planning',
          priority: 'medium',
          progress: 0,
        });
        setSelectedThemeIds([]);
      }
    }
  }, [project, reset, isOpen]);

  const handleFormSubmit = async (data: FormData) => {
    console.log('🚀 Project form submitted with data:', data);
    console.log('🎨 Selected themes:', selectedThemeIds);
    
    // Validate that at least one theme is selected
    if (selectedThemeIds.length === 0) {
      console.error('❌ No themes selected');
      return;
    }
    
    setLoading(true);
    try {
      const projectData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        themeIds: selectedThemeIds, // Include theme IDs in project data
      };
      
      console.log('📤 Submitting project data:', projectData);
      await onSubmit(projectData, selectedThemeIds);
      console.log('✅ Project submission successful');
      onClose();
    } catch (error) {
      console.error('❌ Error submitting project form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  // Check if all required fields are filled including themes
  const requiredFieldsFilled = watchedValues.title && 
                              watchedValues.description && 
                              watchedValues.clientId && 
                              watchedValues.startDate && 
                              watchedValues.endDate && 
                              watchedValues.budget !== undefined && 
                              watchedValues.status && 
                              watchedValues.priority && 
                              watchedValues.progress !== undefined &&
                              selectedThemeIds.length > 0;

  const isFormValid = requiredFieldsFilled && Object.keys(errors).length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop - separate from modal content */}
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
              className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface px-6 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-primary text-shadow-sm">
                    {project ? 'Edit Project' : 'Create New Project'}
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

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Project Title *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                      <input
                        {...register('title')}
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter project title"
                      />
                    </div>
                    {errors.title && (
                      <p className="text-error text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Describe the project goals and requirements"
                    />
                    {errors.description && (
                      <p className="text-error text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Client Selection */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Client *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                      <select
                        {...register('clientId')}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                      >
                        <option value="" className="text-muted">Select a client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id} className="text-primary">
                            {client.name} - {client.company}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.clientId && (
                      <p className="text-error text-sm mt-1">{errors.clientId.message}</p>
                    )}
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      <Palette className="w-4 h-4 inline mr-1" />
                      Themes *
                    </label>
                    <ThemeSelector
                      selectedThemeIds={selectedThemeIds}
                      onThemeChange={setSelectedThemeIds}
                      placeholder="Select themes for this project..."
                      multiple={true}
                      required={true}
                    />
                    <p className="text-xs text-muted mt-1">
                      Select one or more themes to apply to this project
                    </p>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Start Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <input
                          {...register('startDate')}
                          type="datetime-local"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      {errors.startDate && (
                        <p className="text-error text-sm mt-1">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        End Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <input
                          {...register('endDate')}
                          type="datetime-local"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      {errors.endDate && (
                        <p className="text-error text-sm mt-1">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Budget *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                      <input
                        {...register('budget', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="100"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="0"
                      />
                    </div>
                    {errors.budget && (
                      <p className="text-error text-sm mt-1">{errors.budget.message}</p>
                    )}
                  </div>

                  {/* Status and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Status *
                      </label>
                      <select
                        {...register('status')}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value} className="text-primary">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.status && (
                        <p className="text-error text-sm mt-1">{errors.status.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Priority *
                      </label>
                      <div className="relative">
                        <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <select
                          {...register('priority')}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                        >
                          {priorityOptions.map(option => (
                            <option key={option.value} value={option.value} className="text-primary">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.priority && (
                        <p className="text-error text-sm mt-1">{errors.priority.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Progress ({watchedProgress}%) *
                    </label>
                    <div className="space-y-2">
                      <input
                        {...register('progress', { valueAsNumber: true })}
                        type="range"
                        min="0"
                        max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-thumb"
                      />
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${watchedProgress}%` }}
                        />
                      </div>
                    </div>
                    {errors.progress && (
                      <p className="text-error text-sm mt-1">{errors.progress.message}</p>
                    )}
                  </div>

                  {/* Form Status Indicator */}
                  <div className="text-xs text-muted p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center space-x-1 ${isFormValid ? 'text-success' : 'text-error'}`}>
                        <div className={`w-2 h-2 rounded-full ${isFormValid ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span>Form {isFormValid ? 'Valid' : 'Invalid'}</span>
                      </span>
                      <span>Themes: {selectedThemeIds.length}</span>
                      <span>Errors: {Object.keys(errors).length}</span>
                    </div>
                  </div>
                </form>
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
                    project ? 'Update Project' : 'Create Project'
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

export default ProjectModal;