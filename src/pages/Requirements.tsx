import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  User, 
  FileText, 
  Layers, 
  Palette, 
  Settings, 
  Clock, 
  Eye,
  Download,
  FileDown,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useClients } from '../hooks/useClients';
import Button from '../components/UI/Button';
import { toast } from 'react-toastify';
import { generateProjectRequirementsReport, downloadReportAsPDF, downloadReportAsHTML } from '../utils/reportGenerator';

// Form validation schema
const schema = yup.object({
  clientId: yup.string().required('Client selection is required'),
  title: yup.string().required('Project title is required'),
  problemToSolve: yup.string().required('Problem description is required'),
  description: yup.string().required('Project description is required'),
  targetUsers: yup.string().required('Target users description is required'),
  goals: yup.string().required('Project goals are required'),
  coreFeatures: yup.array().of(yup.string()).min(1, 'At least one feature is required'),
  userRoles: yup.string().required('User roles description is required'),
  authentication: yup.boolean().required(),
  realTimeUpdates: yup.boolean().required(),
  mobileResponsive: yup.boolean().required(),
  dataFields: yup.array().of(yup.string()).min(1, 'At least one data field is required'),
  adminAccess: yup.string().required('Admin access description is required'),
  fileUploads: yup.string().required('File upload requirements are required'),
  designInspiration: yup.string().required('Design inspiration is required'),
  themeMode: yup.string().required('Theme mode selection is required'),
  animations: yup.string().required('Animation preference is required'),
  mustHaveComponents: yup.array().of(yup.string()).min(1, 'At least one component is required'),
  hosting: yup.string().required('Hosting preference is required'),
  database: yup.string().required('Database selection is required'),
  adminDashboard: yup.boolean().required(),
  payments: yup.boolean().required(),
  paymentGateway: yup.string().when('payments', {
    is: true,
    then: (schema) => schema.required('Payment gateway is required when payments are enabled'),
    otherwise: (schema) => schema.notRequired()
  }),
  deadline: yup.string().required('Project deadline is required'),
  budget: yup.string().required('Budget information is required'),
  mvpFirst: yup.boolean().required(),
  phases: yup.array().of(
    yup.object({
      name: yup.string().required(),
      duration: yup.string().required()
    })
  ).min(1, 'At least one phase is required')
});

type FormData = yup.InferType<typeof schema>;

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

const Requirements: React.FC = () => {
  const { clients, loading: clientsLoading } = useClients();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const steps: Step[] = [
    { id: 1, title: 'Client Selection', icon: User, description: 'Choose the client for this project' },
    { id: 2, title: 'Project Basics', icon: FileText, description: 'Define project fundamentals' },
    { id: 3, title: 'Core Requirements', icon: Layers, description: 'Specify main features and functionality' },
    { id: 4, title: 'Data Fields', icon: Settings, description: 'Define data structure and admin access' },
    { id: 5, title: 'UI/UX Preferences', icon: Palette, description: 'Design and user experience preferences' },
    { id: 6, title: 'Technical Details', icon: Settings, description: 'Hosting, database, and payment setup' },
    { id: 7, title: 'Timeline & Budget', icon: Clock, description: 'Project timeline and budget planning' },
    { id: 8, title: 'Review & Generate', icon: Eye, description: 'Review and generate final report' }
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
    trigger,
    getValues,
    setValue
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      clientId: '',
      title: '',
      problemToSolve: '',
      description: '',
      targetUsers: '',
      goals: '',
      coreFeatures: [''],
      userRoles: '',
      authentication: false,
      realTimeUpdates: false,
      mobileResponsive: true,
      dataFields: [''],
      adminAccess: '',
      fileUploads: '',
      designInspiration: '',
      themeMode: 'both',
      animations: 'subtle',
      mustHaveComponents: [''],
      hosting: 'firebase',
      database: 'firebase',
      adminDashboard: false,
      payments: false,
      paymentGateway: '',
      deadline: '',
      budget: '',
      mvpFirst: false,
      phases: [
        { name: 'Requirement Analysis', duration: '1 Week' },
        { name: 'UI/UX Design', duration: '1 Week' },
        { name: 'Development', duration: '2 Weeks' },
        { name: 'Testing', duration: '1 Week' },
        { name: 'Deployment', duration: '2 Days' }
      ]
    }
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'coreFeatures'
  });

  const { fields: dataFields, append: appendDataField, remove: removeDataField } = useFieldArray({
    control,
    name: 'dataFields'
  });

  const { fields: componentFields, append: appendComponent, remove: removeComponent } = useFieldArray({
    control,
    name: 'mustHaveComponents'
  });

  const { fields: phaseFields, append: appendPhase, remove: removePhase } = useFieldArray({
    control,
    name: 'phases'
  });

  const watchedValues = watch();
  const watchedPayments = watch('payments');

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    const stepFields: { [key: number]: (keyof FormData)[] } = {
      1: ['clientId'],
      2: ['title', 'problemToSolve', 'description', 'targetUsers', 'goals'],
      3: ['coreFeatures', 'userRoles', 'authentication', 'realTimeUpdates', 'mobileResponsive'],
      4: ['dataFields', 'adminAccess', 'fileUploads'],
      5: ['designInspiration', 'themeMode', 'animations', 'mustHaveComponents'],
      6: ['hosting', 'database', 'adminDashboard', 'payments'],
      7: ['deadline', 'budget', 'mvpFirst', 'phases'],
      8: []
    };

    const fieldsToValidate = stepFields[currentStep] || [];
    const result = await trigger(fieldsToValidate);
    
    if (result && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    return result;
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please complete all required fields before proceeding');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = async (stepNumber: number) => {
    if (stepNumber <= currentStep || completedSteps.includes(stepNumber - 1)) {
      setCurrentStep(stepNumber);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const formData = getValues();
      const selectedClient = clients.find(c => c.id === formData.clientId);
      
      if (!selectedClient) {
        toast.error('Selected client not found');
        return;
      }

      const clientInfo = {
        name: selectedClient.name,
        company: selectedClient.company,
        email: selectedClient.email,
        phone: selectedClient.phone
      };

      const requirements = {
        title: formData.title,
        problemToSolve: formData.problemToSolve,
        description: formData.description,
        targetUsers: formData.targetUsers,
        goals: formData.goals,
        coreFeatures: formData.coreFeatures.filter(f => f.trim() !== ''),
        dataFields: formData.dataFields.filter(f => f.trim() !== ''),
        adminAccess: formData.adminAccess,
        fileUploads: formData.fileUploads,
        uiPreferences: {
          designInspiration: formData.designInspiration,
          themeMode: formData.themeMode,
          animations: formData.animations,
          mustHaveComponents: formData.mustHaveComponents.filter(c => c.trim() !== '')
        },
        technicalDetails: {
          hosting: formData.hosting,
          database: formData.database,
          adminDashboard: formData.adminDashboard,
          payments: formData.payments,
          paymentGateway: formData.paymentGateway
        },
        timeline: {
          deadline: formData.deadline,
          budget: formData.budget,
          mvpFirst: formData.mvpFirst
        },
        phases: formData.phases.filter(p => p.name.trim() !== '' && p.duration.trim() !== '')
      };

      const reportHTML = generateProjectRequirementsReport(clientInfo, requirements);
      setPreviewContent(reportHTML);
      setShowPreview(true);
      
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const formData = getValues();
      const selectedClient = clients.find(c => c.id === formData.clientId);
      
      if (!selectedClient) {
        toast.error('Selected client not found');
        return;
      }

      const clientInfo = {
        name: selectedClient.name,
        company: selectedClient.company,
        email: selectedClient.email,
        phone: selectedClient.phone
      };

      const requirements = {
        title: formData.title,
        problemToSolve: formData.problemToSolve,
        description: formData.description,
        targetUsers: formData.targetUsers,
        goals: formData.goals,
        coreFeatures: formData.coreFeatures.filter(f => f.trim() !== ''),
        dataFields: formData.dataFields.filter(f => f.trim() !== ''),
        adminAccess: formData.adminAccess,
        fileUploads: formData.fileUploads,
        uiPreferences: {
          designInspiration: formData.designInspiration,
          themeMode: formData.themeMode,
          animations: formData.animations,
          mustHaveComponents: formData.mustHaveComponents.filter(c => c.trim() !== '')
        },
        technicalDetails: {
          hosting: formData.hosting,
          database: formData.database,
          adminDashboard: formData.adminDashboard,
          payments: formData.payments,
          paymentGateway: formData.paymentGateway
        },
        timeline: {
          deadline: formData.deadline,
          budget: formData.budget,
          mvpFirst: formData.mvpFirst
        },
        phases: formData.phases.filter(p => p.name.trim() !== '' && p.duration.trim() !== '')
      };

      await downloadReportAsPDF(clientInfo, requirements);
      toast.success('PDF download initiated!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadHTML = async () => {
    try {
      const formData = getValues();
      const selectedClient = clients.find(c => c.id === formData.clientId);
      
      if (!selectedClient) {
        toast.error('Selected client not found');
        return;
      }

      const clientInfo = {
        name: selectedClient.name,
        company: selectedClient.company,
        email: selectedClient.email,
        phone: selectedClient.phone
      };

      const requirements = {
        title: formData.title,
        problemToSolve: formData.problemToSolve,
        description: formData.description,
        targetUsers: formData.targetUsers,
        goals: formData.goals,
        coreFeatures: formData.coreFeatures.filter(f => f.trim() !== ''),
        dataFields: formData.dataFields.filter(f => f.trim() !== ''),
        adminAccess: formData.adminAccess,
        fileUploads: formData.fileUploads,
        uiPreferences: {
          designInspiration: formData.designInspiration,
          themeMode: formData.themeMode,
          animations: formData.animations,
          mustHaveComponents: formData.mustHaveComponents.filter(c => c.trim() !== '')
        },
        technicalDetails: {
          hosting: formData.hosting,
          database: formData.database,
          adminDashboard: formData.adminDashboard,
          payments: formData.payments,
          paymentGateway: formData.paymentGateway
        },
        timeline: {
          deadline: formData.deadline,
          budget: formData.budget,
          mvpFirst: formData.mvpFirst
        },
        phases: formData.phases.filter(p => p.name.trim() !== '' && p.duration.trim() !== '')
      };

      downloadReportAsHTML(clientInfo, requirements);
      toast.success('HTML report downloaded!');
    } catch (error) {
      console.error('Error downloading HTML:', error);
      toast.error('Failed to download HTML');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Select Client</h2>
              <p className="text-secondary">Choose the client for this project requirements gathering</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Client *
              </label>
              {clientsLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
              ) : (
                <select
                  {...register('clientId')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </option>
                  ))}
                </select>
              )}
              {errors.clientId && (
                <p className="text-error text-sm mt-1">{errors.clientId.message}</p>
              )}
            </div>

            {watchedValues.clientId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              >
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Selected Client</h3>
                {(() => {
                  const selectedClient = clients.find(c => c.id === watchedValues.clientId);
                  return selectedClient ? (
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p><strong>Name:</strong> {selectedClient.name}</p>
                      <p><strong>Company:</strong> {selectedClient.company}</p>
                      <p><strong>Email:</strong> {selectedClient.email}</p>
                      <p><strong>Phone:</strong> {selectedClient.phone}</p>
                    </div>
                  ) : null;
                })()}
              </motion.div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Project Basics</h2>
              <p className="text-secondary">Define the fundamental aspects of your project</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Project Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your project title"
                />
                {errors.title && (
                  <p className="text-error text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  What problem are you trying to solve? *
                </label>
                <textarea
                  {...register('problemToSolve')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="Describe the main problem this project will solve"
                />
                {errors.problemToSolve && (
                  <p className="text-error text-sm mt-1">{errors.problemToSolve.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Brief description of the project idea *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="Provide a detailed description of your project"
                />
                {errors.description && (
                  <p className="text-error text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Target users / audience *
                </label>
                <input
                  {...register('targetUsers')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Who will be using this application?"
                />
                {errors.targetUsers && (
                  <p className="text-error text-sm mt-1">{errors.targetUsers.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Main goals or features expected *
                </label>
                <textarea
                  {...register('goals')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="What are the main goals and expected outcomes?"
                />
                {errors.goals && (
                  <p className="text-error text-sm mt-1">{errors.goals.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Layers className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Core Requirements</h2>
              <p className="text-secondary">Define the main features and functionality</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  What are the main features you need? *
                </label>
                <div className="space-y-3">
                  {featureFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <input
                        {...register(`coreFeatures.${index}` as const)}
                        type="text"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={`Feature ${index + 1}`}
                      />
                      {featureFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendFeature('')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
                {errors.coreFeatures && (
                  <p className="text-error text-sm mt-1">{errors.coreFeatures.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Do different user roles exist? (Admin, Customer, etc.) *
                </label>
                <textarea
                  {...register('userRoles')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="Describe the different user roles and their permissions"
                />
                {errors.userRoles && (
                  <p className="text-error text-sm mt-1">{errors.userRoles.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    {...register('authentication')}
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-primary">
                    Authentication/Login Required
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    {...register('realTimeUpdates')}
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-primary">
                    Real-time Updates
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    {...register('mobileResponsive')}
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-primary">
                    Mobile Responsive
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Data Fields</h2>
              <p className="text-secondary">Define the data structure and admin access</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  What kind of information will users enter? *
                </label>
                <div className="space-y-3">
                  {dataFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <input
                        {...register(`dataFields.${index}` as const)}
                        type="text"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={`Data field ${index + 1} (e.g., Name, Email, Phone)`}
                      />
                      {dataFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDataField(index)}
                          className="p-2 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendDataField('')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Data Field</span>
                  </button>
                </div>
                {errors.dataFields && (
                  <p className="text-error text-sm mt-1">{errors.dataFields.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  What data should the admin be able to see/edit? *
                </label>
                <textarea
                  {...register('adminAccess')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="Describe what data admins can access and modify"
                />
                {errors.adminAccess && (
                  <p className="text-error text-sm mt-1">{errors.adminAccess.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Any file uploads or media handling needed? *
                </label>
                <textarea
                  {...register('fileUploads')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="Describe file upload requirements (e.g., profile images, documents, PDFs)"
                />
                {errors.fileUploads && (
                  <p className="text-error text-sm mt-1">{errors.fileUploads.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Palette className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">UI/UX Preferences</h2>
              <p className="text-secondary">Define the design and user experience preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Any existing design inspirations or color preferences? *
                </label>
                <textarea
                  {...register('designInspiration')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  placeholder="Describe your design preferences, color schemes, or reference websites"
                />
                {errors.designInspiration && (
                  <p className="text-error text-sm mt-1">{errors.designInspiration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  Theme Mode Preference *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light Mode Only' },
                    { value: 'dark', label: 'Dark Mode Only' },
                    { value: 'both', label: 'Both (User Choice)' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        {...register('themeMode')}
                        type="radio"
                        value={option.value}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-primary">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.themeMode && (
                  <p className="text-error text-sm mt-1">{errors.themeMode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  Animation Preference *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'none', label: 'No Animations' },
                    { value: 'subtle', label: 'Subtle Animations' },
                    { value: 'rich', label: 'Rich Animations' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        {...register('animations')}
                        type="radio"
                        value={option.value}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-primary">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.animations && (
                  <p className="text-error text-sm mt-1">{errors.animations.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  Any must-have components? *
                </label>
                <div className="space-y-3">
                  {componentFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <input
                        {...register(`mustHaveComponents.${index}` as const)}
                        type="text"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={`Component ${index + 1} (e.g., Calendar, Charts, Maps)`}
                      />
                      {componentFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="p-2 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendComponent('')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Component</span>
                  </button>
                </div>
                {errors.mustHaveComponents && (
                  <p className="text-error text-sm mt-1">{errors.mustHaveComponents.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Technical Details</h2>
              <p className="text-secondary">Configure hosting, database, and payment settings</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Hosting Preference *
                  </label>
                  <select
                    {...register('hosting')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                  >
                    <option value="firebase">Firebase</option>
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                    <option value="aws">AWS</option>
                    <option value="custom">Custom Server</option>
                  </select>
                  {errors.hosting && (
                    <p className="text-error text-sm mt-1">{errors.hosting.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Database Preference *
                  </label>
                  <select
                    {...register('database')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                  >
                    <option value="firebase">Firebase Realtime Database</option>
                    <option value="firestore">Firestore</option>
                    <option value="mongodb">MongoDB</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                  </select>
                  {errors.database && (
                    <p className="text-error text-sm mt-1">{errors.database.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    {...register('adminDashboard')}
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-primary">
                    Admin Dashboard Required
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    {...register('payments')}
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-primary">
                    Payment Processing Required
                  </label>
                </div>
              </div>

              {watchedPayments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-primary mb-3">
                    Payment Gateway *
                  </label>
                  <select
                    {...register('paymentGateway')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                  >
                    <option value="">Select payment gateway...</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="square">Square</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                  {errors.paymentGateway && (
                    <p className="text-error text-sm mt-1">{errors.paymentGateway.message}</p>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Timeline & Budget</h2>
              <p className="text-secondary">Define project timeline and budget expectations</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Expected project deadline *
                  </label>
                  <input
                    {...register('deadline')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., 3 months, End of Q2 2024"
                  />
                  {errors.deadline && (
                    <p className="text-error text-sm mt-1">{errors.deadline.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Budget range *
                  </label>
                  <input
                    {...register('budget')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., $10,000 - $15,000"
                  />
                  {errors.budget && (
                    <p className="text-error text-sm mt-1">{errors.budget.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <input
                  {...register('mvpFirst')}
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-primary">
                  Prefer MVP phase first, then scale later
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-3">
                  Project Phases *
                </label>
                <div className="space-y-3">
                  {phaseFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-2 gap-3">
                      <input
                        {...register(`phases.${index}.name` as const)}
                        type="text"
                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Phase name"
                        readOnly
                      />
                      <div className="flex items-center space-x-3">
                        <input
                          {...register(`phases.${index}.duration` as const)}
                          type="text"
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Duration"
                        />
                        {phaseFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhase(index)}
                            className="p-2 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendPhase({ name: 'Custom Phase', duration: '' })}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Phase</span>
                  </button>
                </div>
                {errors.phases && (
                  <p className="text-error text-sm mt-1">{errors.phases.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Eye className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Review & Generate</h2>
              <p className="text-secondary">Review your requirements and generate the final report</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                Requirements Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Project:</strong> {watchedValues.title || 'Not specified'}</p>
                  <p><strong>Client:</strong> {(() => {
                    const client = clients.find(c => c.id === watchedValues.clientId);
                    return client ? `${client.name} (${client.company})` : 'Not selected';
                  })()}</p>
                  <p><strong>Features:</strong> {watchedValues.coreFeatures?.filter(f => f.trim()).length || 0} specified</p>
                  <p><strong>Data Fields:</strong> {watchedValues.dataFields?.filter(f => f.trim()).length || 0} specified</p>
                </div>
                <div>
                  <p><strong>Hosting:</strong> {watchedValues.hosting || 'Not specified'}</p>
                  <p><strong>Database:</strong> {watchedValues.database || 'Not specified'}</p>
                  <p><strong>Deadline:</strong> {watchedValues.deadline || 'Not specified'}</p>
                  <p><strong>Budget:</strong> {watchedValues.budget || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={generateReport}
                loading={generatingReport}
                icon={Eye}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
              >
                {generatingReport ? 'Generating...' : 'Preview Report'}
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                icon={Download}
                variant="outline"
                className="flex-1"
              >
                Download PDF
              </Button>
              
              <Button
                onClick={handleDownloadHTML}
                icon={FileDown}
                variant="outline"
                className="flex-1"
              >
                Download HTML
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 text-shadow-sm">
            Project Requirements Form
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Gather comprehensive project requirements and generate a professional report
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-primary">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-secondary">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center space-x-4 min-w-max px-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              const isAccessible = step.id <= currentStep || completedSteps.includes(step.id - 1);
              
              return (
                <motion.button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                      : isAccessible
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  whileHover={isAccessible ? { scale: 1.02 } : {}}
                  whileTap={isAccessible ? { scale: 0.98 } : {}}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-white text-blue-600' : ''
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs opacity-75">{step.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            icon={ChevronLeft}
            className="flex items-center space-x-2"
          >
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-secondary">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              icon={ChevronRight}
              className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm flex items-center space-x-2"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={generateReport}
              loading={generatingReport}
              icon={Eye}
              className="bg-green-600 hover:bg-green-700 text-white text-shadow-sm"
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </Button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
              onClick={() => setShowPreview(false)}
            />
            
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white dark:bg-gray-800 px-6 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-primary text-shadow-sm">
                      Project Requirements Report Preview
                    </h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Close preview"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <iframe
                      srcDoc={previewContent}
                      className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded-lg"
                      title="Report Preview"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                  <Button
                    onClick={handleDownloadPDF}
                    icon={Download}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
                  >
                    Download PDF
                  </Button>
                  
                  <Button
                    onClick={handleDownloadHTML}
                    icon={FileDown}
                    variant="outline"
                    className="mt-3 sm:mt-0 w-full sm:w-auto"
                  >
                    Download HTML
                  </Button>
                  
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    className="mt-3 sm:mt-0 w-full sm:w-auto"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Requirements;