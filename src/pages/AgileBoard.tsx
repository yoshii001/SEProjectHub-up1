import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Users, 
  BarChart3, 
  AlertTriangle, 
  MessageSquare,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAgileProject } from '../hooks/useAgileProject';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import ScrumBoard from '../components/Agile/ScrumBoard';
import UserStoryModal from '../components/Agile/UserStoryModal';
import DailyStandupModal from '../components/Agile/DailyStandupModal';
import RiskMatrix from '../components/Agile/RiskMatrix';
import Button from '../components/UI/Button';
import StatCard from '../components/UI/StatCard';
import { UserStory, Epic, Sprint, Task, DailyStandup, Risk } from '../types/agile';

const AgileBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjects();
  const { clients } = useClients();
  const {
    epics,
    stories,
    sprints,
    tasks,
    standups,
    risks,
    loading,
    createUserStory,
    createTask,
    updateStoryStatus,
    updateTaskStatus,
    addDailyStandup
  } = useAgileProject(projectId!);

  const [activeTab, setActiveTab] = useState<'board' | 'backlog' | 'sprints' | 'risks' | 'reports'>('board');
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showStandupModal, setShowStandupModal] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const project = projects.find(p => p.id === projectId);
  const client = project ? clients.find(c => c.id === project.clientId) : null;
  const activeSprint = sprints.find(s => s.status === 'active');

  // Calculate metrics
  const totalStoryPoints = stories.reduce((sum, story) => sum + story.storyPoints, 0);
  const completedStoryPoints = stories
    .filter(story => story.status === 'done')
    .reduce((sum, story) => sum + story.storyPoints, 0);
  const velocity = activeSprint ? activeSprint.velocity : 0;
  const highRisks = risks.filter(r => r.riskScore >= 15).length;

  const tabs = [
    { id: 'board', name: 'Scrum Board', icon: Target },
    { id: 'backlog', name: 'Product Backlog', icon: BarChart3 },
    { id: 'sprints', name: 'Sprint Planning', icon: Calendar },
    { id: 'risks', name: 'Risk Management', icon: AlertTriangle },
    { id: 'reports', name: 'Reports & Analytics', icon: TrendingUp }
  ];

  const handleCreateStory = async (storyData: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'estimationVotes' | 'tasks'>) => {
    await createUserStory({
      ...storyData,
      status: 'backlog',
      estimationVotes: [],
      tasks: []
    });
    setShowStoryModal(false);
    setEditingStory(null);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTask(taskData);
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleStandup = async (standupData: Omit<DailyStandup, 'id'>) => {
    await addDailyStandup(standupData);
    setShowStandupModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-primary">Project not found</h2>
        <p className="text-secondary mt-2">The requested project could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">{project.title}</h1>
          <p className="text-secondary mt-2">
            Agile Project Management • {client?.name || 'Unknown Client'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowStandupModal(true)}
            icon={MessageSquare}
            variant="outline"
            className="bg-surface"
          >
            Daily Standup
          </Button>
          <Button
            onClick={() => setShowStoryModal(true)}
            icon={Plus}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Story
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Story Points"
          value={totalStoryPoints}
          icon={Target}
          color="bg-blue-500"
        />
        <StatCard
          title="Completed Points"
          value={completedStoryPoints}
          icon={BarChart3}
          color="bg-green-500"
        />
        <StatCard
          title="Sprint Velocity"
          value={velocity}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="High Risks"
          value={highRisks}
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-muted hover:text-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'board' && (
          <ScrumBoard
            stories={stories}
            tasks={tasks}
            onUpdateStoryStatus={updateStoryStatus}
            onUpdateTaskStatus={updateTaskStatus}
            onCreateStory={() => setShowStoryModal(true)}
            onCreateTask={() => setShowTaskModal(true)}
            onEditStory={setEditingStory}
            onEditTask={setEditingTask}
          />
        )}

        {activeTab === 'backlog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Product Backlog</h2>
              <Button
                onClick={() => setShowStoryModal(true)}
                icon={Plus}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add User Story
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stories
                .filter(story => story.status === 'backlog')
                .map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setEditingStory(story)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-primary">{story.title}</h3>
                      <span className="text-sm font-medium text-muted bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {story.storyPoints} pts
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-4">
                      As a <strong>{story.asA}</strong>, I want <strong>{story.iWant}</strong> so that <strong>{story.soThat}</strong>.
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className={`px-2 py-1 rounded-full ${
                        story.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        story.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        story.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {story.priority} priority
                      </span>
                      <span>{story.acceptanceCriteria.length} criteria</span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Risk Management</h2>
              <Button
                icon={Plus}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Add Risk
              </Button>
            </div>

            <RiskMatrix
              risks={risks}
              onRiskClick={(risk) => console.log('Risk clicked:', risk)}
            />
          </div>
        )}

        {activeTab === 'sprints' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Sprint Planning</h2>
              <Button
                icon={Plus}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Create Sprint
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sprints.map((sprint, index) => (
                <motion.div
                  key={sprint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-primary">{sprint.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sprint.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      sprint.status === 'planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      sprint.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {sprint.status}
                    </span>
                  </div>
                  <p className="text-sm text-secondary mb-4">{sprint.goal}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted">Start:</span>
                      <p className="font-medium text-primary">
                        {new Date(sprint.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">End:</span>
                      <p className="font-medium text-primary">
                        {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">Capacity:</span>
                      <p className="font-medium text-primary">{sprint.capacity} pts</p>
                    </div>
                    <div>
                      <span className="text-muted">Velocity:</span>
                      <p className="font-medium text-primary">{sprint.velocity} pts</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-primary mb-4">Sprint Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Completion Rate</span>
                    <span className="font-medium text-primary">
                      {totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-primary mb-4">Team Mood</h3>
                <div className="space-y-2">
                  {['great', 'good', 'okay', 'struggling', 'blocked'].map(mood => {
                    const count = standups.filter(s => s.mood === mood).length;
                    const percentage = standups.length > 0 ? (count / standups.length) * 100 : 0;
                    
                    return (
                      <div key={mood} className="flex items-center justify-between">
                        <span className="text-secondary capitalize">{mood}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                mood === 'great' ? 'bg-green-500' :
                                mood === 'good' ? 'bg-blue-500' :
                                mood === 'okay' ? 'bg-yellow-500' :
                                mood === 'struggling' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <UserStoryModal
        isOpen={showStoryModal || !!editingStory}
        onClose={() => {
          setShowStoryModal(false);
          setEditingStory(null);
        }}
        onSubmit={handleCreateStory}
        story={editingStory || undefined}
        epics={epics}
        projectId={projectId!}
      />

      <DailyStandupModal
        isOpen={showStandupModal}
        onClose={() => setShowStandupModal(false)}
        onSubmit={handleStandup}
        userId="current-user-id" // Replace with actual user ID
        sprintId={activeSprint?.id || ''}
      />
    </div>
  );
};

export default AgileBoard;