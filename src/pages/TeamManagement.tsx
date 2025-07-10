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
  Star,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../components/UI/Button';
import StatCard from '../components/UI/StatCard';
import { toast } from 'react-toastify';

// Team Member interface
interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  raciRole: 'responsible' | 'accountable' | 'consulted' | 'informed';
  status: 'online' | 'offline' | 'away' | 'busy';
  performance: number;
  skills: string[];
  availability: number;
  joinedAt: Date;
}

// Team interface
interface Team {
  id: string;
  name: string;
  code: string;
  members: string[]; // member IDs
  stage: 'forming' | 'storming' | 'norming' | 'performing' | 'adjourning';
  projects: number;
  performance: number;
  createdAt: Date;
}

// Form schemas
const memberSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  role: yup.string().required('Role is required'),
  raciRole: yup.string().oneOf(['responsible', 'accountable', 'consulted', 'informed']).required('RACI role is required'),
  skills: yup.string().required('Skills are required'),
  availability: yup.number().min(0).max(100).required('Availability is required')
});

const teamSchema = yup.object({
  name: yup.string().required('Team name is required'),
  code: yup.string().required('Team code is required'),
  stage: yup.string().oneOf(['forming', 'storming', 'norming', 'performing', 'adjourning']).required('Stage is required')
});

type MemberFormData = yup.InferType<typeof memberSchema>;
type TeamFormData = yup.InferType<typeof teamSchema>;

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'roles' | 'performance'>('overview');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // State for teams and members
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Frontend Development',
      code: 'FE-001',
      members: ['1', '3'],
      stage: 'performing',
      projects: 3,
      performance: 92,
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Backend Development',
      code: 'BE-001',
      members: ['2'],
      stage: 'norming',
      projects: 2,
      performance: 88,
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'QA Testing',
      code: 'QA-001',
      members: ['4'],
      stage: 'storming',
      projects: 4,
      performance: 75,
      createdAt: new Date()
    }
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: 'Product Owner',
      raciRole: 'accountable',
      status: 'online',
      performance: 95,
      skills: ['React', 'TypeScript', 'Node.js'],
      availability: 100,
      joinedAt: new Date()
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      role: 'Scrum Master',
      raciRole: 'responsible',
      status: 'away',
      performance: 92,
      skills: ['Agile', 'Project Management', 'Facilitation'],
      availability: 80,
      joinedAt: new Date()
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1234567892',
      role: 'Developer',
      raciRole: 'responsible',
      status: 'online',
      performance: 88,
      skills: ['React', 'Python', 'AWS'],
      availability: 90,
      joinedAt: new Date()
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1234567893',
      role: 'Tester',
      raciRole: 'consulted',
      status: 'busy',
      performance: 90,
      skills: ['Testing', 'Automation', 'Cypress'],
      availability: 75,
      joinedAt: new Date()
    }
  ]);

  // Form hooks
  const memberForm = useForm<MemberFormData>({
    resolver: yupResolver(memberSchema),
    defaultValues: {
      availability: 100
    }
  });

  const teamForm = useForm<TeamFormData>({
    resolver: yupResolver(teamSchema)
  });

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

  // CRUD operations for team members
  const handleAddMember = async (data: MemberFormData) => {
    try {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        ...data,
        skills: data.skills.split(',').map(s => s.trim()),
        status: 'online',
        performance: 85,
        joinedAt: new Date()
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      setShowMemberModal(false);
      memberForm.reset();
      toast.success('Team member added successfully');
    } catch (error) {
      toast.error('Failed to add team member');
    }
  };

  const handleUpdateMember = async (data: MemberFormData) => {
    if (!editingMember) return;
    
    try {
      const updatedMember: TeamMember = {
        ...editingMember,
        ...data,
        skills: data.skills.split(',').map(s => s.trim())
      };
      
      setTeamMembers(prev => prev.map(m => m.id === editingMember.id ? updatedMember : m));
      setEditingMember(null);
      memberForm.reset();
      toast.success('Team member updated successfully');
    } catch (error) {
      toast.error('Failed to update team member');
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Team member removed successfully');
    }
  };

  // CRUD operations for teams
  const handleAddTeam = async (data: TeamFormData) => {
    try {
      const newTeam: Team = {
        id: Date.now().toString(),
        ...data,
        members: [],
        projects: 0,
        performance: 80,
        createdAt: new Date()
      };
      
      setTeams(prev => [...prev, newTeam]);
      setShowTeamModal(false);
      teamForm.reset();
      toast.success('Team created successfully');
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleUpdateTeam = async (data: TeamFormData) => {
    if (!editingTeam) return;
    
    try {
      const updatedTeam: Team = {
        ...editingTeam,
        ...data
      };
      
      setTeams(prev => prev.map(t => t.id === editingTeam.id ? updatedTeam : t));
      setEditingTeam(null);
      teamForm.reset();
      toast.success('Team updated successfully');
    } catch (error) {
      toast.error('Failed to update team');
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setTeams(prev => prev.filter(t => t.id !== teamId));
      toast.success('Team deleted successfully');
    }
  };

  // Open edit modals
  const openEditMember = (member: TeamMember) => {
    setEditingMember(member);
    memberForm.reset({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      raciRole: member.raciRole,
      skills: member.skills.join(', '),
      availability: member.availability
    });
    setShowMemberModal(true);
  };

  const openEditTeam = (team: Team) => {
    setEditingTeam(team);
    teamForm.reset({
      name: team.name,
      code: team.code,
      stage: team.stage
    });
    setShowTeamModal(true);
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
            onClick={() => setShowMemberModal(true)}
            icon={UserPlus}
            variant="outline"
            className="bg-surface"
          >
            Add Member
          </Button>
          <Button
            onClick={() => setShowTeamModal(true)}
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Team Overview</h2>
              <Button
                onClick={() => setShowTeamModal(true)}
                icon={Plus}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Team
              </Button>
            </div>
            
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditTeam(team)}
                        className="p-1 text-muted hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1 text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStageColor(team.stage)} mb-4 inline-block`}>
                    {team.stage}
                  </span>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">Members</span>
                      <span className="font-medium text-primary">{team.members.length}</span>
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
                onClick={() => setShowMemberModal(true)}
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
                          {member.phone && (
                            <p className="text-sm text-muted">{member.phone}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditMember(member)}
                            className="p-1 text-muted hover:text-primary transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1 text-muted hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-primary">{member.performance}%</span>
                          </div>
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
                          // Mock RACI assignment logic based on role
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

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowMemberModal(false);
            setEditingMember(null);
            memberForm.reset();
          }} />
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
              <form onSubmit={memberForm.handleSubmit(editingMember ? handleUpdateMember : handleAddMember)}>
                <div className="bg-surface px-6 pt-6">
                  <h3 className="text-lg font-bold text-primary mb-6">
                    {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Name *</label>
                      <input
                        {...memberForm.register('name')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter full name"
                      />
                      {memberForm.formState.errors.name && (
                        <p className="text-error text-sm mt-1">{memberForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Email *</label>
                      <input
                        {...memberForm.register('email')}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email address"
                      />
                      {memberForm.formState.errors.email && (
                        <p className="text-error text-sm mt-1">{memberForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Phone</label>
                      <input
                        {...memberForm.register('phone')}
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Role *</label>
                        <select
                          {...memberForm.register('role')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select role</option>
                          <option value="Product Owner">Product Owner</option>
                          <option value="Scrum Master">Scrum Master</option>
                          <option value="Developer">Developer</option>
                          <option value="Tester">Tester</option>
                          <option value="Designer">Designer</option>
                          <option value="DevOps">DevOps</option>
                        </select>
                        {memberForm.formState.errors.role && (
                          <p className="text-error text-sm mt-1">{memberForm.formState.errors.role.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">RACI Role *</label>
                        <select
                          {...memberForm.register('raciRole')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select RACI</option>
                          <option value="responsible">Responsible</option>
                          <option value="accountable">Accountable</option>
                          <option value="consulted">Consulted</option>
                          <option value="informed">Informed</option>
                        </select>
                        {memberForm.formState.errors.raciRole && (
                          <p className="text-error text-sm mt-1">{memberForm.formState.errors.raciRole.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Skills *</label>
                      <input
                        {...memberForm.register('skills')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter skills separated by commas"
                      />
                      {memberForm.formState.errors.skills && (
                        <p className="text-error text-sm mt-1">{memberForm.formState.errors.skills.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Availability (%) *</label>
                      <input
                        {...memberForm.register('availability', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter availability percentage"
                      />
                      {memberForm.formState.errors.availability && (
                        <p className="text-error text-sm mt-1">{memberForm.formState.errors.availability.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowMemberModal(false);
                      setEditingMember(null);
                      memberForm.reset();
                    }}
                    className="mt-3 sm:mt-0 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowTeamModal(false);
            setEditingTeam(null);
            teamForm.reset();
          }} />
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="relative z-10 inline-block align-bottom bg-surface rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
              <form onSubmit={teamForm.handleSubmit(editingTeam ? handleUpdateTeam : handleAddTeam)}>
                <div className="bg-surface px-6 pt-6">
                  <h3 className="text-lg font-bold text-primary mb-6">
                    {editingTeam ? 'Edit Team' : 'Create Team'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Team Name *</label>
                      <input
                        {...teamForm.register('name')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter team name"
                      />
                      {teamForm.formState.errors.name && (
                        <p className="text-error text-sm mt-1">{teamForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Team Code *</label>
                      <input
                        {...teamForm.register('code')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter team code (e.g., FE-001)"
                      />
                      {teamForm.formState.errors.code && (
                        <p className="text-error text-sm mt-1">{teamForm.formState.errors.code.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Team Stage *</label>
                      <select
                        {...teamForm.register('stage')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select stage</option>
                        <option value="forming">Forming</option>
                        <option value="storming">Storming</option>
                        <option value="norming">Norming</option>
                        <option value="performing">Performing</option>
                        <option value="adjourning">Adjourning</option>
                      </select>
                      {teamForm.formState.errors.stage && (
                        <p className="text-error text-sm mt-1">{teamForm.formState.errors.stage.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingTeam ? 'Update Team' : 'Create Team'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowTeamModal(false);
                      setEditingTeam(null);
                      teamForm.reset();
                    }}
                    className="mt-3 sm:mt-0 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;