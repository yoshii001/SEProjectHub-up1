import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/UI/StatCard';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useMeetings } from '../hooks/useMeetings';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { useCurrency } from '../hooks/useCurrency';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { meetings } = useMeetings();
  const { activities } = useRecentActivity();
  const { formatCurrency } = useCurrency();

  // Calculate dynamic statistics
  const activeClients = clients.filter(client => client.status === 'active');
  const activeProjects = projects.filter(project => project.status === 'in-progress');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const totalRevenue = projects.reduce((sum, project) => sum + project.budget, 0);

  // Calculate trends (mock data - in real app, compare with previous period)
  const clientTrend = { value: 12, isPositive: true };
  const projectTrend = { value: 8, isPositive: true };
  const completedTrend = { value: 15, isPositive: true };
  const revenueTrend = { value: 22, isPositive: true };

  const upcomingMeetings = meetings
    .filter(meeting => meeting.status === 'scheduled' && new Date(meeting.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const upcomingDeadlines = projects
    .filter(project => project.status === 'in-progress')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const formatMeetingDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  // Quick action handlers
  const handleAddClient = () => {
    console.log('🚀 Navigating to clients page to add new client');
    navigate('/clients?action=add');
  };

  const handleCreateProject = () => {
    console.log('🚀 Navigating to projects page to create new project');
    navigate('/projects?action=add');
  };

  const handleScheduleMeeting = () => {
    console.log('🚀 Navigating to meetings page to schedule new meeting');
    navigate('/meetings?action=add');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary text-shadow-sm">Dashboard</h1>
        <p className="text-secondary mt-2">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Clients"
          value={activeClients.length}
          icon={Users}
          color="bg-blue-500"
          trend={clientTrend}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          icon={Briefcase}
          color="bg-green-500"
          trend={projectTrend}
        />
        <StatCard
          title="Completed Projects"
          value={completedProjects.length}
          icon={TrendingUp}
          color="bg-purple-500"
          trend={completedTrend}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="bg-orange-500"
          trend={revenueTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">
              Upcoming Meetings
            </h3>
            <Calendar className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-3">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => navigate('/meetings')}
                >
                  <div className="flex-1">
                    <p className="font-medium text-primary text-sm">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-secondary">
                      {getClientName(meeting.clientId)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {formatMeetingDate(new Date(meeting.date))}
                    </p>
                    <p className="text-xs text-muted">
                      {format(new Date(meeting.date), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted text-sm">No upcoming meetings</p>
                <button
                  onClick={handleScheduleMeeting}
                  className="text-link hover:text-link-hover text-sm font-medium mt-2"
                >
                  Schedule a meeting
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">
              Project Deadlines
            </h3>
            <Clock className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((project) => {
                const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => navigate('/projects')}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-primary text-sm">
                        {project.title}
                      </p>
                      <p className="text-xs text-secondary">
                        {getClientName(project.clientId)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        daysLeft <= 3 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : daysLeft <= 7
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {daysLeft} days left
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-muted text-sm">No upcoming deadlines</p>
                <button
                  onClick={handleCreateProject}
                  className="text-link hover:text-link-hover text-sm font-medium mt-2"
                >
                  Create a project
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">
              Recent Activity
            </h3>
            <TrendingUp className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary text-sm">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-muted text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-primary mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            onClick={handleAddClient}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-xl text-left hover:shadow-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-8 h-8" />
              <Plus className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="font-semibold text-lg">Add New Client</p>
            <p className="text-sm opacity-75 mt-1">Create a new client profile</p>
            <ArrowUpRight className="w-4 h-4 mt-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          
          <motion.button
            onClick={handleCreateProject}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-700 dark:text-green-300 rounded-xl text-left hover:shadow-lg transition-all duration-200 border border-green-200 dark:border-green-800 group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Briefcase className="w-8 h-8" />
              <Plus className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="font-semibold text-lg">Create Project</p>
            <p className="text-sm opacity-75 mt-1">Start a new project</p>
            <ArrowUpRight className="w-4 h-4 mt-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          
          <motion.button
            onClick={handleScheduleMeeting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 rounded-xl text-left hover:shadow-lg transition-all duration-200 border border-purple-200 dark:border-purple-800 group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Calendar className="w-8 h-8" />
              <Plus className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="font-semibold text-lg">Schedule Meeting</p>
            <p className="text-sm opacity-75 mt-1">Book a client meeting</p>
            <ArrowUpRight className="w-4 h-4 mt-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>
      </motion.div>

      {/* Project Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-primary mb-6">
          Project Progress Overview
        </h3>
        <div className="space-y-4">
          {activeProjects.slice(0, 3).map((project) => (
            <div key={project.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-primary text-sm">
                    {project.title}
                  </p>
                  <span className="text-sm text-muted">
                    {project.progress}%
                  </span>
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
          ))}
          {activeProjects.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted text-sm">No active projects</p>
              <button
                onClick={handleCreateProject}
                className="text-link hover:text-link-hover text-sm font-medium mt-2"
              >
                Create your first project
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;