import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Plus, Trash2, User, Target, Lightbulb } from 'lucide-react';
import { UserStory, Epic } from '../../types/agile';
import Button from '../UI/Button';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  asA: yup.string().required('User role is required'),
  iWant: yup.string().required('User want is required'),
  soThat: yup.string().required('User goal is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'critical']).required(),
  epicId: yup.string(),
  storyPoints: yup.number().min(1).max(100).required('Story points are required')
});

type FormData = yup.InferType<typeof schema>;

interface UserStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'estimationVotes' | 'tasks'>) => void;
  story?: UserStory;
  epics: Epic[];
  projectId: string;
}

const UserStoryModal: React.FC<UserStoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  story,
  epics,
  projectId
}) => {
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      asA: '',
      iWant: '',
      soThat: '',
      description: '',
      priority: 'medium',
      epicId: '',
      storyPoints: 1
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isOpen) {
      if (story) {
        reset({
          title: story.title,
          asA: story.asA,
          iWant: story.iWant,
          soThat: story.soThat,
          description: story.description,
          priority: story.priority,
          epicId: story.epicId || '',
          storyPoints: story.storyPoints
        });
        setAcceptanceCriteria(story.acceptanceCriteria.length > 0 ? story.acceptanceCriteria : ['']);
      } else {
        reset({
          title: '',
          asA: '',
          iWant: '',
          soThat: '',
          description: '',
          priority: 'medium',
          epicId: '',
          storyPoints: 1
        });
        setAcceptanceCriteria(['']);
      }
    }
  }, [story, reset, isOpen]);

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const storyData = {
        ...data,
        projectId,
        acceptanceCriteria: acceptanceCriteria.filter(criteria => criteria.trim() !== ''),
        epicId: data.epicId || undefined
      };
      
      await onSubmit(storyData);
      onClose();
    } catch (error) {
      console.error('Failed to save user story:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAcceptanceCriteria = () => {
    setAcceptanceCriteria([...acceptanceCriteria, '']);
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    const updated = [...acceptanceCriteria];
    updated[index] = value;
    setAcceptanceCriteria(updated);
  };

  const removeAcceptanceCriteria = (index: number) => {
    if (acceptanceCriteria.length > 1) {
      setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
            onClick={handleBackdropClick}
          />
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface px-6 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-primary">
                    {story ? 'Edit User Story' : 'Create User Story'}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-muted hover:text-secondary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Story Title */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Story Title *
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter story title"
                    />
                    {errors.title && (
                      <p className="text-error text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* User Story Format */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      User Story Format
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          As a... *
                        </label>
                        <input
                          {...register('asA')}
                          type="text"
                          className="block w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-blue-900/30 text-primary placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="user, admin, customer, etc."
                        />
                        {errors.asA && (
                          <p className="text-red-600 text-sm mt-1">{errors.asA.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          I want... *
                        </label>
                        <input
                          {...register('iWant')}
                          type="text"
                          className="block w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-blue-900/30 text-primary placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="to be able to..."
                        />
                        {errors.iWant && (
                          <p className="text-red-600 text-sm mt-1">{errors.iWant.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          So that... *
                        </label>
                        <input
                          {...register('soThat')}
                          type="text"
                          className="block w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-blue-900/30 text-primary placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="I can achieve..."
                        />
                        {errors.soThat && (
                          <p className="text-red-600 text-sm mt-1">{errors.soThat.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    {(watchedValues.asA || watchedValues.iWant || watchedValues.soThat) && (
                      <div className="mt-4 p-3 bg-white dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Preview:</strong> As a <em>{watchedValues.asA || '[user]'}</em>, 
                          I want <em>{watchedValues.iWant || '[feature]'}</em> so that <em>{watchedValues.soThat || '[benefit]'}</em>.
                        </p>
                      </div>
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
                      placeholder="Provide additional details about this user story"
                    />
                    {errors.description && (
                      <p className="text-error text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Epic and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Epic (Optional)
                      </label>
                      <select
                        {...register('epicId')}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                      >
                        <option value="">No Epic</option>
                        {epics.map(epic => (
                          <option key={epic.id} value={epic.id}>
                            {epic.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Priority *
                      </label>
                      <select
                        {...register('priority')}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.priority && (
                        <p className="text-error text-sm mt-1">{errors.priority.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Story Points */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Story Points *
                    </label>
                    <input
                      {...register('storyPoints', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="100"
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="1"
                    />
                    {errors.storyPoints && (
                      <p className="text-error text-sm mt-1">{errors.storyPoints.message}</p>
                    )}
                  </div>

                  {/* Acceptance Criteria */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-primary">
                        Acceptance Criteria
                      </label>
                      <Button
                        type="button"
                        onClick={addAcceptanceCriteria}
                        size="sm"
                        icon={Plus}
                        variant="outline"
                      >
                        Add Criteria
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {acceptanceCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={criteria}
                              onChange={(e) => updateAcceptanceCriteria(index, e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder={`Acceptance criteria ${index + 1}`}
                            />
                          </div>
                          {acceptanceCriteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAcceptanceCriteria(index)}
                              className="p-2 text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                <Button
                  type="submit"
                  onClick={handleSubmit(handleFormSubmit)}
                  loading={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Saving...' : (story ? 'Update Story' : 'Create Story')}
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

export default UserStoryModal;