import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, User, Flag, BarChart3, Clock, Palette, Layers, CheckCircle } from 'lucide-react';
import { Project, Client } from '../../types';
import { useThemes } from '../../hooks/useThemes';
import { useCurrency } from '../../hooks/useCurrency';
import { format } from 'date-fns';
import Button from '../UI/Button';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  client?: Client;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  client
}) => {
  const { formatCurrency } = useCurrency();
  const { themes } = useThemes();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/50 dark:text-gray-400';
    }
  };

  // Get assigned themes for this project
  const assignedThemes = themes.filter(theme => 
    project.themeIds && project.themeIds.includes(theme.id)
  );

  // Mock data for components (in a real app, this would come from the database)
  const selectedComponents = [
    'Modern Navigation Bar',
    'Hero Section with CTA',
    'Contact Form',
    'Feature Cards'
  ];

  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

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
                    Project Details
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

                <div className="space-y-8">
                  {/* Project Overview */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-4">Project Overview</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-bold text-xl text-primary mb-2">{project.title}</h5>
                          <p className="text-secondary mb-4">{project.description}</p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted" />
                              <span className="text-sm text-secondary">
                                Client: {client?.name || 'Unknown Client'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted" />
                              <span className="text-sm text-secondary">
                                {format(new Date(project.startDate), 'MMM dd, yyyy')} - {format(new Date(project.endDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-muted" />
                              <span className="text-sm text-secondary">
                                Budget: {formatCurrency(project.budget)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Status */}
                          <div>
                            <label className="text-sm font-medium text-muted">Status</label>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                {project.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Priority */}
                          <div>
                            <label className="text-sm font-medium text-muted">Priority</label>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getPriorityColor(project.priority)}`}>
                                <Flag className="w-3 h-3 mr-1" />
                                {project.priority} Priority
                              </span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div>
                            <label className="text-sm font-medium text-muted">Progress</label>
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-secondary">{project.progress}%</span>
                                <span className="text-xs text-muted">{daysLeft} days left</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Applied Themes */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Applied Themes ({assignedThemes.length})
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      {assignedThemes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assignedThemes.map((theme) => (
                            <div
                              key={theme.id}
                              className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500"
                            >
                              <div className="flex space-x-1">
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                  style={{ backgroundColor: theme.themeData.primaryColor }}
                                />
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                  style={{ backgroundColor: theme.themeData.secondaryColor }}
                                />
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                  style={{ backgroundColor: theme.themeData.accentColor }}
                                />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-primary">{theme.name}</h5>
                                <p className="text-sm text-secondary">{theme.description}</p>
                                <p className="text-xs text-muted capitalize">
                                  {theme.themeData.mode} mode
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Palette className="w-12 h-12 text-muted mx-auto mb-4" />
                          <p className="text-muted">No themes assigned to this project</p>
                          <p className="text-sm text-muted mt-1">Edit the project to assign themes</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Components */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                      <Layers className="w-5 h-5 mr-2" />
                      Selected Components
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      {selectedComponents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedComponents.map((component, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-primary font-medium">{component}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Layers className="w-12 h-12 text-muted mx-auto mb-4" />
                          <p className="text-muted">No components selected yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Timeline */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Project Timeline
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">Project Started</p>
                            <p className="text-xs text-muted">{format(new Date(project.startDate), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${project.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">In Progress</p>
                            <p className="text-xs text-muted">{project.progress}% completed</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${project.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">Project Deadline</p>
                            <p className="text-xs text-muted">{format(new Date(project.endDate), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end">
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;