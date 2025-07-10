import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Send, 
  CheckCircle, 
  AlertCircle,
  User,
  Building,
  Target,
  Palette,
  Code,
  Calendar,
  DollarSign,
  Layers,
  Settings
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../components/UI/Button';
import { downloadReportAsPDF, downloadReportAsHTML } from '../utils/reportGenerator';
import { toast } from 'react-toastify';

// Form validation schema
const schema = yup.object({
  // Client Information
  clientName: yup.string().required('Client name is required'),
  clientCompany: yup.string().required('Company name is required'),
  clientEmail: yup.string().email('Invalid email').required('Email is required'),
  clientPhone: yup.string().required('Phone number is required'),
  
  // Project Overview
  projectTitle: yup.string().required('Project title is required'),
  problemToSolve: yup.string().required('Problem statement is required'),
  projectDescription: yup.string().required('Project description is required'),
  targetUsers: yup.string().required('Target users description is required'),
  projectGoals: yup.string().required('Project goals are required'),
  
  // Core Features
  coreFeatures: yup.array().of(yup.string()).min(1, 'At least one core feature is required'),
  
  // Data Requirements
  dataFields: yup.array().of(yup.string()).min(1, 'At least one data field is required'),
  adminAccess: yup.string().required('Admin access requirements are required'),
  fileUploads: yup.string().required('File upload requirements are required'),
  
  // UI/UX Preferences
  designInspiration: yup.string().required('Design inspiration is required'),
  themeMode: yup.string().required('Theme mode preference is required'),
  animations: yup.string().required('Animation preference is required'),
  mustHaveComponents: yup.array().of(yup.string()).min(1, 'At least one component is required'),
  
  // Technical Details
  hosting: yup.string().required('Hosting preference is required'),
  database: yup.string().required('Database preference is required'),
  adminDashboard: yup.boolean(),
  payments: yup.boolean(),
  paymentGateway: yup.string().when('payments', {
    is: true,
    then: (schema) => schema.required('Payment gateway is required when payments are enabled'),
    otherwise: (schema) => schema.notRequired()
  }),
  
  // Timeline & Budget
  deadline: yup.string().required('Project deadline is required'),
  budget: yup.string().required('Budget range is required'),
  mvpFirst: yup.boolean(),
  
  // Project Phases
  phases: yup.array().of(
    yup.object({
      name: yup.string().required(),
      duration: yup.string().required()
    })
  ).min(1, 'At least one project phase is required')
});

type FormData = yup.InferType<typeof schema>;

const Requirements: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [coreFeatures, setCoreFeatures] = useState<string[]>(['']);
  const [dataFields, setDataFields] = useState<string[]>(['']);
  const [mustHaveComponents, setMustHaveComponents] = useState<string[]>(['']);
  const [phases, setPhases] = useState([
    { name: 'Requirement Analysis', duration: '1-2 weeks' },
    { name: 'UI/UX Design', duration: '2-3 weeks' },
    { name: 'Development', duration: '4-8 weeks' },
    { name: 'Testing', duration: '1-2 weeks' },
    { name: 'Deployment', duration: '1 week' }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      adminDashboard: false,
      payments: false,
      mvpFirst: true,
      coreFeatures: [''],
      dataFields: [''],
      mustHaveComponents: [''],
      phases: phases
    }
  });

  const watchedPayments = watch('payments');
  const totalSteps = 7;

  const steps = [
    { id: 1, title: 'Client Info', icon: User },
    { id: 2, title: 'Project Overview', icon: Target },
    { id: 3, title: 'Core Features', icon: CheckCircle },
    { id: 4, title: 'Data Requirements', icon: FileText },
    { id: 5, title: 'UI/UX Preferences', icon: Palette },
    { id: 6, title: 'Technical Details', icon: Code },
    { id: 7, title: 'Timeline & Budget', icon: Calendar }
  ];

  const addArrayItem = (
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: keyof FormData
  ) => {
    const newArray = [...array, ''];
    setArray(newArray);
    setValue(fieldName, newArray as any);
  };

  const updateArrayItem = (
    index: number, 
    value: string, 
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: keyof FormData
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
    setValue(fieldName, newArray as any);
  };

  const removeArrayItem = (
    index: number, 
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: keyof FormData
  ) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setArray(newArray);
      setValue(fieldName, newArray as any);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const clientInfo = {
        name: data.clientName,
        company: data.clientCompany,
        email: data.clientEmail,
        phone: data.clientPhone
      };

      const requirements = {
        title: data.projectTitle,
        problemToSolve: data.problemToSolve,
        description: data.projectDescription,
        targetUsers: data.targetUsers,
        goals: data.projectGoals,
        coreFeatures: data.coreFeatures.filter(f => f.trim() !== ''),
        dataFields: data.dataFields.filter(f => f.trim() !== ''),
        adminAccess: data.adminAccess,
        fileUploads: data.fileUploads,
        uiPreferences: {
          designInspiration: data.designInspiration,
          themeMode: data.themeMode,
          animations: data.animations,
          mustHaveComponents: data.mustHaveComponents.filter(c => c.trim() !== '')
        },
        technicalDetails: {
          hosting: data.hosting,
          database: data.database,
          adminDashboard: data.adminDashboard,
          payments: data.payments,
          paymentGateway: data.paymentGateway
        },
        timeline: {
          deadline: data.deadline,
          budget: data.budget,
          mvpFirst: data.mvpFirst
        },
        phases: data.phases
      };

      await downloadReportAsPDF(clientInfo, requirements);
      toast.success('Requirements report generated successfully!');
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadHTML = async () => {
    const data = getValues();
    const clientInfo = {
      name: data.clientName,
      company: data.clientCompany,
      email: data.clientEmail,
      phone: data.clientPhone
    };

    const requirements = {
      title: data.projectTitle,
      problemToSolve: data.problemToSolve,
      description: data.projectDescription,
      targetUsers: data.targetUsers,
      goals: data.projectGoals,
      coreFeatures: data.coreFeatures.filter(f => f.trim() !== ''),
      dataFields: data.dataFields.filter(f => f.trim() !== ''),
      adminAccess: data.adminAccess,
      fileUploads: data.fileUploads,
      uiPreferences: {
        designInspiration: data.designInspiration,
        themeMode: data.themeMode,
        animations: data.animations,
        mustHaveComponents: data.mustHaveComponents.filter(c => c.trim() !== '')
      },
      technicalDetails: {
        hosting: data.hosting,
        database: data.database,
        adminDashboard: data.adminDashboard,
        payments: data.payments,
        paymentGateway: data.paymentGateway
      },
      timeline: {
        deadline: data.deadline,
        budget: data.budget,
        mvpFirst: data.mvpFirst
      },
      phases: data.phases
    };

    try {
      downloadReportAsHTML(clientInfo, requirements);
      toast.success('HTML report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download HTML report');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary mb-4">Client Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Client Name *
                </label>
                <input
                  {...register('clientName')}
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter client's full name"
                />
                {errors.clientName && (
                  <p className="text-error text-sm mt-1">{errors.clientName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Company Name *
                </label>
                <input
                  {...register('clientCompany')}
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter company name"
                />
                {errors.clientCompany && (
                  <p className="text-error text-sm mt-1">{errors.clientCompany.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Email Address *
                </label>
                <input
                  {...register('clientEmail')}
                  type="email"
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter email address"
                />
                {errors.clientEmail && (
                  <p className="text-error text-sm mt-1">{errors.clientEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Phone Number *
                </label>
                <input
                  {...register('clientPhone')}
                  type="tel"
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter phone number"
                />
                {errors.clientPhone && (
                  <p className="text-error text-sm mt-1">{errors.clientPhone.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary mb-4">Project Overview</h3>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Project Title *
              </label>
              <input
                {...register('projectTitle')}
                type="text"
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter project title"
              />
              {errors.projectTitle && (
                <p className="text-error text-sm mt-1">{errors.projectTitle.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                What problem does this project solve? *
              </label>
              <textarea
                {...register('problemToSolve')}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                placeholder="Describe the main problem this project will solve"
              />
              {errors.problemToSolve && (
                <p className="text-error text-sm mt-1">{errors.problemToSolve.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Project Description *
              </label>
              <textarea
                {...register('projectDescription')}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                placeholder="Provide a detailed description of the project"
              />
              {errors.projectDescription && (
                <p className="text-error text-sm mt-1">{errors.projectDescription.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Target Users *
                </label>
                <textarea
                  {...register('targetUsers')}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="Who will use this application?"
                />
                {errors.targetUsers && (
                  <p className="text-error text-sm mt-1">{errors.targetUsers.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Project Goals *
                </label>
                <textarea
                  {...register('projectGoals')}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="What are the main goals and objectives?"
                />
                {errors.projectGoals && (
                  <p className="text-error text-sm mt-1">{errors.projectGoals.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary mb-4">Core Features</h3>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Main Features *
              </label>
              <div className="space-y-3">
                {coreFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateArrayItem(index, e.target.value, coreFeatures, setCoreFeatures, 'coreFeatures')}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={`Feature ${index + 1}`}
                    />
                    {coreFeatures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, coreFeatures, setCoreFeatures, 'coreFeatures')}
                        className="p-2 text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(coreFeatures, setCoreFeatures, 'coreFeatures')}
                  className="flex items-center space-x-2 text-link hover:text-link-hover transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Add Feature</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary mb-4">Data Requirements</h3>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Required Data Fields *
              </label>
              <div className="space-y-3">
                {dataFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={field}
                      onChange={(e) => updateArrayItem(index, e.target.value, dataFields, setDataFields, 'dataFields')}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={`Data field ${index + 1}`}
                    />
                    {dataFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, dataFields, setDataFields, 'dataFields')}
                        className="p-2 text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(dataFields, setDataFields, 'dataFields')}
                  className="flex items-center space-x-2 text-link hover:text-link-hover transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Add Data Field</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Admin Access Requirements *
              </label>
              <textarea
                {...register('adminAccess')}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                placeholder="Describe admin access requirements"
              />
              {errors.adminAccess && (
                <p className="text-error text-sm mt-1">{errors.adminAccess.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                File Upload Requirements *
              </label>
              <textarea
                {...register('fileUploads')}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                placeholder="Describe file upload requirements"
              />
              {errors.fileUploads && (
                <p className="text-error text-sm mt-1">{errors.fileUploads.message}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary mb-4">UI/UX Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Design Inspiration *
              </label>
              <textarea
                {...register('designInspiration')}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                placeholder="Describe your design inspiration or reference websites"
              />
              {errors.designInspiration && (
                <p className="text-error text-sm mt-1">{errors.designInspiration.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Theme Mode *
                </label>
                <select
                  {...register('themeMode')}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select theme mode</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="both">Both (Toggle)</option>
                </select>
                {errors.themeMode && (
                  <p className="text-error text-sm mt-1">{errors.themeMode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Animation Preference *
                </label>
                <select
                  {...register('animations')}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select animation preference</option>
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="rich">Rich Animations</option>
                </select>
                {errors.animations && (
                  <p className="text-error text-sm mt-1">{errors.animations.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Must-Have Components *
              </label>
              <div className="space-y-3">
                {mustHaveComponents.map((component, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={component}
                      onChange={(e) => updateArrayItem(index, e.target.value, mustHaveComponents, setMustHaveComponents, 'mustHaveComponents')}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={`Component ${index + 1}`}
                    />
                    {mustHaveComponents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, mustHaveComponents, setMustHaveComponents, 'mustHaveComponents')}
                        className="p-2 text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(mustHaveComponents, setMustHaveComponents, 'mustHaveComponents')}
                  className="flex items-center space-x-2 text-link hover:text-link-hover transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Add Component</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary mb-4">Technical Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Hosting Preference *
                </label>
                <select
                  {...register('hosting')}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select hosting</option>
                  <option value="netlify">Netlify</option>
                  <option value="vercel">Vercel</option>
                  <option value="aws">AWS</option>
                  <option value="firebase">Firebase</option>
                  <option value="other">Other</option>
                </select>
                {errors.hosting && (
                  <p className="text-error text-sm mt-1">{errors.hosting.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Database Preference *
                </label>
                <select
                  {...register('database')}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select database</option>
                  <option value="firebase">Firebase</option>
                  <option value="supabase">Supabase</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                </select>
                {errors.database && (
                  <p className="text-error text-sm mt-1">{errors.database.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  {...register('adminDashboard')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-sm font-medium text-primary">
                  Admin Dashboard Required
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  {...register('payments')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-sm font-medium text-primary">
                  Payment Processing Required
                </label>
              </div>

              {watchedPayments && (
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Payment Gateway *
                  </label>
                  <select
                    {...register('paymentGateway')}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select payment gateway</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="square">Square</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                  {errors.paymentGateway && (
                    <p className="text-error text-sm mt-1">{errors.paymentGateway.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary mb-4">Timeline & Budget</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Project Deadline *
                </label>
                <input
                  {...register('deadline')}
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 3 months, December 2024"
                />
                {errors.deadline && (
                  <p className="text-error text-sm mt-1">{errors.deadline.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Budget Range *
                </label>
                <select
                  {...register('budget')}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select budget range</option>
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="$100,000+">$100,000+</option>
                </select>
                {errors.budget && (
                  <p className="text-error text-sm mt-1">{errors.budget.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                {...register('mvpFirst')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="text-sm font-medium text-primary">
                Start with MVP (Minimum Viable Product) first
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Project Phases
              </label>
              <div className="space-y-3">
                {phases.map((phase, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => {
                        const newPhases = [...phases];
                        newPhases[index].name = e.target.value;
                        setPhases(newPhases);
                        setValue('phases', newPhases);
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Phase name"
                    />
                    <input
                      type="text"
                      value={phase.duration}
                      onChange={(e) => {
                        const newPhases = [...phases];
                        newPhases[index].duration = e.target.value;
                        setPhases(newPhases);
                        setValue('phases', newPhases);
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Duration"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Project Requirements Gathering</h1>
        <p className="text-secondary mt-2">
          Complete this form to generate a comprehensive project requirements document
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                isActive 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : isCompleted 
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-muted'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 hidden md:block">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-muted'
                }`}>
                  Step {step.id}
                </p>
                <p className={`text-xs ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-muted'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-surface rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="bg-surface"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-3">
              {currentStep === totalSteps && (
                <Button
                  type="button"
                  onClick={downloadHTML}
                  variant="outline"
                  icon={Download}
                  className="bg-surface"
                >
                  Download HTML
                </Button>
              )}
              
              {currentStep === totalSteps ? (
                <Button
                  type="submit"
                  loading={loading}
                  icon={FileText}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate PDF Report
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Requirements;