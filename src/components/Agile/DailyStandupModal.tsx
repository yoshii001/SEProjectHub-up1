import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Calendar, Clock, AlertTriangle, CheckCircle, Smile, Frown, Meh } from 'lucide-react';
import { DailyStandup } from '../../types/agile';
import Button from '../UI/Button';

const schema = yup.object({
  yesterday: yup.string().required('Yesterday\'s work is required'),
  today: yup.string().required('Today\'s plan is required'),
  blockers: yup.string(),
  mood: yup.string().oneOf(['great', 'good', 'okay', 'struggling', 'blocked']).required()
});

type FormData = yup.InferType<typeof schema>;

interface DailyStandupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DailyStandup, 'id'>) => void;
  userId: string;
  sprintId: string;
}

const DailyStandupModal: React.FC<DailyStandupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  sprintId
}) => {
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
      yesterday: '',
      today: '',
      blockers: '',
      mood: 'good'
    }
  });

  const watchedMood = watch('mood');

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const standupData = {
        ...data,
        userId,
        sprintId,
        date: new Date()
      };
      
      await onSubmit(standupData);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save daily standup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const moodOptions = [
    { value: 'great', label: 'Great', icon: Smile, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { value: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { value: 'struggling', label: 'Struggling', icon: Frown, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { value: 'blocked', label: 'Blocked', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' }
  ];

  const getMoodOption = (mood: string) => {
    return moodOptions.find(option => option.value === mood) || moodOptions[1];
  };

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
              className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface px-6 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-primary flex items-center">
                    <Calendar className="w-6 h-6 mr-2" />
                    Daily Standup
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-muted hover:text-secondary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Yesterday */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      What did you accomplish yesterday? *
                    </label>
                    <textarea
                      {...register('yesterday')}
                      rows={3}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Describe what you completed yesterday..."
                    />
                    {errors.yesterday && (
                      <p className="text-error text-sm mt-1">{errors.yesterday.message}</p>
                    )}
                  </div>

                  {/* Today */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      What will you work on today? *
                    </label>
                    <textarea
                      {...register('today')}
                      rows={3}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Describe your plan for today..."
                    />
                    {errors.today && (
                      <p className="text-error text-sm mt-1">{errors.today.message}</p>
                    )}
                  </div>

                  {/* Blockers */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                      Any blockers or impediments?
                    </label>
                    <textarea
                      {...register('blockers')}
                      rows={2}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Describe any blockers or leave empty if none..."
                    />
                  </div>

                  {/* Mood */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-3">
                      How are you feeling today? *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {moodOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = watchedMood === option.value;
                        
                        return (
                          <label
                            key={option.value}
                            className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? `${option.bg} border-current ${option.color}`
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            <input
                              {...register('mood')}
                              type="radio"
                              value={option.value}
                              className="sr-only"
                            />
                            <Icon className={`w-6 h-6 mb-1 ${isSelected ? option.color : 'text-muted'}`} />
                            <span className={`text-xs font-medium ${isSelected ? option.color : 'text-muted'}`}>
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.mood && (
                      <p className="text-error text-sm mt-1">{errors.mood.message}</p>
                    )}
                  </div>

                  {/* Mood Preview */}
                  {watchedMood && (
                    <div className={`p-3 rounded-lg ${getMoodOption(watchedMood).bg}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-secondary">Current mood:</span>
                        <span className={`font-medium ${getMoodOption(watchedMood).color}`}>
                          {getMoodOption(watchedMood).label}
                        </span>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                <Button
                  type="submit"
                  onClick={handleSubmit(handleFormSubmit)}
                  loading={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Saving...' : 'Submit Standup'}
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

export default DailyStandupModal;