import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Calendar, Clock, User, Video, FileText, Briefcase } from 'lucide-react';
import { Meeting, Client, Project } from '../../types';
import Button from '../UI/Button';

const schema = yup.object({
  title: yup.string().required('Meeting title is required'),
  description: yup.string().required('Description is required'),
  clientId: yup.string().required('Client is required'),
  projectId: yup.string(),
  date: yup.string().required('Date is required'),
  duration: yup.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours').required('Duration is required'),
  meetingUrl: yup.string().url('Must be a valid URL'),
  notes: yup.string(),
  status: yup.string().oneOf(['scheduled', 'completed', 'cancelled']).required(),
});

type FormData = yup.InferType<typeof schema>;

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  meeting?: Meeting;
  clients: Client[];
  projects: Project[];
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  meeting,
  clients,
  projects
}) => {
  const [loading, setLoading] = useState(false);

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
      projectId: '',
      date: '',
      duration: 60,
      meetingUrl: '',
      notes: '',
      status: 'scheduled',
    }
  });

  const watchedValues = watch();
  const watchedClientId = watch('clientId');

  // Filter projects based on selected client
  const clientProjects = projects.filter(project => project.clientId === watchedClientId);

  useEffect(() => {
    if (isOpen) {
      if (meeting) {
        console.log('🔄 Editing meeting:', meeting);
        reset({
          title: meeting.title,
          description: meeting.description,
          clientId: meeting.clientId,
          projectId: meeting.projectId || '',
          date: new Date(meeting.date).toISOString().slice(0, 16),
          duration: meeting.duration,
          meetingUrl: meeting.meetingUrl || '',
          notes: meeting.notes || '',
          status: meeting.status,
        });
      } else {
        console.log('🔄 Adding new meeting');
        reset({
          title: '',
          description: '',
          clientId: '',
          projectId: '',
          date: '',
          duration: 60,
          meetingUrl: '',
          notes: '',
          status: 'scheduled',
        });
      }
    }
  }, [meeting, reset, isOpen]);

  const handleFormSubmit = async (data: FormData) => {
    console.log('🚀 Meeting form submitted with data:', data);
    console.log('✅ Form is valid:', isValid);
    
    setLoading(true);
    try {
      const meetingData = {
        ...data,
        date: new Date(data.date),
        projectId: data.projectId || null,
        meetingUrl: data.meetingUrl || null,
        notes: data.notes || null,
      };
      
      await onSubmit(meetingData);
      console.log('✅ Meeting submission successful');
      onClose();
    } catch (error) {
      console.error('❌ Error submitting meeting form:', error);
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
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Check if required fields are filled
  const requiredFieldsFilled = watchedValues.title && 
                              watchedValues.description && 
                              watchedValues.clientId && 
                              watchedValues.date && 
                              watchedValues.duration && 
                              watchedValues.status;

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
                    {meeting ? 'Edit Meeting' : 'Schedule New Meeting'}
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
                  {/* Meeting Title */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Meeting Title *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                      <input
                        {...register('title')}
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter meeting title"
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
                      rows={3}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Describe the meeting agenda and objectives"
                    />
                    {errors.description && (
                      <p className="text-error text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Client and Project Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Project (Optional)
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <select
                          {...register('projectId')}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                        >
                          <option value="" className="text-muted">Select a project (optional)</option>
                          {clientProjects.map(project => (
                            <option key={project.id} value={project.id} className="text-primary">
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Date and Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Date & Time *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <input
                          {...register('date')}
                          type="datetime-local"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      {errors.date && (
                        <p className="text-error text-sm mt-1">{errors.date.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Duration (minutes) *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <input
                          {...register('duration', { valueAsNumber: true })}
                          type="number"
                          min="15"
                          max="480"
                          step="15"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="60"
                        />
                      </div>
                      {errors.duration && (
                        <p className="text-error text-sm mt-1">{errors.duration.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Meeting URL */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Meeting URL (Optional)
                    </label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                      <input
                        {...register('meetingUrl')}
                        type="url"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                    {errors.meetingUrl && (
                      <p className="text-error text-sm mt-1">{errors.meetingUrl.message}</p>
                    )}
                  </div>

                  {/* Status */}
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

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Add meeting notes, agenda items, or important points to discuss..."
                    />
                  </div>

                  {/* Form Status Indicator */}
                  <div className="text-xs text-muted p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-4">
                      <span className={`flex items-center space-x-1 ${isFormValid ? 'text-success' : 'text-error'}`}>
                        <div className={`w-2 h-2 rounded-full ${isFormValid ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span>Form {isFormValid ? 'Valid' : 'Invalid'}</span>
                      </span>
                      <span>Required Fields: {Object.keys(watchedValues).filter(key => 
                        ['title', 'description', 'clientId', 'date', 'duration', 'status'].includes(key) && 
                        watchedValues[key as keyof FormData]
                      ).length}/6</span>
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
                    meeting ? 'Update Meeting' : 'Schedule Meeting'
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

export default MeetingModal;