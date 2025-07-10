import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  UserPlus, 
  Crown, 
  Shield, 
  Eye, 
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import Button from '../components/UI/Button';
import StatCard from '../components/UI/StatCard';

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'roles' | 'performance'>('overview');

  // Mock data - in real app, this would come from hooks
  const teams = [
    {
      id: '1',
      name: 'Frontend Development',
      code: 'FE-001',
      members: 5,
      stage: 'performing',
      projects: 3,
      performance: 92
    },
    {
      id: '2',
      name: 'Backend Development',
      code: 'BE-001',
      members: 4,
      stage: 'norming',
      projects: 2,
      performance: 88
    },
    {
      id: '3',
      name: 'QA Testing',
      code: 'QA-001',
      members: 3,
      stage: 'storming',
      projects: 4,
      performance: 75
    }
  ];

  const teamMembers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Product Owner',
      raciRole: 'accountable',
      status: 'online',
      performance: 95,
      skills: ['React', 'TypeScript', 'Node.js'],
      availability: 100
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Scrum Master',
      raciRole: 'responsible',
      status: 'away',
      performance: 92,
      skills: ['Agile', 'Project Management', 'Facilitation'],
      availability: 80
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Developer',
      raciRole: 'responsible',
      status: 'online',
      performance: 88,
      skills: ['React', 'Python', 'AWS'],
      availability: 90
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'Tester',
      raciRole: 'consulted',
      status: 'busy',
      performance: 90,
      skills: ['Testing', 'Automation', 'Cypress'],
      availability: 75
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Team Overview', icon: Users },
    { id: 'members', name: 'Team Members', icon: UserPlus },
    { id: 'roles', name: 'Roles & RACI', icon: Shield },
    { id: 'performance', name: 'Performance', icon: TrendingUp }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'forming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'storming': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'norming': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'performing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'adjourning': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRaciColor = (role: string) => {
    switch (role) {
      case 'responsible': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accountable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'consulted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'informed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Team Management</h1>
          <p className="text-secondary mt-2">
            Manage teams, roles, and track performance across your organization
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            icon={UserPlus}
            variant="outline"
            className="bg-surface"
          >
            Invite Member
          </Button>
          <Button
            icon={Plus}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Team
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Teams"
          value={teams.length}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Team Members"
          value={teamMembers.length}
          icon={UserPlus}
          color="bg-green-500"
        />
        <StatCard
          title="Avg Performance"
          value={`${Math.round(teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length)}%`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Projects"
          value={teams.reduce((sum, t) => sum + t.projects, 0)}
          icon={CheckCircle}
          color="bg-orange-500"
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Team Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-primary">{team.name}</h3>
                      <p className="text-sm text-muted">{team.code}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStageColor(team.stage)}`}>
                      {team.stage}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">Members</span>
                      <span className="font-medium text-primary">{team.members}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">Active Projects</span>
                      <span className="font-medium text-primary">{team.projects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">Performance</span>
                      <span className="font-medium text-primary">{team.performance}%</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-muted hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-muted hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Team Members</h2>
              <Button
                icon={UserPlus}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Member
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-primary">{member.name}</h3>
                          <p className="text-sm text-secondary">{member.email}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-primary">{member.performance}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Role</span>
                          <span className="text-sm font-medium text-primary">{member.role}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">RACI</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRaciColor(member.raciRole)}`}>
                            {member.raciRole}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Availability</span>
                          <span className="text-sm font-medium text-primary">{member.availability}%</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-muted mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Roles & RACI Matrix</h2>
            
            <div className="bg-surface rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-primary mb-2">RACI Matrix</h3>
                <p className="text-sm text-secondary">
                  Responsible, Accountable, Consulted, Informed
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Activity
                      </th>
                      {teamMembers.map(member => (
                        <th key={member.id} className="px-6 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">
                          {member.name.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      'Project Planning',
                      'Requirements Gathering',
                      'Development',
                      'Code Review',
                      'Testing',
                      'Deployment',
                      'Client Communication'
                    ].map((activity, index) => (
                      <tr key={activity} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                          {activity}
                        </td>
                        {teamMembers.map(member => {
                          // Mock RACI assignment logic
                          const raciRole = member.role === 'Product Owner' ? 'A' :
                                          member.role === 'Scrum Master' ? 'R' :
                                          member.role === 'Developer' ? 'R' :
                                          'C';
                          
                          const colorClass = raciRole === 'R' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                           raciRole === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                           raciRole === 'C' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                           'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

                          return (
                            <td key={member.id} className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                                {raciRole}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="text-secondary"><strong>R</strong> - Responsible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-secondary"><strong>A</strong> - Accountable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-secondary"><strong>C</strong> - Consulted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                    <span className="text-secondary"><strong>I</strong> - Informed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Performance Monitoring</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-primary mb-4">Team Performance Trends</h3>
                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-primary">{member.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${member.performance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-primary w-12 text-right">
                          {member.performance}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-primary mb-4">Team Health Indicators</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-secondary">Team Collaboration</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-secondary">Sprint Velocity</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">Good</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-secondary">Conflict Resolution</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">Needs Attention</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-secondary">Skill Development</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">Improving</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-primary mb-4">Recent Feedback & Reviews</h3>
              <div className="space-y-4">
                {[
                  {
                    member: 'John Doe',
                    feedback: 'Excellent leadership in sprint planning. Great communication with stakeholders.',
                    rating: 5,
                    date: '2 days ago'
                  },
                  {
                    member: 'Jane Smith',
                    feedback: 'Strong facilitation skills. Helped resolve team conflicts effectively.',
                    rating: 4,
                    date: '1 week ago'
                  },
                  {
                    member: 'Mike Johnson',
                    feedback: 'Delivered high-quality code on time. Good collaboration with QA team.',
                    rating: 4,
                    date: '1 week ago'
                  }
                ].map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-primary">{review.member}</h4>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-secondary mb-2">{review.feedback}</p>
                    <p className="text-xs text-muted">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeamManagement;