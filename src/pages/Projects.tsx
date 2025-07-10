import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Clock,
  User,
  CheckCircle,
  Eye,
  Palette,
  Layers
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useCurrency } from '../hooks/useCurrency';
import Button from '../components/UI/Button';
import ProjectModal from '../components/Projects/ProjectModal';
import ProjectDetailsModal from '../components/Projects/ProjectDetailsModal';
import { Project } from '../types';
import { format } from 'date-fns';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();
  const { clients } = useClients();
  const { formatCurrency } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Check for action parameter to auto-open add modal
  useEffect(() => {
    const action = searchParams.get('action');
    const clientFilter = searchParams.get('client');
    
    if (action === 'add') {
      console.log('🚀 Auto-opening add project modal from dashboard');
      setShowAddModal(true);
      // Remove the action parameter from URL
      setSearchParams(clientFilter ? { client: clientFilter } : {});
    }
    
    if (clientFilter) {
      console.log('🔍 Filtering projects by client:', clientFilter);
      setSelectedClient(clientFilter);
    }
  }, [searchParams, setSearchParams]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
    const matchesClient = selectedClient === 'all' || project.clientId === selectedClient;
    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  });

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
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const handleAddProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, themeIds?: string[]) => {
    try {
      console.log('🚀 Adding new project:', projectData);
      console.log('🎨 With themes:', themeIds);
      await addProject(projectData, themeIds);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  const handleUpdateProject = async (id: string, projectData: Partial<Project>, themeIds?: string[]) => {
    try {
      console.log('✏️ Updating project:', id);
      console.log('🎨 With themes:', themeIds);
      await updateProject(id, projectData, themeIds);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleViewDetails = (project: Project) => {
    console.log('👁️ Viewing project details:', project.title);
    setViewingProject(project);
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
          <h1 className="text-3xl font-bold text-primary text-shadow-sm">Projects</h1>
          <p className="text-secondary mt-2">
            Manage your software development projects and track progress
          </p>
          {selectedClient !== 'all' && (
            <p className="text-sm text-muted mt-1">
              Showing projects for: {getClientName(selectedClient)}
            </p>
          )}
        </div>
        <Button
          onClick={() => {
            console.log('🚀 Opening add project modal');
            setShowAddModal(true);
          }}
          icon={Plus}
          className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
        >
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Project Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-primary mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-secondary line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(project)}
                    className="p-2 text-muted hover:text-link transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingProject(project)}
                    className="p-2 text-muted hover:text-link transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label="Edit project"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 text-muted hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></div>
                  <span className="text-xs text-muted capitalize">
                    {project.priority} priority
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-secondary">Progress</span>
                  <span className="text-sm text-muted">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-sm text-secondary">
                <User className="w-4 h-4" />
                <span>{getClientName(project.clientId)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary">
                <Calendar className="w-4 h-4" />
                <span>Due: {format(new Date(project.endDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(project.budget)}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted" />
                  <span className="text-xs text-muted">
                    {Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                </div>
                <button 
                  onClick={() => handleViewDetails(project)}
                  className="text-link hover:text-link-hover text-sm font-medium flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-primary">
              No projects found
            </h3>
            <p className="text-secondary max-w-md mx-auto">
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedClient !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first project'
              }
            </p>
            <Button
              onClick={() => {
                console.log('🚀 Opening add project modal from empty state');
                setShowAddModal(true);
              }}
              icon={Plus}
              className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
            >
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedClient !== 'all'
                ? 'Create New Project'
                : 'Create First Project'
              }
            </Button>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ProjectModal
          isOpen={showAddModal}
          onClose={() => {
            console.log('🔄 Closing add project modal');
            setShowAddModal(false);
          }}
          onSubmit={handleAddProject}
          clients={clients}
        />
      )}

      {editingProject && (
        <ProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={(data, themeIds) => handleUpdateProject(editingProject.id, data, themeIds)}
          project={editingProject}
          clients={clients}
        />
      )}

      {viewingProject && (
        <ProjectDetailsModal
          isOpen={!!viewingProject}
          onClose={() => setViewingProject(null)}
          project={viewingProject}
          client={clients.find(c => c.id === viewingProject.clientId)}
        />
      )}
    </div>
  );
};

export default Projects;