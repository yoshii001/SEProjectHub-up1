import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  MapPin,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useMeetings } from '../hooks/useMeetings';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import Button from '../components/UI/Button';
import MeetingModal from '../components/Meetings/MeetingModal';
import { Meeting } from '../types';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

const Meetings: React.FC = () => {
  const { meetings, loading, addMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const { clients } = useClients();
  const { projects } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Check for action parameter to auto-open add modal
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      console.log('🚀 Auto-opening add meeting modal from dashboard');
      setShowAddModal(true);
      // Remove the action parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || meeting.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getProjectTitle = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const formatMeetingDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const handleAddMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      console.log('🚀 Adding new meeting:', meetingData);
      await addMeeting(meetingData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add meeting:', error);
    }
  };

  const handleUpdateMeeting = async (id: string, meetingData: Partial<Meeting>) => {
    try {
      await updateMeeting(id, meetingData);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Failed to update meeting:', error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(id);
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  const handleJoinMeeting = (meetingUrl: string) => {
    console.log('🔗 Joining meeting:', meetingUrl);
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
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
          <h1 className="text-3xl font-bold text-primary text-shadow-sm">Meetings</h1>
          <p className="text-secondary mt-2">
            Schedule and manage client meetings and project discussions
          </p>
        </div>
        <Button
          onClick={() => {
            console.log('🚀 Opening add meeting modal');
            setShowAddModal(true);
          }}
          icon={Plus}
          className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
        >
          Schedule Meeting
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search meetings..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-primary">
                      {meeting.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>
                  <p className="text-secondary mb-4">
                    {meeting.description}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setEditingMeeting(meeting)}
                    className="p-2 text-muted hover:text-link transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label="Edit meeting"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMeeting(meeting.id)}
                    className="p-2 text-muted hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    aria-label="Delete meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-secondary">
                  <Calendar className="w-4 h-4" />
                  <span>{formatMeetingDate(new Date(meeting.date))}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(meeting.date), 'h:mm a')} ({meeting.duration} min)
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary">
                  <Users className="w-4 h-4" />
                  <span>{getClientName(meeting.clientId)}</span>
                </div>
                {meeting.projectId && (
                  <div className="flex items-center space-x-2 text-sm text-secondary">
                    <FileText className="w-4 h-4" />
                    <span>{getProjectTitle(meeting.projectId)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  {meeting.meetingUrl && meeting.status === 'scheduled' && (
                    <button 
                      onClick={() => handleJoinMeeting(meeting.meetingUrl!)}
                      className="flex items-center space-x-2 text-link hover:text-link-hover text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {meeting.notes && (
                    <button className="flex items-center space-x-2 text-secondary hover:text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1">
                      <FileText className="w-4 h-4" />
                      <span>View Notes</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {meeting.meetingUrl ? 'Online Meeting' : 'In Person'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-primary">
              No meetings found
            </h3>
            <p className="text-secondary max-w-md mx-auto">
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by scheduling your first meeting'
              }
            </p>
            <Button
              onClick={() => {
                console.log('🚀 Opening add meeting modal from empty state');
                setShowAddModal(true);
              }}
              icon={Plus}
              className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
            >
              {searchTerm || selectedStatus !== 'all'
                ? 'Schedule New Meeting'
                : 'Schedule First Meeting'
              }
            </Button>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <MeetingModal
          isOpen={showAddModal}
          onClose={() => {
            console.log('🔄 Closing add meeting modal');
            setShowAddModal(false);
          }}
          onSubmit={handleAddMeeting}
          clients={clients}
          projects={projects}
        />
      )}

      {editingMeeting && (
        <MeetingModal
          isOpen={!!editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onSubmit={(data) => handleUpdateMeeting(editingMeeting.id, data)}
          meeting={editingMeeting}
          clients={clients}
          projects={projects}
        />
      )}
    </div>
  );
};

export default Meetings;