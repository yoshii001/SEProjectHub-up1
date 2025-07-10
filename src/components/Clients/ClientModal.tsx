import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, User, Mail, Phone, Building, Tag, CheckCircle } from 'lucide-react';
import { Client } from '../../types';
import Button from '../UI/Button';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  company: yup.string().required('Company is required'),
  category: yup.string().required('Category is required'),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
});

type FormData = yup.InferType<typeof schema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  client?: Client;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  client
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
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      category: '',
      status: 'active',
    }
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (isOpen) {
      reset(client ? {
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        category: client.category,
        status: client.status,
      } : {
        name: '',
        email: '',
        phone: '',
        company: '',
        category: '',
        status: 'active',
      });
    }
  }, [client, reset, isOpen]);

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('❌ Error submitting form:', error);
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

  const categories = [
    'Web Development', 'Mobile App', 'E-commerce',
    'Consulting', 'UI/UX Design', 'Digital Marketing', 'Other'
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

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
              className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface px-6 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-primary text-shadow-sm">
                    {client ? 'Edit Client' : 'Add New Client'}
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
                  {/* Input Fields */}
                  {[
                    { name: 'name', label: 'Full Name', Icon: User, type: 'text', placeholder: 'Enter client name' },
                    { name: 'email', label: 'Email Address', Icon: Mail, type: 'email', placeholder: 'Enter email address' },
                    { name: 'phone', label: 'Phone Number', Icon: Phone, type: 'tel', placeholder: 'Enter phone number' },
                    { name: 'company', label: 'Company', Icon: Building, type: 'text', placeholder: 'Enter company name' }
                  ].map(({ name, label, Icon, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-primary mb-2">
                        {label} *
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <input
                          {...register(name as keyof FormData)}
                          type={type}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                     bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                     transition-colors"
                          placeholder={placeholder}
                        />
                      </div>
                      {errors[name as keyof FormData] && (
                        <p className="text-error text-sm mt-1">
                          {errors[name as keyof FormData]?.message}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                      <select
                        {...register('category')}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-gray-50 dark:bg-gray-800 text-primary
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                   appearance-none transition-colors"
                      >
                        <option value="" className="text-muted">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category} className="text-primary">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.category && (
                      <p className="text-error text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Status *
                    </label>
                    <div className="relative">
                      <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                      <select
                        {...register('status')}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-gray-50 dark:bg-gray-800 text-primary
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                   appearance-none transition-colors"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value} className="text-primary">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.status && (
                      <p className="text-error text-sm mt-1">{errors.status.message}</p>
                    )}
                  </div>

                  {/* Status Preview */}
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-secondary">Status Preview:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      watchedStatus === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {watchedStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                <Button
                  type="submit"
                  onClick={handleSubmit(handleFormSubmit)}
                  loading={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    client ? 'Update Client' : 'Add Client'
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